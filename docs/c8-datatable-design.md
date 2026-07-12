# C8 — DataTable<T> module (deep module) — สรุปการออกแบบ

> ผลจาก `/grilling` หลัง architecture review (candidate C8, badge **Worth exploring**)
> คำศัพท์ตาม `/codebase-design`: module / interface / depth / seam / locality
> อ้างอิง: `docs/architecture-review-20260705-th.html` §C8 · GitHub Issue #6

---

## ปัญหา (ปัจจุบัน)

6 หน้า list (**7 ตาราง** รวม stock ที่มี 4 tab) แต่ละตารางเขียน search + table rendering ของตัวเองซ้ำกัน:

| หน้า         | ตาราง                                            | บรรทัดรวมของหน้า |
| ------------ | ------------------------------------------------ | ---------------- |
| `/customers` | customers                                        | 436              |
| `/sales`     | sales                                            | 632              |
| `/repairs`   | repairs                                          | 713              |
| `/stock`     | categories · units · products · purchase history | 1641             |

ปัญหาจริงมี **3 ชั้น**:

### ชั้น 1 — search ซ้ำ (7 ที่ตัวเดียวกัน)

ทุกตารางเขียน pattern เดียวกัน: `useState(searchTerm)` → `useMemo` → `.filter(predicate)` → `<SearchInput>` + `<Table>` + loading/empty states (~70 บรรทัด/ตาราง). แก้ที่เดียวไม่ได้ ต้องแก้ 7 ที่พร้อมกัน

### ชั้น 2 — ไม่มี pagination เลย

