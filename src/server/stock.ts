import { TRPCError } from "@trpc/server";
import type { Prisma, Product } from "@prisma/client";

/**
 * รายการสินค้าที่จะตัดสต็อก — shape เดียวกับ Zod input ของ sale.items / repair.usedParts
 * จึงส่งตรงจาก router ได้โดยไม่ต้องแปลง
 */
export type StockDeductionItem = {
  productId: string;
  quantity: number;
};

/**
 * Deep module สำหรับ "ตรวจสต็อกแล้วตัดทันที" — รวม logic ที่ซ้ำกันระหว่าง sale.create / repair.create
 *
 * ทำภายใน transaction client ที่ส่งเข้ามา (caller เป็นเจ้าของ tx) จึง rollback พร้อมกัน
 * คืน Map<productId, Product> ให้ caller เอาไปคำนวณ financial (ราคา/ต้นทุนต่างกันตามบริบท)
 *
 * @throws TRPCError BAD_REQUEST — สินค้าหาย/สต็อกไม่พอ
 */
export async function validateAndDeductStock(
  tx: Prisma.TransactionClient,
  items: StockDeductionItem[]
): Promise<Map<string, Product>> {
  // ดึงสินค้าทั้งหมดที่เกี่ยวข้องมาก่อน
  const products = await tx.product.findMany({
    where: {
      id: { in: items.map((item) => item.productId) },
    },
  });

  // เช็คว่าสินค้าครบทุกตัว (ถ้า productId ซ้ำกันใน items จะตกที่นี่ เพราะ findMany dedupe)
  if (products.length !== items.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "One or more products not found",
    });
  }

  const productMap = new Map<string, Product>();
  for (const product of products) {
    productMap.set(product.id, product);
  }

  // ตรวจสต็อกพอทุก item (product มีจริงแน่นอน — length check ด้านบกการันตีแล้ว)
  for (const item of items) {
    const product = productMap.get(item.productId)!;
    if (product.quantity < item.quantity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
      });
    }
  }

  // ตัดสต็อกทีละ item (กรณี productId ซ้ำตกที่ length check ตั้งแต่ต้น จึงไม่มี dedupe ที่นี่)
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: {
        quantity: {
          decrement: item.quantity,
        },
      },
    });
  }

  return productMap;
}
