# C3 — Stock deduction module (deep module) — สรุปการออกแบบ

> ผลจาก `/grilling` หลัง architecture review (candidate C3, badge **Strong**)
> คำศัพท์ตาม `/codebase-design`: module / interface / depth / seam / locality
> อ้างอิง: `docs/architecture-review-20260705-th.html` §C3 · GitHub Issue #3

---

## ปัญหา (ปัจจุบัน)

loop "validate แล้ว decrement สต็อก" เขียนซ้ำกันเกือบทุกบรรทัดระหว่าง `sale.create` กับ `repair.create` (~58 บรรทัด):

- `src/server/api/routers/sale.ts` ~137–167 (validate) + ~222–231 (deduct)
- `src/server/api/routers/repair.ts` ~122–152 (validate) + ~207–216 (deduct)

ที่จริงมี **2 บล็อกซ้ำ** (ไม่ใช่บล็อกเดียว):

| บล็อก           | ทำอะไร                                                                           | เหมือนกัน?      |
| --------------- | -------------------------------------------------------------------------------- | --------------- |
| **A. validate** | `findMany` products + check ครบ + วนเช็คมีจริง + เช็คสต็อกพอ → throw `TRPCError` | ✅ แทบทุกบรรทัด |
| **B. deduct**   | for-loop `product.update` decrement                                              | ✅ เหมือนเป๊ะ   |

→ ถ้า logic สต็อกมีบั๊ก ต้องแก้ 2 ที่ → เสี่ยง drift / ลืม

ส่วนที่ **ต่างกัน** (จึงต้องอยู่ใน router): การคำนวณ financial — sale ใช้ `salePrice + averageCost`, repair ใช้ `averageCost` อย่างเดียว (ความหมายทางธุรกิจต่างกัน)

---

## การออกแบบ (หลัง grill)

### module

`validateAndDeductStock` — server-domain module · ไฟล์ `src/server/stock.ts` (+ `stock.test.ts`)

### interface

```ts
type StockDeductionItem = { productId: string; quantity: number };

export async function validateAndDeductStock(
  tx: Prisma.TransactionClient,
  items: StockDeductionItem[]
): Promise<Map<string, Product>>; // key = productId, value = Prisma Product เต็ม
```

### depth อยู่ตรงไหน

พฤติกรรม "validate + mutate stock" ทั้งหมดซ่อนหลัง interface เดียว — caller ไม่เห็น:

1. `findMany` products where id in items
2. check `products.length === items.length` → throw `TRPCError` BAD_REQUEST `"One or more products not found"`
3. loop ทุก item: find product + เช็คมีจริง + `quantity >= item.quantity` → throw `TRPCError` BAD_REQUEST `"Insufficient stock for X. Available: N, Requested: M"` (message เดิมเป๊ะ)
4. loop decrement ทุก item (`product.update` decrement) — **ไม่ dedupe** (productId ซ้ำ decrement แยก = รักษาพฤติกรรมเดิม)
5. return `Map<id, Product>` (product เต็มจาก `findMany` ไม่มี `select`)

### ที่ seam (router 2 ตัว)

`sale.create` / `repair.create` แทนบล็อก validate + deduct ด้วย:

```ts
const products = await validateAndDeductStock(tx, items);
```

ลูปคำนวณ financial ใช้ `products.get(id)!` แทน `products.find(...)!`
→ **`!` ยังอยู่** (Map.get คืน `Product | undefined` เสมอ) แต่ตอนนี้ justified เพราะ validate ผ่านแล้ว = เจอแน่นอน
ประโยชน์จริงของ Map คือ **O(1) lookup + ความหมายชัด (lookup ตาม id)** ไม่ใช่ลบ assertion

> (แก้หลัง implement: design ต้นฉบับเขียน "ลบ `!` ได้" = overclaim — Map ไม่ได้ลบ `!` จริง)

- **customer validation เหลือใน router** (ไม่ใช่เรื่องสต็อก → นอก scope C3)

### ลำดับใน tx (เปลี่ยนจากเดิม — behavior-safe)

