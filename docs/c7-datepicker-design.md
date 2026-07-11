# C7 — DatePicker module (deep module) — สรุปการออกแบบ

> ผลจาก `/grilling` หลัง architecture review (candidate C7, badge **Strong**)
> คำศัพท์ตาม `/codebase-design`: module / interface / depth / seam / locality
> อ้างอิง: `docs/architecture-review-20260705-th.html` §C7 · GitHub Issue #5

---

## ปัญหา (ปัจจุบัน)

หน้าที่มีการเลือกวันที่ **ดูไม่เหมือนกัน** (pain point ของเจ้าของร้าน — ดู `CONTEXT.md`):

- `/sales` · `/repairs` · `/stock` (tab Record Purchase) — ใช้ inline `Popover` + `Button` + `Calendar mode="single"` + `format(date,"PPP")` ซ้ำกัน ~25 บรรทัด × 3 ที่
- `/reports` — ใช้ raw `<input type="date">` ต่างหาก

ปัญหาจริงมี **3 ชั้น** (ไม่ใช่แค่ "หน้าตาต่าง"):

### ชั้น 1 — ซ้ำ (3 ที่ ตัวเดียวกัน)

block Popover+Button+Calendar+format ซ้ำกันเกือบทุกบรรทัดใน sales/repairs/stock → แก้ที่เดียวไม่ได้ ต้องแก้ 3 ที่พร้อมกัน

### ชั้น 2 — drift a11y (label/htmlFor พังและไม่เท่ากัน) ⚠️

| หน้า    | label                                                    | htmlFor ผูก?                                            |
| ------- | -------------------------------------------------------- | ------------------------------------------------------- |
| sales   | `<Label htmlFor="date">`                                 | ❌ ปุ่ม trigger ไม่มี `id="date"` → คลิก label ไม่ไปถึง |
| repairs | ไม่มี Label (มีแค่ placeholder "Pick a date (optional)") | ❌ ไม่มี label เลย                                      |
| stock   | plain text "Purchase Date" (ไม่ใช่ `<Label>`)            | ❌ ไม่ผูก htmlFor                                       |

### ชั้น 3 — drift semantic (ความหมาย/พฤติกรรมต่างกัน)

- repairs เขียน "optional" ทั้งที่เจ้าของร้านต้องการ **บังคับใส่วัน**
- display format `PPP` ("Jul 11, 2026" อังกฤษ) ต่างจากตารางข้างๆ (`formatDisplayDate` = "11/07/2026" ค.ศ. DD/MM/YYYY)
- reports default ว่าง → ผู้ใช้ต้องคลิกเลือก start+end ทุกครั้ง

---

## การออกแบบ (หลัง grill)

### ข้อตัดสินใจราก (7 ข้อ จาก grill)

| #   | ข้อตกลง                                                                                                                                | เหตุผลสั้น                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Q1  | scope = สกัด `<DatePicker>` + unify **4 หน้า**                                                                                         | "module เดียว" สมชื่อต้องให้หน้าอื่นเรียกใช้; ฆ่าซ้ำ 3 ที + Reports                       |
| Q2  | Reports = **single picker × 2** (start+end) ไม่ทำ range component                                                                      | ตรง "module เดียว"; range picker = 2 module ขยายขอบ                                       |
| Q3  | value type = **`Date \| undefined`** เข้าออก                                                                                           | 3/4 หน้าใช้ Date อยู่แล้ว; reports serialize string ที่ขอบ                                |
| Q4  | props: `id, label, value, onChange, placeholder?, required?, disabled?` · format **ผูกตาย** · **ไม่รับ error**                         | format ผูกตาย = guarantee "หน้าตาเดียวกัน"; error เป็นของ caller (cross-field validation) |
| Q5  | ไฟล์ `src/components/ui/DatePicker.tsx` + test คู่ + module term ใน CONTEXT.md                                                         | ตรงรูปแบบ EntityPicker (deep module UI)                                                   |
| Q6  | display = **`dd/MM/yyyy`** ("11/07/2026") ตรง `formatDisplayDate` · ปฏิทิน default อังกฤษ                                              | สอดคล้องตาราง; ค.ศ. เหมือนทั้งระบบ (เช็คแล้ว ไม่ใช่ พ.ศ.)                                 |
| Q7  | sales/stock = default วันนี้ · repairs = **บังคุล default วันนี้ (ระดับ 1 router เดิม)** · reports = **default ช่วงเดือนนี้อัตโนมัติ** | บังคุล UI-level เท่านั้น (issue ว่าด้วย UI); reports UX improvement เล็ก                  |

### Interface (deep module)

