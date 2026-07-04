# UI/UX Specification

> **Snapshot วันที่ 2026-07-04** — สะท้อนหน้า/คอมโพเนนต์ ณ วันที่สร้าง
> รายละเอียด API ที่หน้าใช้ → `docs/API-DOCS.md`

## Design System

| เรื่อง | เทคโนโลยี/ค่า |
|---|---|
| Component library | **Shadcn/ui** (22 components ใน `src/components/ui/`) |
| Styling | **Tailwind CSS 4** (config ใน `src/app/globals.css`, ไม่มี `tailwind.config.js`) |
| Icons | **Lucide** |
| ภาษา UI | ไทยเป็นหลัก |
| สกุลเงิน | บาท ( localization ใน Story 1.2 v2.0) |
| รูปแบบเลข | numeric input มี enhancement (v2.0) |

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
| เส้นทาง | หน้าที่ |
|---|---|
| `/sign-in` | เข้าสู่ระบบ (Clerk) |
| `/sign-up` | สมัครสมาชิก (Clerk) |

### กลุ่ม `(main)` — ต้องล็อกอิน
| เส้นทาง | หน้าที่ | API ที่ใช้ |
|---|---|---|
| `/dashboard` | ภาพรวมธุรกิจ (การ์ดสรุป + กราฟแนวโน้ม + สินค้าใกล้หมด + กิจกรรมล่าสุด) | `dashboard.*` |
| `/stock` | จัดการสินค้า + หมวดหมู่ + หน่วยนับ + ประวัติซื้อ | `products`, `categories`, `units`, `purchases` |
| `/sales` | รายการขาย + สร้างงานขายใหม่ | `sales` |
| `/sales/[id]` | รายละเอียดงานขาย | `sales.getById` |
| `/repairs` | รายการซ่อม + สร้างงานซ่อมใหม่ | `repairs` |
| `/repairs/[id]` | รายละเอียดงานซ่อม | `repairs.getById` |
| `/customers` | รายการลูกค้า + เพิ่ม/แก้ | `customers` |
| `/customers/[id]` | ประวัติธุรกรรมลูกค้า (งานขาย + งานซ่อม) | `customers.getTransactionHistory` |
| `/reports` | หน้ารายงาน (เลือกช่วงวันที่) | `reports.getMonthlySummary` |
| `/reports/summary` | รายงานสรุปฉบับเต็ม (พร้อมโลโก้ร้าน) | `reports.getMonthlySummary` |
| `/settings` | ตั้งค่าร้าน (BusinessProfile) | `settings.*` |

## คอมโพเนนต์เฉพาะหน้า

### Dashboard (`src/components/dashboard/`, `src/components/charts/`)
- การ์ดสรุป: รายได้/ต้นทุน/กำไร/มูลค่าสต็อก + เลือกช่วงเวลา (today/7days/thismonth)
- `TrendGraph` — กราฟเปรียบเทียบ รายได้ vs ค่าใช้จ่าย 30 วัน
- `LowStockAlerts` — สินค้าใกล้หมด (ต่ำกว่า threshold)
- `RecentActivities` — feed กิจกรรมล่าสุด (sale/repair/purchase)

### Reports (`src/components/reports/`)
- `ReportView` — คอมโพเนนต์รากของรายงาน
- `ReportHeader` — หัวรายงาน (ชื่อร้าน + โลโก้ขาวดำ + ช่วงวันที่รูปแบบ `DD/MM/YYYY - DD/MM/YYYY`)
- `OverviewMetrics` — ตัวเลขสรุปภาพรวม
- `SalesTable` / `RepairsTable` / `PurchasesTable` — ตารางรายละเอียด
- หลัก "Parts Used" ใน RepairsTable แสดง **เฉพาะชื่อ+จำนวน** (ไม่แสดงราคา — v2.3.0)

## รูปแบบการโต้ตอบ (Interaction Patterns)

- **Optimistic UI** — หลัง submit form ตารางอัปเดตทันที **ไม่ reload หน้า**:
  - ใช้ tRPC `useMutation` + `utils.invalidate()` (ทำสำเร็จใน Stock แล้ว ขยายไป Sales/Customers ใน v2.3.0)
  - แสดง toast แจ้งสำเร็จ
- **Form validation** — Zod ทั้ง client (tRPC infer) และ server
- **Error handling** — โยน `TRPCError` → แสดงข้อความไทยใน UI (เช่น "สต็อกไม่พอ")
- **Date range filter** — คอมโพเนนต์เลือกช่วงเวลาแบบเดียวกันใช้ซ้ำ (today/7days/thismonth)
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
