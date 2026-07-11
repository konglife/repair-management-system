# Repair Shop Back-Office

ระบบบริหารหลังร้านสำหรับร้านซ่อมมอไซค์และเครื่องตัดหญ้าขนาดเล็กในหมู่บ้าน ใช้โดยเจ้าของร้านคนเดียว ทดแทนการจดบัญชีมือ เพื่อลดเวลาทำบัญชีและให้ข้อมูลแม่นยำ ปัจจุบันใช้งานจริงใน production แล้ว

## Language

### กิจกรรมหลักของร้าน

**งานซ่อม (Repair)**:
งานบริการซ่อมแซมมอไซค์หรือเครื่องตัดหญ้าของลูกค้า มีค่าแรง + อะไหล่ที่ใช้
_Avoid_: ตั๋วซ่อม, ticket, work order

**งานขาย (Sale)**:
การขายสินค้า/อะไหล่ให้ลูกค้าเป็นรายการ (ไม่ใช่งานซ่อม) — ขายของลอยๆ
_Avoid_: บิลขาย, invoice (เก็บไว้ใช้ตอนพิมพ์เอกสารเท่านั้น)

### บุคคลและสินค้า

**ลูกค้า (Customer)**:
เจ้าของมอไซค์/เครื่องตัดหญ้าที่นำมาซ่อม หรือคนมาซื้อของ
_Avoid_: ผู้ใช้, client, buyer

**สินค้า (Product)**:
อะไหล่/ของที่มีในสต็อกขายและใช้ในงานซ่อม มีการติดตามจำนวนคงคลังและต้นทุนเฉลี่ย
_Avoid_: ของ, item, part (เป็นชื่อบทบาทตอนใช้ในงานซ่อม)

### หน่วยนับและหมวดหมู่

**หน่วยนับ (Unit)**:
หน่วยของสินค้า เช่น ชิ้น กล่อง ลิตร
_Avoid_: unit of measure, UOM

**หมวดหมู่ (Category)**:
การจัดกลุ่มสินค้า เช่น อะไหล่มอไซค์ น้ำมัน อะไหล่เครื่องตัดหญ้า
_Avoid_: group, type

### โมดูล (Module terms)

> ชื่อ deep module ในโค้ดที่คุยบ่อย — เพิ่มเมื่อตั้งชื่อ module ใหม่ (ตาม Matt flow `/improve-codebase-architecture`)

**EntityPicker**:
ตัวเลือก entity เดียว (generic `<T>`) สำหรับเลือก Product/Customer ในทุกฟอร์ม — รับ list จาก caller, มี search + คีย์บอร์ด, ใช้แทน Product/Parts autocomplete เก่า + Customer `<Select>` ดิบ. ปิด pain #1 (picker ใช้ยาก). ดู `docs/c1-entitypicker-design.md`
_Avoid_: สร้าง picker ใหม่เฉพาะที่ — ใช้ EntityPicker + adapter (ProductPicker/CustomerPicker) แทน

**DatePicker**:
ตัวเลือกวันที่เดียว (single date) รวม Popover+Calendar+format+label+a11y ไว้ในตัว — value `Date | undefined` เข้าออก, display ผูกตาย `dd/MM/yyyy` (ตรงตาราง). ใช้แทน inline Popover block ซ้ำใน sales/repairs/stock + raw `<input type="date">` ใน Reports. ปิด pain "ทุกหน้าดูไม่เหมือนกัน" + fix drift a11y (label/htmlFor). ดู `docs/c7-datepicker-design.md`
_Avoid_: สร้าง date picker inline ใหม่เฉพาะที่ — ใช้ `<DatePicker>` แทน (อยากได้ช่วง = ใช้ 2 ตัว, อย่าทำ range component)

## รูปร่างธุรกิจจริง (จากข้อมูล production)

> ข้อมูลจาก prod aggregate (สค 2025 – กค 2026, ~11 เดือน) — ยืนยันแล้วไม่อ่อนไหว ร้านเล็กในหมู่บ้าน

