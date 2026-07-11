# UI/UX Specification

> **Snapshot วันที่ 2026-07-04** — สะท้อนหน้า/คอมโพเนนต์ ณ วันที่สร้าง
> รายละเอียด API ที่หน้าใช้ → `docs/API-DOCS.md`

## Design System

| เรื่อง            | เทคโนโลยี/ค่า                                                                    |
| ----------------- | -------------------------------------------------------------------------------- |
| Component library | **Shadcn/ui** (22 components ใน `src/components/ui/`)                            |
| Styling           | **Tailwind CSS 4** (config ใน `src/app/globals.css`, ไม่มี `tailwind.config.js`) |
| Icons             | **Lucide**                                                                       |
| ภาษา UI           | ไทยเป็นหลัก                                                                      |
| สกุลเงิน          | บาท ( localization ใน Story 1.2 v2.0)                                            |
| รูปแบบเลข         | numeric input มี enhancement (v2.0)                                              |

## Layout

โครงหลัก (`src/components/layout/`):

```
┌─────────────────────────────────────────────┐
│ Header (รหัส user profile)                    │
├──────────┬──────────────────────────────────┤
│          │                                   │
│ Sidebar  │   Main content (หน้าต่างๆ)         │
│ (เมนู +   │                                   │
│ toggle)  │                                   │
│          │                                   │
└──────────┴──────────────────────────────────┘
```

- **`MainLayout`** — กรอบหลัก ห่อหน้าทั้งหมดในกลุ่ม `(main)`
- **`Sidebar`** — เมนูนำทาง + ปุ่ม toggle (ย่อ/ขยาย ได้ ตั้งแต่ v2.0) + หัว "Repair Shop"
- **`Header`** — แสดง user profile (Clerk) หลังล็อกอิน

## หน้า (Routes)

### กลุ่ม `(auth)` — ไม่ต้องล็อกอิน

| เส้นทาง    | หน้าที่             |
| ---------- | ------------------- |
| `/sign-in` | เข้าสู่ระบบ (Clerk) |
| `/sign-up` | สมัครสมาชิก (Clerk) |

### กลุ่ม `(main)` — ต้องล็อกอิน

| เส้นทาง            | หน้าที่                                                                | API ที่ใช้                                     |
| ------------------ | ---------------------------------------------------------------------- | ---------------------------------------------- |
| `/dashboard`       | ภาพรวมธุรกิจ (การ์ดสรุป + กราฟแนวโน้ม + สินค้าใกล้หมด + กิจกรรมล่าสุด) | `dashboard.*`                                  |
| `/stock`           | จัดการสินค้า + หมวดหมู่ + หน่วยนับ + ประวัติซื้อ                       | `products`, `categories`, `units`, `purchases` |
| `/sales`           | รายการขาย + สร้างงานขายใหม่                                            | `sales`                                        |
| `/sales/[id]`      | รายละเอียดงานขาย                                                       | `sales.getById`                                |
| `/repairs`         | รายการซ่อม + สร้างงานซ่อมใหม่                                          | `repairs`                                      |
| `/repairs/[id]`    | รายละเอียดงานซ่อม                                                      | `repairs.getById`                              |
| `/customers`       | รายการลูกค้า + เพิ่ม/แก้                                               | `customers`                                    |
| `/customers/[id]`  | ประวัติธุรกรรมลูกค้า (งานขาย + งานซ่อม)                                | `customers.getTransactionHistory`              |
| `/reports`         | หน้ารายงาน (เลือกช่วงวันที่)                                           | `reports.getMonthlySummary`                    |
| `/reports/summary` | รายงานสรุปฉบับเต็ม (พร้อมโลโก้ร้าน)                                    | `reports.getMonthlySummary`                    |
| `/settings`        | ตั้งค่าร้าน (BusinessProfile)                                          | `settings.*`                                   |

## คอมโพเนนต์เฉพาะหน้า

### Dashboard (`src/components/dashboard/`, `src/components/charts/`)

- การ์ดสรุป: รายได้/ต้นทุน/กำไร/มูลค่าสต็อก + เลือกช่วงเวลา (`today`/`7days`/`1month` — semantic เดียวกันทุกหน้า หลัง C6; ดู `src/server/dates.ts`)
- `TrendGraph` — กราฟเปรียบเทียบ รายได้ vs ค่าใช้จ่าย 30 วัน
- `LowStockAlerts` — สินค้าใกล้หมด (ต่ำกว่า threshold)
- `RecentActivities` — feed กิจกรรมล่าสุด (sale/repair/purchase)

### Reports (`src/components/reports/`)

- `ReportView` — คอมโพเนนต์รากของรายงาน
- `ReportHeader` — หัวรายงาน (ชื่อร้าน + โลโก้ขาวดำ + ช่วงวันที่รูปแบบ `DD/MM/YYYY - DD/MM/YYYY`)
- `OverviewMetrics` — ตัวเลขสรุปภาพรวม
- `SalesTable` / `RepairsTable` / `PurchasesTable` — ตารางรายละเอียด
- หลัก "Parts Used" ใน RepairsTable แสดง **เฉพาะชื่อ+จำนวน** (ไม่แสดงราคา — v2.3.0)

