import { describe, it, expect } from "@jest/globals";

import { salesProfit, repairMargin, grossProfit } from "./financials";

/**
 * กล่องสูตรกำไร canonical — ดู `docs/c4-financials-design.md`
 *
 * สูตรเปลือย ไม่ guard ลบ ไม่ round (คืนตามจริง) — เทสตรงตัวเลขล้วน
 */

describe("salesProfit", () => {
  it("รายได้ − ต้นทุน", () => {
    expect(salesProfit(50, 20)).toBe(30);
  });

  it("รายได้ 0 ต้นทุน 0 → 0", () => {
    expect(salesProfit(0, 0)).toBe(0);
  });

  it("ขาดทุน → ลบตามจริง (ไม่ guard)", () => {
    expect(salesProfit(10, 30)).toBe(-20);
  });
});

describe("repairMargin", () => {
  it("totalCost − partsCost", () => {
    expect(repairMargin(100, 30)).toBe(70);
  });

  it("totalCost === partsCost → 0", () => {
    expect(repairMargin(50, 50)).toBe(0);
  });

  it("อะไหล่แพงกว่ายอดจ่าย → ลบตามจริง (ไม่ guard)", () => {
    expect(repairMargin(80, 100)).toBe(-20);
  });
});

describe("grossProfit", () => {
  it("กำไรขาย + กำไรซ่อม", () => {
    expect(grossProfit(30, 70)).toBe(100);
  });

  it("กำไรซ่อมติดลบ → หักออกจากกำไรขาย", () => {
    expect(grossProfit(50, -20)).toBe(30);
  });
});