### ธุรกิจหลัก = ซ่อม (repair-first)

|                 | เคส | สัดส่วนเคส | มูลค่ารวม | สัดส่วนเงิน |
| --------------- | --- | ---------- | --------- | ----------- |
| งานซ่อม         | 530 | 92%        | 81,060 ฿  | **95.7%**   |
| งานขาย (ของลอย) | 44  | 8%         | 3,640 ฿   | 4.3%        |

→ **งานขาย (Sale) เป็น side activity** ~2-5 เคส/เดือน (พีค 10) — เกือบเป็น vestigial feature
→ ทุกการตัดสินใจ design/priority ต้องมอง repair workflow เป็นแกนกลาง

### ภาระงาน (single-user)

- ซ่อม ~40-60 เคส/เดือน ≈ **1.5-2 เคส/วัน**
- ขาย ~2-5 เคส/เดือน

### โครงสร้างรายได้ต่อเคส

- ซ่อมเฉลี่ย **152.93 ฿/เคส** = margin (เก็บเข้ากระเป๋า) 81.52 (53%) + ต้นทุนอะไหล่ 71.41 (47%)
  - หมายเหตุ: ตัวเลข "81.52" มาจากฟิลด์ `laborCost` ซึ่ง semantic จริง = margin (residual) ไม่ใช่ค่าแรงล้วน — ดู "โมเดลราคางานซ่อม" ด้านล่าง
- ขายเฉลี่ย **82.7 ฿/เคส**

### ความจริงที่น่าสนใจ (รอยืนยันใน grill)

- **ทุกงานซ่อมมีอะไหล่** — 530/530 repair มี `UsedPart` อย่างน้อย 1 ชิ้น (avg 1.1, max 3)
- `laborCost` (= margin) ติดลบ = **0 ครั้ง** ใน 530 เคส (เจ้าของร้านระวังอยู่ แต่ระบบไม่ได้ guard)
- **Float rounding เห็นจริง** — 141 cell มี noise (~8.6% ของยอดเงินทั้งหมด) → กระทบ UI/รายงานจริง
- ไม่มี Sale เดียวที่ไร้ `sale_items` (ไม่มี orphan)

## Workflow การใช้งานจริง (ยืนยันจากเจ้าของร้าน)

- **บันทึกงานเย็นวันเดียว** — เจ้าของร้านลงบันทึกตอนเย็นของทุกวัน (batch ปิดวัน) → **ความเร็วในการ entry เป็นสิ่งสำคัญที่สุด** ไม่ใช่ real-time
- **ไม่มีงานซ่อมค้างคืน** — ทุก repair ปิดภายในวันเดียว → ไม่ต้องการสถานะ "in-progress/kanban" ซับซ้อน
- **"อะไหล่ 0 บาท"** — ในระบบมีสินค้าอะไหล่ราคา 0 บาท ไว้ใช้ตอน **ลูกค้านำอะไหล่มาเอง** (BYO part) → นี่คือเหตุผลที่ทุก repair มี `UsedPart` ≥1
  - ⚠️ ผลกระทบ: อะไหล่ 0 บาททำให้ `partsCost`/`avg parts per repair` มี noise (นับรวมตัว placeholder) — ต้อง filter ตอนวิเคราะห์

### โมเดลราคางานซ่อม (Repair pricing model) — ยืนยันจากเจ้าของร้าน

เจ้าของร้านคิดเงินจากลูกค้าแบบ **residual**: กรอกยอดที่ลูกค้าต้องจ่าย แล้วระบบคำนวณส่วนต่างออกมา

```
totalCost  = ยอดที่ลูกค้าจ่าย            (เจ้าของร้านกรอก)
partsCost  = Σ averageCost × จำนวน      (ระบบคำนวณจากต้นทุนอะไหล่)
margin     = totalCost − partsCost       ← "เงินที่เก็บเข้ากระเป๋า" = ค่าแรง + markup อะไหล่ รวมกัน
```

