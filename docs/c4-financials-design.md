# C4 — Financials module (รวมสูตรกำไรเข้ากล่องเดียว) — สรุปการออกแบบ

> ผลจาก `/grilling` หลัง architecture review (candidate C4, badge **Strong** · คู่กับ C2)
> คำศัพท์ตาม `/codebase-design`: module / interface / depth / seam / locality
> อ้างอิง: `docs/architecture-review-20260705-th.html` §C4 · `docs/adr/0001-repair-pricing-residual-margin.md`

---

## ปัญหา (ปัจจุบัน)

"บวก Float แล้วลบ" คิดกำไรเขียนซ้ำในหลาย caller — แถมสูตรกำไรซ่อมของ dashboard กับ reports **เขียนต่างกัน** (drift):

| Caller                      | ที่อยู่                | สูตรกำไรซ่อม                                                               |
| --------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| `dashboard.getSummary`      | `dashboard.ts:119-156` | `repairProfit = _sum.laborCost` ← อ่านฟิลด์ `laborCost` ตรงๆ               |
| `reports.getMonthlySummary` | `reports.ts:137-141`   | `repairProfit = repairIncome − repairCost` (= `Σ totalCost − Σ partsCost`) |

> ⚠️ ทั้งสองสูตร **ออกเลขเท่ากัน** เพราะ `laborCost := totalCost − partsCost` (คำนวณตอน `repairs.create` — `repair.ts:132`) → เท่ากัน**โดยบังเอิญ** ไม่ใช่เพราะเขียนเหมือนกัน. ถ้าวันหนึ่งเปลี่ยนนิยาม `laborCost` → dashboard จะพังทันทีโดยไม่มีใครรู้ตัว

ปัญหาแท้จริง = **drift ของสูตร + coupling กับชื่อฟิลด์ `laborCost` ที่หลอก** (semantic จริง = margin ตาม ADR-0001 ไม่ใช่ค่าแรงล้วน) — ไม่ใช่ตัวเลขผิด

---

## การออกแบบ (หลัง grill)

### ข้อตัดสินใจราก (7 ข้อ จาก grill)

| #   | ข้อตกลง                                                                               | เหตุผลสั้น                                                                                                          |
| --- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Q1  | **scope = แค่ "รวมสูตร"** ไม่ยุ่ง Float/Decimal/round/format                          | เรื่อง representation = C9 (MAJOR · แตะ DB); C4 ปลอดภัยทำก่อน                                                       |
| Q2  | นิยามกำไรซ่อม = **`totalCost − partsCost`** (ทาง B) — ไม่อ่านฟิลด์ `laborCost`        | อ่านสูตรรู้เรื่องทันที; ปลด coupling จากชื่อฟิลด์ที่หลอก                                                            |
| Q3  | กล่อง = **pure function รับค่าที่ sum แล้ว** · ที่อยู่ `src/server/financials.ts`     | แดชบอร์ดใช้ `_sum` (DB aggregate) · รายงานวนลูปเอง — ทั้งสองส่งค่า sum เข้ากล่องได้; ทำตามรอย `src/server/dates.ts` |
| Q4  | call sites = **① dashboard ② reports ③ sale.getById** — ปล่อย ④ `repair.getAnalytics` | ④ ไม่คิด profit (เผยแค่ `Σ laborCost` + `Σ partsCost`) เอาเข้ากล่องไม่ได้คุณค่า                                     |
| Q5  | ชื่อในโค้ด/กล่อง = **`margin`** (ตรงตัว) — ฟิลด์ DB ยัง `laborCost`                   | ปิดจุดสับสนจากต้นเหตุ; rename DB เก็บไว้ทำ C9 ทีเดียว                                                               |
| Q6  | **ไม่จัดการกำไรติดลบ** ใน C4                                                          | เป็นเรื่อง data-entry guard (C2-remain, ยังไม่ได้ทำ) ไม่ใช่หน้าที่กล่องคำนวณ                                        |
| Q7  | verify = **unit test กล่อง + เช็คเลขก่อน/หลังเท่ากัน** (parity)                       | refactor ต้องไม่เปลี่ยนผลลัพธ์; pure function → unit test ง่าย                                                      |

### Interface (deep module)

```ts
// src/server/financials.ts

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
```

**สิ่งที่ module รับผิดชอบ (ทำลึก):**

- นิยาม "กำไรของ repair คืออะไร" / "กำไรของ sale คืออะไร" / "กำไรรวม" ไว้ที่เดียว
- ทำงานบน `number` ธรรมดา (ยังไม่ยุ่ง round/format — นั่น C9)

**สิ่งที่ไม่ทำ (เหลือให้ caller):**

- การ sum เอง — caller บวก (DB `_sum` หรือ JS `.reduce`) แล้วส่งค่าเข้ามา (Q3: ไม่บังคับวิธี sum)
- guard ค่าติดลบ (Q6)
- round/format/parse (C9)

### Deletion test (ทำไมจึง deep จริง ไม่ใช่ move)

ถ้าเอา module ออก → 3 caller ต้องเขียนสูตรกำไรใหม่เอง และกลับไป drift (`laborCost` vs `totalCost−partsCost`) อีก = concentrate ไม่ได้ย้ายไปที่อื่น ✓

### Locality