```
validateAndDeductStock(tx, items)   ← validate + deduct มาก่อน
→ validate customer
→ calc financial
→ create record (sale/repair)
```

> **order change** ที่ต้องรับรู้: เดิม deduct เกิด _หลัง_ create record ตอนนี้ย้ายมา _ก่อน_ create
> ปลอดภัยเพราะอยู่ใน tx เดียวกัน ทั้งคู่ rollback ด้วยกัน — behavior-equivalent สำหรับ atomicity

---

## decision log (จาก grill)

| #   | คำถาม                              | ตัดสินใจ                                                                      |
| --- | ---------------------------------- | ----------------------------------------------------------------------------- |
| 1   | scope: รวม validate+deduct หรือแยก | **A — รวม** เป็น module เดียว (ตรง intent issue/§C3 + กัน drift)              |
| 2   | ค่าคืนรูปร่างไหน                   | **Map<string, Product>** O(1) lookup + ความหมายชัด (`!` ยังอยู่แต่ justified) |
| 3   | ประเภท error                       | **A — โยน `TRPCError` ต่อ** (minimal, message/code เดิม, ไม่ speculative)     |
| 4   | ตำแหน่งไฟล์                        | **A — `src/server/stock.ts`** ตามบรรทัดฐาน `src/server/auth.ts`               |
| 5   | ชื่อ module                        | **A — `validateAndDeductStock`** สื่อ honest ว่าทำทั้ง validate + mutate      |
| 6   | item type ที่รับ                   | **A — `{ productId; quantity }[]`** รับ Zod shape ตรง ไม่ต้องแปลง             |
| 7   | customer validation ย้ายไหม        | **A — เหลือใน router** (นอก scope C3; ซ้ำจริงเป็นปัญหา เปิด issue ใหม่)       |
| 8   | productId ซ้ำใน list               | **A — รักษาเดิม** ไม่ dedupe (behavior-preserving refactor)                   |
| 9   | type Product ที่คืน                | **A — Prisma Product เต็ม** (findMany ไม่มี select เดิม, minimal transform)   |
| 10  | test                               | **A — เพิ่ม `stock.test.ts`** คู่ module ตาม pattern `auth.ts`/`auth.test.ts` |

---

## leverage / locality ที่ได้

- **locality**: การเปลี่ยนแปลงสต็อกทุกครั้งมองเห็นใน module เดียว — บั๊กสต็อกแก้ที่เดียวกระจาย 2 router
- **leverage**: 1 interface คลุม 2 caller (และ caller ที่ 3 ในอนาคต)
- ลบได้ ~58 บรรทัดซ้ำ
- ลด `!` assertion (สมมติฐานซ่อนเดิม → type บังคับ handle)

## deletion test

เอา module ออก → router ต้องเขียน validate+deduct loop เองใหม่ใน 2 ที่ = **concentrate ไม่ move** → module deep จริง

---

## เกณฑ์สำเร็จ (verifiable)

- `npm test` เขียว (suite เดิม + `stock.test.ts` ใหม่)
- `npm run lint` + `tsc` สะอาด
- `sale.test.ts` / `repair.test.ts` ยังเขียว (integration guard)
- ลบได้ ~58 บรรทัดซ้ำ
- ทำบน `develop` (branch `feature/c3-stock-module`) ไม่แตะ `main`/prod

---

## ขอบเขตที่ **ไม่** ทำใน C3

- customer validation ซ้ำ → issue ใหม่ (นอกเรื่องสต็อก)
- aggregation/de-dupe productId → เปลี่ยน behavior = เรื่องอื่น (ต้องมี test คุมพฤติกรรมใหม่)
- ไม่เปลี่ยน error message/code (test เดิมต้องผ่าน)
- ไม่แยก domain error ออกจาก TRPCError (YAGNI ยังไม่มี caller นอก tRPC)

## ความเสี่ยง

- ต่ำ — pure refactor behavior-preserving, อยู่ใน tx เดียวกัน
- order change (deduct มาก่อน create) → behavior-safe แต่ต้อง verify ผ่าน test เดิม