- **เจ้าของร้านไม่ต้องการแยก "ค่าแรงแท้" กับ "markup อะไหล่"** — ร้านเดี่ยว ซ่อมเล็ก (~150 ฿/เคส) สนแค่ว่าเก็บเข้ากระเป๋ากี่บาท → **โมเดล residual นี้ถูกต้องแล้ว ห้ามเปลี่ยน** (ดู `docs/adr/0001-repair-pricing-residual-margin.md`)
- ⚠️ **ชื่อฟิลด์ใน DB คือ `laborCost` แต่ semantic จริง = `margin` (กำไรรวม)** ไม่ใช่ค่าแรงล้วน — การใช้ชื่อนี้ในรายงาน/แดชบอร์ดทำให้สับสน (เช่น dashboard/reports เขียนสูตรกำไรต่างกันทั้งที่ math เท่ากัน). ตอนวิเคราะห์/เขียน report ใหม่ ให้ถือว่า `laborCost` = margin
- ⚠️ **ค่าติดลบไม่ถูก guard** — `margin` ติดลบได้ถ้าเจ้าของร้านกรอก total < partsCost (เกิด 0 ครั้งใน 530 เคส = ระวังอยู่ แต่ระบบไม่กัน) → โอกาส deepening: ดึงการคำนวณเป็น module เล็กที่ guard ค่าติดลบ + เทสได้โดยไม่ต้องมี DB (ดู candidate C2 ใน architecture review — ตอนนี้เป็น Worth exploring ไม่ใช่ Strong เพราะไม่ได้เปลี่ยน model)

## Pain points จากการใช้งานจริง (backlog หลัก)

> รายละเอียดเต็ม → จะแยกเป็น GitHub Issues ตอน `/to-prd`. สรุป theme:

### 1. Stock Management

- ไม่มี pagination (Products, PurchaseRecord) — ลิสต์ยาว
- Add Product / Add Purchase เป็น inline form → อยากได้ Modal
- **Product picker ใช้ยาก** — ค้นหา + dropdown ไม่สะดวก (เจอซ้ำใน Sales/Purchase/Repair)
- "Filter by product" (PurchaseRecord) แทบไม่ใช้

### 2. Sales

- ไม่มี pagination, inline form → Modal, Product picker ยาก (same pattern)

### 3. Repairs (core — สำคัญที่สุด)

- Create Repair เป็น Modal แล้ว แต่ **ฟอร์มด้านในยังใช้ยาก**:
  - **Customer picker** ค้นหา/เลือกยาก
  - **"Add Parts Used" ฟอร์มซ้อน** ใช้ยาก

### 4. อื่นๆ / ข้ามหน้า

- **ความไม่สอดคล้องกัน** — แต่ละหน้า/ฟอร์มไม่เป็นแนวเดียวกัน (วันที่ picker ไม่เหมือนกัน, form pattern ไม่ตรง) — เจ้าของร้านไม่แน่ใจ "มาตรฐาน dev 2026 ทำยังไง"
- Dashboard แทบไม่ได้ดูจริง
- Low Stock Alerts ยังตั้งค่ารวม (global threshold) ไม่ได้ per-product
- Settings ยังปรับปรุงไม่เสร็จ
- ไม่แน่ใจเรื่อง business-logic bug (→ มีบั๊กที่ยืนยันจากโค้ดแล้ว 4 ข้อ ดู `docs/API-DOCS.md` Known Issues)

### 🎯 Theme ใหญ่ที่ข้ามหน้า

1. **Product/Customer picker ใช้ยาก** — pattern เดียวกันเจอ 3 ที่ (Purchase/Sales/Repair) → fix ครั้งเดียวกระจาย 3 จุด
2. **inline→Modal + pagination** — pattern ซ้ำทุก list page
3. **ความไม่สม่ำเสมอของ UI** — ต้อง design-system pass
4. **ความเร็ว entry** — เพราะบันทึก batch เย็นวันเดียว → ทุก fricition คูณเข้าวันละหลายสิบเคส
