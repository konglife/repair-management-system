# C6 — Date-range parsing module (deep module) — สรุปการออกแบบ

> ผลจาก `/grilling` หลัง architecture review (candidate C6, badge **Strong**)
> คำศัพท์ตาม `/codebase-design`: module / interface / depth / seam / locality
> อ้างอิง: `docs/architecture-review-20260705-th.html` §C6 · GitHub Issue #4

---

## ปัญหา (ปัจจุบัน)

switch `today / 7days / 1month` ที่คำนวณช่วงวันซ้ำกัน ~150 บรรทัด กระจายอยู่ 6 call sites:

- `sale.ts` ~33–63 (getAll), ~215–245 (getAnalytics)
- `repair.ts` ~26–56 (getAll), ~203–233 (getAnalytics)
- `dashboard.ts` ~86–101 (getSummary), ~283–298 (getTopProducts)

ปัญหาจริงมี **2 ชั้น** (ไม่ใช่แค่ "ซ้ำ"):

### ชั้น 1 — enum drift (ชื่อค่าต่างกัน)

| กลุ่ม       | enum                            | ฟิลด์       |
| ----------- | ------------------------------- | ----------- |
| sale/repair | `today / 7days / 1month`        | `dateRange` |
| dashboard   | `today / last7days / thismonth` | `period`    |

### ชั้น 2 — semantic drift (ความหมายช่วงต่างกัน) ⚠️ เป็นพฤติกรรมที่ผู้ใช้มองเห็น

| ช่วง    | sale/repair                     | dashboard              | ต่างตรงไหน                                         |
| ------- | ------------------------------- | ---------------------- | -------------------------------------------------- |
| 7 วัน   | `startOfDay − 7`                | `now − 7`              | dashboard ย้อนตาม "เวลาปัจจุบัน" ไม่ใช่ตี 0        |
| 1 เดือน | `startOfDay − 1month` (rolling) | `วันแรกของเดือนปฏิทิน` | dashboard รีเซ็ตวันที่ 1; sale/repair ย้อน 1 เดือน |

→ ตัวเลขในแดชบอร์ดกับในหน้าประวัติขาย/ซ่อม **ไม่ตรงกัน** เมื่อเทียบช่วงเดียวกัน

---

## การออกแบบ (หลัง grill)

### ข้อตัดสินใจราก

**ทั้ง 2 ชั้นของ drift ไม่ได้ตั้งใจ** (ไม่มีเอกสาร/comment/ธุรกิจที่อธิบายว่าแดชบอร์ดต้องต่างจากหน้าอื่น) → **unify ทั้ง enum และ semantic** ไม่ใช่แค่ย้ายโค้ด (มิฉะนั้นเป็นการ "ย้าย drift" ไม่ใช่ "แก้ drift" · module จะไม่ deep จริง)

### ความหมาย canonical (ใช้ทุกหน้า)

ปกติฐาน = `startOfDay` (ตี 0 ของวันปัจจุบัน):

| enum     | คำนวณ                                     |
| -------- | ----------------------------------------- |
| `today`  | `{ gte: startOfDay }`                     |
| `7days`  | `{ gte: startOfDay − 7 วัน }`             |
| `1month` | `{ gte: startOfDay − 1 เดือน }` (rolling) |

→ กฎเดียว: "ช่วง X = ย้อนจากตี 0 ของวันนี้ไป X"

### module

`parseDateRange` — server-domain module · ไฟล์ `src/server/dates.ts` (+ `dates.test.ts`)

### interface

```ts
export type DateRange = "today" | "7days" | "1month";

export function parseDateRange(
  range: DateRange | undefined,
  now: Date = new Date()
): { gte: Date } | undefined;
```

- `undefined` (ไม่ส่ง) → `undefined` = ไม่กรอง = เอาทั้งหมด (รักษาพฤติกรรมเดิมของ sale/repair ที่ dateRange optional)
- `now` รับเข้าเพื่อเทสตายตัว (default = เวลาปัจจุบัน · pattern เดียวกับ `stock.ts`)

### depth อยู่ตรงไหน

พฤติกรรม "แปลง enum → ช่วงวัน Prisma filter" ทั้งหมดซ่อนหลัง interface เดียว — caller ไม่เห็น:

1. คำนวณ `startOfDay` จาก `now`
2. switch enum → ลบวัน/เดือน
3. ห่อเป็น `{ gte: Date }`

### ที่ seam (6 call sites)

แทน switch 15+ บรรทัดด้วย:

```ts
const dateFilter = parseDateRange(input.dateRange);
// ...
where: dateFilter ? { createdAt: dateFilter } : undefined,
```

> caller ยังต้องมี ternary `dateFilter ? {...} : undefined` เล็กน้อย เพื่อรักษา "undefined = ไม่ใส่ where เลย" (ไม่ใช่ `{ createdAt: undefined }`)

---

## การ migrate ฝั่งแดชบอร์ด (enum + field + semantic)

แดชบอร์ดต้องย้ายมาใช้ canonical — ทั้ง backend และ frontend:

|             | เดิม                            | ใหม่                     |
| ----------- | ------------------------------- | ------------------------ |
| enum        | `today / last7days / thismonth` | `today / 7days / 1month` |
| ฟิลด์ input | `period`                        | `dateRange`              |
| 7 วัน       | `now − 7`                       | `startOfDay − 7`         |
| 1 เดือน     | `วันแรกเดือนปฏิทิน`             | `startOfDay − 1month`    |

**ไฟล์ frontend ที่แตะ:**

- `dashboard/page.tsx` — `TimePeriod` type, `PERIOD_OPTIONS` values, default state, ฟิลด์ query `period`→`dateRange`, label
- `components/charts/TopProductsChart.tsx` — `TimePeriod` type + `period` prop

