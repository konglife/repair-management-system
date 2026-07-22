/**
 * นิยามสูตรกำไร canonical — single source ที่เดียว
 * ใช้ร่วมระหว่าง dashboard / reports / sale routers
 *
 * ทำงานบน `number` ธรรมดา (ยังไม่ยุ่ง round/format/Decimal — นั่น C9)
 * caller บวก (DB `_sum` หรือ JS `.reduce`) แล้วส่งค่า sum เข้ามา (ไม่บังคับวิธี sum)
 *
 * ดู design doc: `docs/c4-financials-design.md` · ADR-0001 (repair pricing = residual margin)
 */

/**
 * กำไรงานขาย = รายได้ − ต้นทุน
 * ใช้ทั้ง: กำไรรวมงานขาย (Σ) และ กำไรต่อบิล (sale.getById / reports ต่อแถว)
 */
export function salesProfit(income: number, cost: number): number {
  return income - cost;
}

/**
 * กำไรงานซ่อม (margin) = ยอดที่ลูกค้าจ่าย − ต้นทุนอะไหล่
 * = totalCost − partsCost (ห้ามอ่านจากฟิลด์ `laborCost` ตรงๆ — ดู Q2 + ADR-0001)
 * คืนค่าตามจริง ลบก็ลบ (ไม่ guard — ดู Q6)
 */
export function repairMargin(totalCost: number, partsCost: number): number {
  return totalCost - partsCost;
}

/**
 * กำไรรวม = กำไรขาย + กำไรซ่อม
 */
export function grossProfit(
  salesProfitValue: number,
  repairMarginValue: number
): number {
  return salesProfitValue + repairMarginValue;
}