### Stock — 4 tab ย่อยในหน้าเดียว (`/stock`)

หน้า `/stock` (`src/app/(main)/stock/page.tsx`) เป็นหน้าเดียวที่สลับด้วย state `activeTab` (ไม่ใช่ routing) — มี 4 tab:

| Tab                                   | โค้ดบริเวณ | หน้าที่                                           | แตะ C-series?            |
| ------------------------------------- | ---------- | ------------------------------------------------- | ------------------------ |
| **Products** (สินค้า)                 | ~L1010     | CRUD สินค้า + เลือกสินค้าผ่าน EntityPicker (C1)   | C1 แตะ (EntityPicker)    |
| **Record Purchase** (บันทึกรับสินค้า) | ~L1339     | ฟอร์มรับสินค้าเข้า + `purchaseDate` (date picker) | C1 แตะ product selection |
| **Categories** (หมวดหมู่)             | ~L642      | CRUD หมวดหมู่                                     | —                        |
| **Units** (หน่วยนับ)                  | ~L830      | CRUD หน่วยนับ                                     | —                        |

> **หมายเหตุ:** C3 (stock module `validateAndDeductStock`) เป็น server-side (`src/server/stock.ts`) ใช้ใน router sale/repair **ไม่ได้แตะหน้า stock เลย** — อย่าสับสนชื่อ

### Date picker sites — สถานะปัจจุบัน (baseline ก่อน C7)

จุดที่ผู้ใช้เลือกวันที่ในระบบทั้งหมด (ก่อนทำ C7):

| หน้า                               | จุด                           | ค่าที่เก็บ              | วิธีเลือก (ปัจจุบัน)                             |
| ---------------------------------- | ----------------------------- | ----------------------- | ------------------------------------------------ |
| `/sales`                           | วันขาย (`saleDate`)           | `Date`                  | inline Popover+Calendar `mode="single"`          |
| `/repairs`                         | วันรับงานซ่อม                 | `Date`                  | inline Popover+Calendar `mode="single"`          |
| `/stock` → tab **Record Purchase** | วันรับสินค้า (`purchaseDate`) | `Date`                  | inline Popover+Calendar `mode="single"`          |
| `/reports`                         | start + end                   | `string` (`yyyy-mm-dd`) | raw `<input type="date">` ← **หน้าต่างจากกลุ่ม** |

→ sales/repairs/stock ใช้ block ซ้ำกันเกือบทุกบรรทัด (3 ที่), Reports ใช้ input type=date ต่างหาก → ทำให้ "ทุกหน้าดูไม่เหมือนกัน" (pain point ของเจ้าของร้าน)
→ C7 (#5) จะสกัด `DatePicker` module เดียว แทนที่ inline block ทั้ง 3 + Reports ใช้ 2 ตัว (start+end)

## รูปแบบการโต้ตอบ (Interaction Patterns)

- **Optimistic UI** — หลัง submit form ตารางอัปเดตทันที **ไม่ reload หน้า**:
  - ใช้ tRPC `useMutation` + `utils.invalidate()` (ทำสำเร็จใน Stock แล้ว ขยายไป Sales/Customers ใน v2.3.0)
  - แสดง toast แจ้งสำเร็จ
- **Form validation** — Zod ทั้ง client (tRPC infer) และ server
- **Error handling** — โยน `TRPCError` → แสดงข้อความไทยใน UI (เช่น "สต็อกไม่พอ")
- **Date range filter** — semantic เดียว (`today`/`7days`/`1month`) parse ผ่าน deep module `parseDateRange` (C6, `src/server/dates.ts`) ใช้ซ้ำใน dashboard/sales/repairs + router
- **Date picker (single date)** — ปัจจุบันยังไม่มี module รวม: sales/repairs/stock ใช้ inline Popover+Calendar (`mode="single"`) ซ้ำกัน 3 ที่, Reports ใช้ raw `<input type="date">` (หน้าต่างจากกลุ่ม) — เป้าหมาย C7 (#5) คือสร้าง `DatePicker` module เดียว unify ทั้งหมด (ดู "Date picker sites" ด้านล่าง)
- **Search** — universal search (v2.0)

## Accessibility & Responsive

- Responsive layout (desktop-first สำหรับการใช้ที่ร้าน, sidebar toggle รองรับจอเล็ก)
- ป้ายกำกับ form มาตรฐาน (Story 1.5 v2.0: standardize labels)

## การทดสอบ UI

- คอมโพเนนต์สำคัญมี test คู่กัน (`.test.tsx`) เช่น `sidebar.test.tsx`, `LowStockAlerts.test.tsx`, ทุกไฟล์ใน `reports/`
- กลยุทธ์: integration test สำหรับ interaction ซับซ้อน (ดู `CLAUDE.md` → Testing Strategy)

## Cross-references

- โครงสร้างสถาปัตยกรรม → `docs/ARCHITECTURE.md`
- รายละเอียด API → `docs/API-DOCS.md`
- เอกสาร UX/UI รุ่นเก่า (เก็บอ้างอิง) → `docs_archive/docs_2.1.0/ui-ux-specification.md`
