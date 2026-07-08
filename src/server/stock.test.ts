import { describe, it, expect, jest } from "@jest/globals";
import type { Prisma, Product } from "@prisma/client";

import { validateAndDeductStock } from "./stock";

/**
 * Mock tx client ตามรูปที่ validateAndDeductStock ใช้จริง — เฉพาะ product.findMany + product.update
 * (repo ยังไม่มี pattern mock Prisma ที่สมบูรณ์ → inject mock tx ตรงเข้าฟังก์ชัน = boundary ที่สะอาด)
 */
function createMockTx(products: Product[]) {
  // เก็บสต็อกคงเหลือแยก เพื่อจำลอง decrement และให้ assert ได้
  const stock: Record<string, number> = {};
  for (const p of products) stock[p.id] = p.quantity;

  const updates: Array<{ id: string; decrement: number }> = [];

  const tx = {
    product: {
      findMany: jest.fn(
        async ({ where }: { where: { id: { in: string[] } } }) => {
          const ids = new Set(where.id.in);
          return products.filter((p) => ids.has(p.id));
        }
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: { quantity: { decrement: number } };
        }) => {
          updates.push({ id: where.id, decrement: data.quantity.decrement });
          stock[where.id] -= data.quantity.decrement;
          return products.find((p) => p.id === where.id)!;
        }
      ),
    },
  };

  return { tx: tx as unknown as Prisma.TransactionClient, updates, stock };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Screen",
    quantity: 10,
    averageCost: 60,
    salePrice: 100,
    categoryId: "cat1",
    unitId: "u1",
    ...overrides,
  } as Product;
}

describe("validateAndDeductStock", () => {
  it("happy path: คืน Map และ decrement สต็อกทุก item", async () => {
    const p1 = makeProduct({ id: "p1", quantity: 10 });
    const p2 = makeProduct({ id: "p2", name: "Battery", quantity: 5 });
    const { tx, updates, stock } = createMockTx([p1, p2]);

    const result = await validateAndDeductStock(tx, [
      { productId: "p1", quantity: 3 },
      { productId: "p2", quantity: 2 },
    ]);

    expect(result).toBeInstanceOf(Map);
    expect(result.get("p1")).toBe(p1);
    expect(result.get("p2")).toBe(p2);
    // decrement แยกตามลำดับ item
    expect(updates).toEqual([
      { id: "p1", decrement: 3 },
      { id: "p2", decrement: 2 },
    ]);
    expect(stock).toEqual({ p1: 7, p2: 3 });
  });

  it("สินค้าหาย (findMany ได้น้อยกว่า items) → throw BAD_REQUEST 'not found'", async () => {
    const p1 = makeProduct({ id: "p1" });
    const { tx, updates } = createMockTx([p1]);

    await expect(
      validateAndDeductStock(tx, [
        { productId: "p1", quantity: 1 },
        { productId: "ghost", quantity: 1 },
      ])
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "One or more products not found",
    });

    // validate พังก่อน → ห้าม decrement อะไรเลย
    expect(updates).toEqual([]);
  });

  it("สต็อกไม่พอ → throw BAD_REQUEST พร้อมชื่อสินค้า/จำนวน (message เดิม)", async () => {
    const p1 = makeProduct({ id: "p1", name: "Screen", quantity: 2 });
    const { tx, updates } = createMockTx([p1]);

    await expect(
      validateAndDeductStock(tx, [{ productId: "p1", quantity: 5 }])
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Insufficient stock for Screen. Available: 2, Requested: 5",
    });

    expect(updates).toEqual([]);
  });

  it("สต็อกพอดี (quantity === requested) → ผ่าน และ decrement เหลือ 0", async () => {
    const p1 = makeProduct({ id: "p1", quantity: 4 });
    const { tx, stock } = createMockTx([p1]);

    await validateAndDeductStock(tx, [{ productId: "p1", quantity: 4 }]);

    expect(stock).toEqual({ p1: 0 });
  });

  it("productId ซ้ำใน list → ตกที่ length check (พฤติกรรมเดิม ไม่ dedupe)", async () => {
    const p1 = makeProduct({ id: "p1", quantity: 10 });
    const { tx, updates } = createMockTx([p1]);

    await expect(
      validateAndDeductStock(tx, [
        { productId: "p1", quantity: 2 },
        { productId: "p1", quantity: 3 },
      ])
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "One or more products not found",
    });

    expect(updates).toEqual([]);
  });

  it("ข้ามไปที่ตัวที่สองเจอสต็อกไม่พอ → throw ที่ตัวนั้น ไม่ decrement อันก่อน", async () => {
    const p1 = makeProduct({ id: "p1", quantity: 10 });
    const p2 = makeProduct({ id: "p2", quantity: 1 });
    const { tx, updates } = createMockTx([p1, p2]);

    await expect(
      validateAndDeductStock(tx, [
        { productId: "p1", quantity: 1 },
        { productId: "p2", quantity: 5 },
      ])
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    // validate ทั้งหมดทำก่อน decrement → ไม่มี update เกิดขึ้น
    expect(updates).toEqual([]);
  });

  it("items เป็น array เปล่า → คืน Map เปล่า ไม่ throw", async () => {
    const { tx } = createMockTx([]);

    const result = await validateAndDeductStock(tx, []);

    expect(result.size).toBe(0);
  });
});