```tsx
<DatePicker
  id: string                       // → ผูก <Label htmlFor> + trigger button id (fix a11y)
  label: string                    // → <Label> ด้านบน
  value: Date | undefined          // เข้าออก (Q3)
  onChange: (date: Date | undefined) => void
  placeholder?: string             // default "Pick a date"
  required?: boolean               // → "*" หลัง label + aria-required
  disabled?: boolean
/>
```

**สิ่งที่ module รับผิดชอบ (ทำลึก):**

- Popover + Button trigger + Calendar `mode="single"` + format + label + htmlFor + id binding
- display ผูกตาย `format(date, "dd/MM/yyyy")` (caller เปลี่ยนไม่ได้)
- a11y ถูกต้องอัตโนมัติ (Label htmlFor ↔ button id)

**สิ่งที่ไม่ทำ (เหลือให้ caller):**

- validation / error message (cross-field อย่าง start<end เป็นของหน้า reports)
- range mode (Q2 ตัด; อยากได้ range ใช้ 2 ตัว)
- locale prop (Q6 ผูกตาย ค.ศ. DD/MM/YYYY)

### Deletion test (ทำไมจึง deep จริง ไม่ใช่ move)

ถ้าเอา module ออก → 4 call sites ต้องเขียน Popover+Button+Calendar+format+label+htmlFor ใหม่เอง = concentrate ไม่ได้ย้ายไปที่อื่น ✓

### Locality

logic "เลือกวันที่เดียว + แสดงผล + a11y" อยู่ในไฟล์เดียว (`DatePicker.tsx`) — caller แค่ส่ง value/onChange/label

---

## แผนผัง call sites (ก่อน/หลัง)

| หน้า                                  | ก่อน                              | หลัง                                                                             |
| ------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| `/sales` (~L435)                      | inline Popover+Calendar block     | `<DatePicker id label value={saleDate} onChange required />`                     |
| `/repairs` (~L582)                    | inline block + "optional" (drift) | `<DatePicker required default วันนี้ ... />` — แก้ drift                         |
| `/stock` tab Record Purchase (~L1432) | inline block                      | `<DatePicker ... />`                                                             |
| `/reports` (~L117)                    | `<input type="date">` × 2         | `<DatePicker>` × 2 — state `Date`, default ช่วงเดือนนี้, serialize string ที่ขอบ |

---

## งานบังคับที่จะเกิดนอกเหนือ "สร้าง module"

1. **เขียน test reports (`page.test.tsx`) ใหม่ทั้งไฟล์** — test-debt (เหมือน C3): test เดิมยึด `<input type="date">` + `getByLabelText` + `fireEvent.change` ทั้ง 8 case พังเมื่อเปลี่ยนเป็น Popover → เลือกวันด้วยคลิก DayButton แทน
2. **แก้ drift repairs** — placeholder "optional" → "Pick a date" + default วันนี้ + required (ระดับ 1, router เดิม)
3. **reports page** — state `string` → `Date`, default start=ต้นเดือน/end=วันนี้, serialize `format(date,'yyyy-MM-dd')` ตอนสร้าง URL params (URL contract `startDate/endDate` คงเดิม)
4. **แก้ a11y** label+htmlFor+id ทั้ง 4 หน้า (fix drift ชั้น 2)

---

## ขอบเขต / ไม่ขอบ

**ในขอบ:**

- `src/components/ui/DatePicker.tsx` + `DatePicker.test.tsx` (ใหม่)
- 4 call sites: sales / repairs / stock / reports page + test
- CONTEXT.md module terms + `docs/c7-datepicker-design.md` (ไฟล์นี้)

**นอกขอบ:**

- ❌ repairs router schema (`repairDate` ยัง optional — ระดับ 1 UI-only)
- ❌ range picker component (Q2)
- ❌ ปฏิทิน locale ไทย / พ.ศ. (Q6 ค.ศ. DD/MM/YYYY)
- ❌ ไม่แตะ `getTrendData` / dashboard (คนละ concept เหมือน C6)

---

## ความปลอดภัยของ DB

- value = `Date` เหมือนเดิม → **ไม่แตะ DB / ไม่มี migration / ไม่กระทบข้อมูลเดิม**
- mutation/router รับ Date เหมือนเดิม (C3 `validateAndDeductStock`, sale/repair create)
- Reports URL contract (`startDate=yyyy-MM-dd&endDate=yyyy-MM-dd`) คงเดิม

---

## วิธี verify ตอนจบ

- `npm test` เขียวทุก suite (รวม test reports ที่เขียนใหม่ + DatePicker.test.tsx)
- `tsc` + `lint` สะอาด
- browser-verify ผ่าน chrome-devtools MCP + CDP (ดู `docs/agents/chrome-cdp-mcp.md`):
  - ทุกหน้า picker หน้าตาเหมือนกัน
  - repairs บังคุล + default วันนี้
  - reports default ช่วงเดือนนี้ + สร้างรายงานได้
  - คลิก label → เปิดปฏิทินได้ (a11y)
