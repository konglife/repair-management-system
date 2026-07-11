# C1 — EntityPicker (deep module) — สรุปการออกแบบ

> ผลจาก `/grilling` หลัง architecture review (candidate C1, badge **Strong**)
> คำศัพท์ตาม `/codebase-design`: module / interface / depth / seam / adapter / leverage / locality
> อ้างอิง: `docs/architecture-review-20260705.html` (ใบ C1) · `CONTEXT.md` → EntityPicker · pain #1

---

## ปัญหา (ปัจจุบัน)

- **Product/Customer picker ใช้ยาก** = pain #1 ของเจ้าของร้าน (CONTEXT.md) — pattern เดียวกันเจอ 3 ที่ (Purchase/Sales/Repair)
- มี picker 2 ตัวที่ซ้ำกัน ~95%: `ProductAutocomplete` (~192 บรรทัด) + `PartsAutocomplete` (~188 บรรทัด)
- **Customer picker ไม่มีอยู่จริง** — แค่ raw `<Select>` + `.map()` แปะ 2 หน้า (sales/repairs), ไม่มี search/filter
- **ไม่มี `Part` model** — "Parts" กับ "Products" คือ table `Product` ตัวเดียวกัน ต่างแค่ display field (`averageCost` vs `salePrice`) + filter `qty>0` + debounce

→ 3 call site, 3 รูปร่าง → picker bug กระจาย แก้ซ้ำ

---

## การออกแบบ (หลัง grill)

### module

`EntityPicker<T>` — generic deep module · ไฟล์ `src/components/ui/EntityPicker.tsx`

### interface (เล็ก — ผ่าน deletion test)

```
items: T[]                   // caller ส่ง list เข้า (picker ไม่ยุ่ง DB)
value?: string
onValueChange(id: string)
label(item: T): ReactNode    // caller กำหนด field ที่โชว์
filter(items: T[], term: string): T[]   // caller กำหนดเงื่อนไขกรอง
placeholder?: string
```

### depth อยู่ตรงไหน

พฤติกรรม dropdown engine ทั้งหมดซ่อนหลัง interface เดียว — caller ไม่เห็น:

- open/close state + click-outside + Esc ปิด
- กรองขณะพิมพ์ + debounce **300ms รวม** (ตอนนี้สินค้า 0ms / อะไหล่ 300ms ไม่สม่ำเสมอ)
- คีย์บอร์ด: ↑↓ เลื่อน highlight, Enter เลือก, Esc ปิด
- empty state ("ไม่พบ..." / "ไม่มีสินค้าในสต็อก")
- selected display + ปุ่มล้าง (X) — เหมือนกันทุกหน้า

### adapters ที่ seam (2 ตัว — ไม่ใช่ 3)

> review เดิมเขียน "three thin adapters" → grill แก้: Part = Product variant (table เดียวกัน) จึงไม่มี PartPicker

- **`ProductPicker`** — label โชว์ `name + ราคา + stock`; filter ตาม context
  - sales/repairs: กรอง out-of-stock ออก
  - stock (purchase): โชว์ทั้งหมด + ต่อชื่อ unit ต่อท้าย (เคส "Record New Purchase")
- **`CustomerPicker`** — label โชว์ `name + phone`; ไม่กรอง
  - **3A: แค่ค้นหา** ลูกค้าเดิม — ไม่มี "สร้างใหม่ในที่" (ทำทีหลังเป็น bonus)

### migration (4A — deletion test ผ่านจริง)

- ย้าย **sales + repairs + stock** มาใช้ EntityPicker ทั้ง 3 หน้า
- **ลบ** `src/components/ui/ProductAutocomplete.tsx` + `src/components/ui/PartsAutocomplete.tsx`
- picker จริงๆ เหลือ 1 module (มิใช่ 4)

---

## decision log (จาก grill)

| #   | คำถาม                                | ตัดสินใจ                                                                                                             |
| --- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 1   | deep module รูปร่างไหน               | **ทาง A** — generic `EntityPicker<T>` + thin adapter (ไม่ใช่ primitive กลาง)                                         |
| 1.1 | Part เป็น adapter ของตัวเอง?         | **ไม่** — Part = Product variant (table เดียวกัน)                                                                    |
| 2   | เก็บข้อมูลเอง หรือ รับ list?         | **2A** — รับ `items[]` prop (caller fetch, picker ไม่ยุ่ง tRPC/DB)                                                   |
| 3   | Customer: ค้นหา หรือ สร้างใหม่ในที่? | **3A** — แค่ค้นหา (ปิด pain; inline-create ทีหลัง)                                                                   |
| 4   | ย้ายกี่หน้า?                         | **4A** — ทั้ง 3 หน้าทีเดียว + ลบ picker เก่า                                                                         |
| 5   | คีย์บอร์ด?                           | **5B** — เพิ่ม ↑↓/Enter/Esc (repair-first shop บันทึก batch → ลด friction หนัก)                                      |
| 6   | ตรวจยังไงว่าเสร็จ?                   | **6A+6B** — unit test (filter/keyboard/select/clear/empty/out-of-stock) + verify browser จริง 3 หน้า ผ่าน chrome CDP |

---

## leverage / locality ที่ได้

- **leverage**: 1 interface คลุม 3+ call site (sales/repairs/stock และอนาคต)
- **locality**: picker bug กระจุกที่เดียว แก้ครั้งเดียวกระจาย 3 จุด
- Customer ได้ search ฟรี — ปิด pain #1 โดยตรง
- ทดสอบได้ไม่ต้อง DB (2A) — interface = test surface

## deletion test

ลบ adapter ออก → caller ต้องเขียน dropdown logic เองใหม่ = **concentrate ไม่ move** → module deep จริง

---

## ขอบเขตที่ **ไม่** ทำใน C1 (สำหรับ issue อื่น)

- backend search/pagination → ย้ายไป **C8** (ข้อมูลยังน้อย frontend filter พอ)
- Customer inline-create → bonus ทีหลัง
- ไม่เปลี่ยน data model (Part ยุบรวม Product เป็นเรื่อง UI เท่านั้น ไม่แตะ schema)

## ความเสี่ยง

- ต่ำ — ทำบน `develop` (prod ค้าง deploy ~10 เดือน ไม่กระทบ). UI เท่านั้น ไม่แตะ DB/business logic
- migration 3 หน้าพร้อมกัน → ต้อง verify browser จริงทุกหน้า (6B)

---

_หมายเหตุ: เอกสารนี้เป็น input สำหรับ `/to-prd` (เปลี่ยนเป็น GitHub Issue). ยังไม่ implement._