วันนี้ข้อมูลร้านยังน้อย (Low Stock ~20, Recent Activities ~10) ยัง ok แต่ pattern จะแข็งตามข้อมูลที่โต. ⚠️ pagination เป็น **speculative** ตอนนี้ (issue #6 ระบุเอง) — แต่ผู้ใช้เลือกทำ → ออกแบบเป็น optional config จะได้ไม่บังคับใช้ทุกหน้า

### ชั้น 3 — predicate + cell หลากหลาย (ต้องรองรับ ไม่ใช่หายไป)

ไม่ใช่ว่าทุกตารางเหมือนกัน — search predicate และ cell content ต่างกันมาก:

**Predicate variety:**

- flat nullable — customers: name/phone/address
- nested — sales/repairs: `customer.name`, products: `category.name`, purchases: `product.name`
- formatted — sales/purchases: ค้นหา date หลาย format
- single field — categories/units: แค่ `name`

**Cell variety:**

- date format (`formatDisplayDate`), nested field (`sale.customer.name`), count (`length + " item(s)"`), currency (`formatCurrency`), truncation (`max-w-xs truncate`), null fallback `"—"` (customers phone/address), action buttons (View/Edit/Delete), `font-medium` แถวแรก, colSpan ต่างกัน (5 vs 7)

→ interface ต้องยืดหยุ่นพอรองรับความหลากหลายนี้ ไม่ใช่บังคับรูปแบบเดียว

---

## การออกแบบ (หลัง grill)

### ข้อตัดสินใจราก (8 ข้อ จาก grill)

| #   | ข้อตกลง                                                                                                                           | เหตุผลสั้น                                                                                                                     |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Q1  | scope = **full deep module** — ครอง SearchInput + filter + table + states + optional pagination                                   | ตรง issue ("รับ rows + predicate + pagination → interface เดียว"); pattern เดียวกับ C7 DatePicker                              |
| Q2  | column API = **column-def + `cell` render fn** (`{ header, cell, className?, headerClassName? }`)                                 | `cell` ครอบ cell variety ทั้งหมด (nested/format/truncate/fallback/action); action buttons = column ปกติที่ cell คืน `<Button>` |
| Q3  | predicate = **fn `(row, term) => boolean`** เท่านั้น · term ดิบ · DataTable จัดการ empty short-circuit                            | keys-based ทำ nested/format ไม่ได้ (เห็นจากข้อมูลทุกหน้า); ไม่เพิ่ม keys shorthand เพราะไม่มี caller ใช้จริง = speculative     |
| Q4  | chrome boundary = **ครองแค่ table block** (ไม่ครอง Card/title/"Add New" button)                                                   | ตรง scope issue (search+table+pagination); button คุม page-level dialog state → coupling ไม่จำเป็น                             |
| Q5  | row key = **`T extends { id: string }`** (ไม่มี `getRowId` prop)                                                                  | ทุก entity มี id (Prisma models); ลบ boilerplate; constraint ตรง reality ไม่ใช่ assumption ลอย                                 |
| Q6  | pagination = **minimal `pageSize`** · reset-on-search + clamp + hide-when-small อัตโนมัติ · omitted = show all (current behavior) | pagination speculative → ทำน้อยที่สุดที่มีประโยชน์; ไม่เพิ่ม page-size selector (YAGNI)                                        |
| Q7  | states = **`loading?` + `emptyMessage?` + `emptySearchMessage?`** + defaults · DataTable เลือกข้อความจาก search state             | action hints ต่างทุกหน้าจริง → ต้องให้หน้าส่งได้; 2 ข้อความเพราะเป็น 2 สถานการณ์ต่างกัน                                        |
| Q8  | migration = **incremental** — สร้าง DataTable + test → migrate customers (validate) → sales/repairs → stock(×4)                   | goal-driven ตรวจได้ทุกขั้น; customers = canonical template (เล็กสุด ครอบ edge case); จับ regression ทันที                      |

### Interface (deep module)

```tsx
interface Column<T> {
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string; // → TableCell (e.g. "text-right", "max-w-xs truncate")
  headerClassName?: string; // → TableHead
}

interface DataTableProps<T extends { id: string }> {
  // Data
  rows: T[];
  columns: Column<T>[];

  // Search (optional — omitted = ไม่มี SearchInput)
  search?: {
    placeholder?: string;
    predicate: (row: T, term: string) => boolean; // term = ดิบที่ user พิมพ์ (non-empty; DataTable short-circuit empty)
  };

  // States
  loading?: boolean; // spinner ใน colSpan row (เหมือนกันทุกหน้า)
  emptyMessage?: string; // default "No data found." (no data)
  emptySearchMessage?: string; // default "No results found." (search yields 0)

  // Pagination (optional — omitted = show all, ไม่มี controls = current behavior)
  pagination?: {
    pageSize: number; // reset→1 on search; clamp ตอน filtered ลด; ซ่อน controls ตอน filtered ≤ pageSize
  };
}
```

**สิ่งที่ module รับผิดชอบ (ทำลึก):**

- SearchInput (debounce 300ms มาจาก SearchInput อยู่แล้ว) + search term state (uncontrolled ภายใน)
- empty-term short-circuit (term ว่าง/whitespace = คืนทั้งหมด, **ไม่เรียก predicate**)
- `.filter(predicate)` บน rows
- `<TableHeader>` + `<TableBody>` + map rows + loading/empty states
- colSpan ของ loading/empty row = `columns.length` (auto)
- pagination slice + controls + reset/clamp/hide logic

**สิ่งที่ไม่ทำ (เหลือให้ caller):**

- Card / CardHeader / title / "Add New" button (คุม page-level dialog state) — Q4
- column defs + predicate + rows (caller ส่งเข้ามา)
- pre-filter ก่อน search (เช่น stock purchase history ที่กรองตาม `selectedProductForHistory`) — caller คำนวณ base rows แล้วส่งเข้า DataTable; search ซ้อนทับทีหลัง
- locale prop / case-normalization (predicate lowercase เอง = current behavior เป๊ะ = เทสเขียวง่าย)

### Deletion test (ทำไมจึง deep จริง ไม่ใช่ move)

ถ้าเอา module ออก → 7 call sites ต้องเขียน `useState`+`useMemo`+`.filter`+`<SearchInput>`+`<Table>`+loading/empty+pagination ใหม่เอง = concentrate ไม่ได้ย้ายไปที่อื่น ✓

### Locality

logic "search + filter + table render + pagination" อยู่ในไฟล์เดียว (`DataTable.tsx`) — caller แค่ส่ง rows/columns/search/predicate

---

## แผนผัง call sites (ก่อน/หลัง)

| ตาราง                                  | ก่อน                                                     | หลัง                                                                                                                                         |
| -------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/customers` (~L211–278)               | useState+useMemo+filter + SearchInput + Table+states     | `<DataTable rows={customers} columns={customerColumns} search={{ predicate }} loading={customersLoading} emptyMessage emptySearchMessage />` |
| `/sales` (~L118–625)                   | เหมือนกัน + nested `customer.name`                       | `<DataTable ... search={{ predicate: nested }} />`                                                                                           |
| `/repairs` (~L133–509)                 | เหมือนกัน + nested `customer.name` + description         | `<DataTable ... />`                                                                                                                          |
| `/stock` categories (~L186–728)        | 1 ใน 4 tables                                            | `<DataTable ... />` (4 ตัว แยก search state อิสระ)                                                                                           |
| `/stock` units (~L194–910)             | 1 ใน 4 tables                                            | `<DataTable ... />`                                                                                                                          |
| `/stock` products (~L202–1168)         | nested `category.name`                                   | `<DataTable ... />`                                                                                                                          |
| `/stock` purchase history (~L213–1519) | pre-filter `selectedProductForHistory` + 3 ข้อความ empty | หน้าคำนวณ base rows ก่อน → `<DataTable rows={baseRows} emptyMessage={conditional} ... />`                                                    |

> pagination (`pageSize`) = optional — ใส่ที่หน้าที่ต้องการ ไม่ใส่ = show all (current behavior เป๊ะ)

---

## ขั้นตอน implementation (incremental — Q8)

| #   | งาน                                                            | verify                                           |
| --- | -------------------------------------------------------------- | ------------------------------------------------ |
| 1   | สร้าง `src/components/ui/DataTable.tsx` + `DataTable.test.tsx` | DataTable test เขียว                             |
| 2   | migrate `/customers` (canonical template)                      | customers `page.test.tsx` เขียว + browser-verify |
| 3   | migrate `/sales` + `/repairs`                                  | sales + repairs test เขียว                       |
| 4   | migrate `/stock` (4 ตาราง)                                     | stock test เขียว                                 |
| 5   | `npm test` ทั้งหมด + tsc + lint                                | ทุกอย่างเขียว                                    |

**DataTable.test.tsx ครอบ:**

- search filter ทำงาน (term ตรง = โชว์, ไม่ตรง = `emptySearchMessage`)
- empty short-circuit (term ว่าง = show all)
- loading state (spinner)
- pagination slice + reset-on-search + clamp + hide-when-small
- colSpan ของ empty row = `columns.length`
- omitted `search` = ไม่มี SearchInput

---

## ขอบเขต / ไม่ขอบ

**ในขอบ:**

- `src/components/ui/DataTable.tsx` + `DataTable.test.tsx` (ใหม่)
- 7 call sites: customers / sales / repairs / stock(×4) page + test ที่เกี่ยว
- CONTEXT.md module terms + `docs/c8-datatable-design.md` (ไฟล์นี้)

**นอกขอบ:**

- ❌ server-side pagination (ทุก page ยัง fetch `getAll` client-side) — เป็นปัญหาคนละชั้น
- ❌ page-size selector / page-number buttons (Q6 YAGNI)
- ❌ column sorting (ไม่ได้อยู่ใน issue)
- ❌ แยกไฟล์ stock 1641 บรรทัด (C10 คนละ candidate)
- ❌ DB / migration (UI ล้วน)

---

## ความปลอดภัยของ DB

- **UI ล้วน** — DataTable = pure client component, ไม่แตะ tRPC router / DB
- **ไม่มี migration / ไม่กระทบข้อมูลเดิม**
- rows ยังมาจาก `api.*.getAll` เหมือนเดิม — แค่ย้ายการ filter/slice จากแต่ละ page เข้า module
- ⚠️ ความเสี่ยงเดียว = แตะ 7 call sites พร้อมกัน → ต้อง test + browser-verify ทุกตาราง (ดู ขั้นตอน implementation)

---

## วิธี verify ตอนจบ

- `npm test` เขียวทุก suite (รวม DataTable.test.tsx + 7 list page tests ที่ update)
- `tsc` + `lint` สะอาด
- browser-verify ผ่าน chrome-devtools MCP + CDP (ดู `docs/agents/chrome-cdp-mcp.md`):
  - search ทำงานทุกตาราง (flat + nested field)
  - loading/empty states ถูกต้อง (no data vs search no match)
  - pagination (หน้าที่เปิด) — next/prev, reset ตอน search, ซ่อนตอนข้อมูลน้อย
  - action buttons ยังทำงาน (View/Edit/Delete)
  - หน้าตาตารางเหมือนเดิม (ไม่ regress)