นิยามสูตรกำไรทั้งหมดอยู่ในไฟล์เดียว (`src/server/financials.ts`) — caller แค่ส่งค่า sum เข้ามา

---

## แผนผัง call sites (ก่อน/หลัง)

| Caller                        | ที่อยู่                | ก่อน                                                                                                    | หลัง                                                                                                                                            |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ① `dashboard.getSummary`      | `dashboard.ts:119-156` | `_sum: { totalCost, laborCost }` · `repairProfit = laborCost` · `grossProfit = salesProfit + laborCost` | `_sum: { totalCost, partsCost }` · `repairProfit = repairMargin(totalCost, partsCost)` · `grossProfit = grossProfit(salesProfit, repairProfit)` |
| ② `reports.getMonthlySummary` | `reports.ts:133-141`   | `repairProfit = repairIncome − repairCost` (JS reduce) · `grossProfit = salesProfit + repairProfit`     | `salesProfit = salesProfit(income, cost)` · `repairProfit = repairMargin(totalCost, partsCost)` · `grossProfit = grossProfit(...)`              |
| ② `reports` ต่อแถว sale       | `reports.ts:171`       | `grossProfit = sale.totalAmount − sale.totalCost`                                                       | `grossProfit = salesProfit(sale.totalAmount, sale.totalCost)`                                                                                   |
| ③ `sale.getById`              | `sale.ts:84-90`        | `grossProfit = sale.totalAmount − sale.totalCost`                                                       | `grossProfit = salesProfit(sale.totalAmount, sale.totalCost)`                                                                                   |
| ~~④ `repair.getAnalytics`~~   | `repair.ts:201-208`    | (ไม่แตะ) — เผย `Σ laborCost` + `Σ partsCost` ไม่คิด profit                                              | —                                                                                                                                               |

> **เปลี่ยนแปลงที่ dashboard สำคัญ:** เลิกอ่าน `_sum.laborCost` มาเป็น `_sum.partsCost` แทน (เพื่อเข้าสูตร `repairMargin = totalCost − partsCost`) — Prisma aggregate ยังรวดเร็วเท่าเดิม (คอลัมน์เดียวกัน)

---

## ขั้นตอน implementation (incremental)

| #   | งาน                                                                | verify                                                                             |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 1   | สร้าง `src/server/financials.ts` + `src/server/financials.test.ts` | unit test กล่องเขียว                                                               |
| 2   | ดัดแปลง ① `dashboard.getSummary`                                   | dashboard ยังคืน key เดิม (`salesProfit`/`repairProfit`/`grossProfit`) ค่าเท่าเดิม |
| 3   | ดัดแปลง ② `reports.getMonthlySummary` (รวมต่อแถว)                  | reports ค่าเท่าเดิม                                                                |
| 4   | ดัดแปลง ③ `sale.getById`                                           | sale ค่าเท่าเดิม                                                                   |
| 5   | `npm test` ทั้งหมด + tsc + lint                                    | ทุกอย่างเขียว                                                                      |
| 6   | parity check บน dev DB (โคลนจาก prod)                              | เลขกำไร dashboard/reports ก่อน = หลัง เป๊ะ                                         |

**`financials.test.ts` ครอบ:**

- `salesProfit(50, 20)` → 30 · `salesProfit(0, 0)` → 0
- `repairMargin(100, 30)` → 70 · `repairMargin(50, 50)` → 0 · `repairMargin(80, 100)` → −20 (คืนลบตามจริง ไม่ guard)
- `grossProfit(30, 70)` → 100

---

## ขอบเขต / ไม่ขอบ

**ในขอบ:**

- `src/server/financials.ts` + `financials.test.ts` (ใหม่)
- 3 call sites: dashboard.getSummary · reports.getMonthlySummary · sale.getById
- CONTEXT.md module terms + `docs/c4-financials-design.md` (ไฟล์นี้)

**นอกขอบ:**

- ❌ Money type / Float→Decimal / round-format-parse = **C9** (MAJOR · แตะ DB)
- ❌ guard กำไรติดลบ = **C2-remain** (data-entry guard · ยังไม่ได้ทำ)
- ❌ rename ฟิลด์ DB `laborCost` → `margin` = C9
- ❌ `repair.getAnalytics` (④ ไม่คิด profit)
- ❌ DB / migration

---

## ความปลอดภัยของ DB

- **ไม่แตะ DB เลย** — server logic ล้วน (pure function + เปลี่ยนแค่สูตรใน router)
- ตรงกฎเหล็กข้อ 2 (ห้ามแตะ prod)
- ⚠️ ความเสี่ยงเดียว = refactor แล้วเลขเปลี่ยนโดยไม่ตั้งใจ → กันด้วย parity check (ขั้น 6) + unit test

---

## วิธี verify ตอนจบ

- `npm test` เขียวทุก suite (รวม `financials.test.ts` ใหม่)
- `tsc` + `lint` สะอาด
- **parity check** บน dev DB (โคลนจาก prod แล้ว = ข้อมูลจริงเยอะ): เก็บเลข `salesProfit`/`repairProfit`/`grossProfit` จาก dashboard + reports ก่อนแก้ → หลังแก้ต้อง **เท่ากันเป๊ะ**
- browser-verify ผ่าน chrome-devtools MCP + CDP: หน้า dashboard/reports โชว์เลขเดิม (ไม่ regress)