**ไฟล์ backend ที่แตะ:** `dashboard.ts` getSummary + getTopProducts (input schema + ลบ switch)

**ไม่แตะ:** `getTrendData` + `TrendGraph.tsx` (`last30days`) — ออกนอกขอบเขต (คนละ concept: ช่วงตายตัว ไม่ใช่ตัวเลือกผู้ใช้)

---

## decision log (จาก grill)

| #   | คำถาม                             | ตัดสินใจ                                                                          |
| --- | --------------------------------- | --------------------------------------------------------------------------------- |
| 1   | drift เป็นของจริงหรือเกิดเอง      | **เกิดเอง** → unify ทั้ง enum + semantic (ไม่ใช่แค่ย้ายโค้ด)                      |
| 2   | "1 เดือน" แปลว่าแบบไหน            | **rolling `startOfDay − 1month`** (เข้ากับกฎ "ย้อน X" + ใช้อยู่แล้ว 4/6 ที่)      |
| 3   | enum canonical ชุดไหน             | **`today / 7days / 1month`** (sale/repair — เปลี่ยนน้อยสุด) · ฟิลด์ `dateRange`   |
| 4   | `last30days` (กราฟเทรนด์) เข้าไหม | **ไม่** — คนละ concept (ช่วงตายตัว) · ออกนอกขอบเขต                                |
| 5   | คืนค่ารูปไหน                      | **`{ gte: Date } \| undefined`** Prisma fragment (ตรง issue · ใส่ลงฟิลด์ไหนก็ได้) |
| 6   | รับ `now` เข้ามา (testability)    | **รับ** `now = new Date()` (pattern `stock.ts` · เทสไม่ต้อง mock)                 |
| 7   | ตำแหน่งไฟล์                       | **`src/server/dates.ts`** + `dates.test.ts` (บรรทัดฐาน `stock.ts`/`auth.ts`)      |
| 8   | `DateRange` type อยู่ที่ไหน       | **นิยาม + export จาก `dates.ts`** (single source · แก้ที่เหตุของ drift)           |

---

## leverage / locality ที่ได้

- **locality**: คำนวณช่วงวันทุกครั้งมองเห็นใน module เดียว — เปลี่ยนนิยามช่วงวันแก้ที่เดียว ไม่กระจาย 6 ที่
- **leverage**: 1 interface คลุม 6 caller (+ caller ในอนาคต)
- ลบได้ switch ซ้ำ ~25 บรรทัด/site × 6 ≈ ~150 บรรทัด · caller เหลือ ~1 บรรทัด
- **enum และ semantic เป็นหนึ่งเดียว** → ตัวเลขทุกหน้าตรงกันเมื่อเทียบช่วงเดียวกัน

## deletion test

เอา module ออก → 6 sites ต้องเขียน switch + คำนวณ `startOfDay` เองใหม่ = **concentrate ไม่ move** → module deep จริง

---

## เกณฑ์สำเร็จ (verifiable)

- `npm test` เขียว (suite เดิม + `dates.test.ts` ใหม่)
- `npm run lint` + `tsc` สะอาด
- `sale.test.ts` / `repair.test.ts` / `dashboard.test.ts` ยังเขียว (หลังแก้ enum ให้ตรง canonical)
- frontend `dashboard/page.tsx` + `TopProductsChart.tsx` ส่ง `dateRange` enum ใหม่ถูกต้อง
- ลบได้ ~150 บรรทัดซ้ำ
- ทำบน `develop` (branch `feature/c6-daterange-module`) ไม่แตะ `main`/prod

---

## ขอบเขตที่ **ไม่** ทำใน C6

- `getTrendData` / `last30days` → คนละ concept (กราฟยืดตายตัว 30 วัน) · ปล่อยไว้
- เปลี่ยน UX (เพิ่มช่วงใหม่/เปลี่ยน label) → เรื่องอื่น
- รวม `period`/`dateRange` ฝั่ง frontend เป็น component ซ้ำ → ทำ UI module (C-series อื่น)

## ความเสี่ยง

- **เปลี่ยนพฤติกรรมแดชบอร์ดที่ผู้ใช้ใช้อยู่จริง (production)** ⚠️ ต้องรับรู้:
  - "7 วัน": ขอบเขตขยับจาก `now−7` → `startOfDay−7` (เล็กน้อย)
  - "1 เดือน": **เปลี่ยนใหญ่** — จาก "ตั้งแต่วันแรกของเดือน" เป็น "ย้อน 1 เดือน" · เช่น 15 ก.ค. → เริ่มนับ 15 มิ.ย. แทน 1 ก.ค. → **ตัวเลขแดชบอร์ดจะเปลี่ยน**
  - ยอมรับโดยสำนึกเพราะนี่คือ intent ของการ "unify semantic" · ตรวจด้วย browser-verify + บอกผู้ใช้ชัดเจน
- **test-debt** (ตาม C3): `dashboard.test.ts`/`sale.test.ts`/`repair.analytics.test.ts` เป็น **fake** (re-implement logic ในไฟล์ test ไม่ได้เรียก router จริง) → ต้องแก้ enum ใน fake tests ให้ตรง canonical · `dates.test.ts` คือ safety net จริงตัวแรกของ date-range logic
- **frontend cascade**: issue บอก "6 call sites" (backend) แต่จริงๆ ต้องแตะ frontend แดชบอร์ดด้วย (เปลี่ยน enum+field พร้อมกัน ไม่งั้นขาดการสื่อสาร) — งานใหญ่กว่าที่ issue เขียน แต่เป็นส่วนจำเป็น
