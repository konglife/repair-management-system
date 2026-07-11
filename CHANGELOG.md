# Changelog

คู่มือการเปลี่ยนแปลงของโปรเจ็กต์ — สรุปจาก git history
รูปแบบอิง [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) เวอร์ชัน [Semantic Versioning](https://semver.org/)

ปัจจุบันใช้งานจริงบนสาขา `main` (production) · พัฒนาต่อบน `develop`

---

## [Unreleased]

_ยังไม่มีการเปลี่ยนแปลง_

---

## [1.1.0] — 2026-07-11

Release แรกหลัง v1.0.0 (~11 เดือน) — รวมงาน architecture review ทุก Strong badge + แยก environment dev/prod ชัดเจน · ไม่มี DB migration (ของเดิมยังใช้ได้ปกติ)

### Added — ฟีเจอร์ (architecture review C-series)

- **C1** `EntityPicker` — รวม autocomplete เป็น deep module + ย้าย 3 หน้า (`7f498c9`)
- **C3** stock module — รวม validate + deduct สต็อกเป็น module เดียว (sale/repair) (#3)
- **C5** auth seam — ปิดรู auth ของ `getMonthlySummary` (`b262c18`)
- **C6** date-range module — รวมช่วงวัน canonical (`today/7days/1month`) เป็น deep module + unify semantic (#4)
- **C7** `DatePicker` — สกัดเป็น deep module + unify 4 หน้า (reports/sales/repairs/stock) (#5)

### Added — เครื่องมือ / เอกสาร

- **pre-commit hooks** (husky + lint-staged + typecheck) (`69f8944`)
- ชุดเทส 650 ตัว (component = source of truth) + เคลียร์หนี้เทส 16 suite
- เริ่มใช้ **Matt Pocock skills** เพื่อขับเคลื่อนการพัฒนา (`/grill-with-docs` flow)
- เอกสาร reference ชุดใหม่: `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/API-DOCS.md`, `docs/UI-UX-SPECIFICATION.md`
- `CONTEXT.md` (glossary) — เริ่มสร้างใหม่จากกระดาษเปล่าผ่าน `/grill-with-docs`
- `docs/agents/` — config สำหรับ Matt skills (issue tracker / triage labels / domain)
- `README.md` — เพิ่มส่วน Matt skill flow + ปรับปรุงโครงสร้าง
- `CHANGELOG.md` — สร้างใหม่ (ไฟล์นี้)

### Changed

- **#7** refactor — เก็บกวาด EntityPicker/pickers code-smell (`dfb2d6c`)
- dashboard `1month` เปลี่ยนเป็น **rolling 30 วัน** (ย้อนจากวันนี้) แทนค่าเดิม — intent ของ #4
- ล้างเอกสาร domain เก่า (`CONTEXT.md`, `docs/agents/`) เพื่อเริ่ม Matt flow จากกระดาษเปล่า
- อัปเดต `CLAUDE.md`: เพิ่มกฎ/โฟลว์/env + เปลี่ยน database จาก NeonDB เป็น Prisma Postgres (Vercel)
- แยก environment dev/prod ชัดเจน (DB คนละ instance)

### Fixed

- แก้ React Server Components CVE vulnerabilities (2025-12)

### Internal

- `.gitattributes` (LF) + `.env.example` + ปรับ `.gitignore`
- ignore `.claude/` ทั้งโฟลเดอร์ (local-only)
- Commit Conventions: co-author email ใช้ของ github.com/claude

---

## [1.0.0] — 2025-08-31 (Official Release)

เวอร์ชัน official release แรก ครอบคลุมงานพัฒนา MVP ถึง v2.3.0 ทั้งหมด
Tag: `v1.0.0` (commit `version to 1.0.0 for official release`)

### v2.3.0 — UX & Reports Enhancement (2025-08-31)

#### Added

- โลโก้ร้านบนหัวรายงานสรุป (grayscale, ดึงจาก `BusinessProfile.logoUrl`)
- หัวรายงานใช้คั่นช่วงวันที่ด้วย " - " (`DD/MM/YYYY - DD/MM/YYYY`)

#### Changed

- ฟอร์ม Sales & Customers ใช้ optimistic UI (`useMutation` + `utils.invalidate()`) ไม่ reload หน้า — ทำให้เหมือน Stock module
- คอลัมน์ "Parts Used" ในรายงานซ่อม แสดงเฉพาะชื่อ+จำนวน (เอาราคาออก)

### v2.2.0 — Dashboard Overhaul (2025-08-30)

#### Added

- ข้อมูลเพิ่มเติมใน tRPC endpoint สำหรับ dashboard
- ดีไซน์ Overview UI ใหม่ + ปรับ Data Table components

#### Changed

- แก้ปัญหา Prisma client บน serverless (singleton) + เพิ่ม `prisma generate` ใน build script สำหรับ Vercel

### v2.1.0 — Reports & Forms Enhancement (2025-08-25 ~ 08-29)

#### Added

- หน้ารายงานสรุป (`/reports/summary`) + นำทางจากหน้า reports
- ฟอร์ม Stock/Sales/Repairs ปรับปรุง
- การดึงข้อมูลบนหน้า report

#### Changed

- ล้าง PDF generation logic เก่าออก

### v2.0 — Dashboard Analytics & UX Polish (2025-08-22 ~ 08-24)

#### Added

- การ์ด analytics dashboard + ตัวเลือกช่วงเวลา
- Recent Activities feed
- หน้า Settings + ตั้งค่า stock threshold
- หน้ารายงาน + PDF generation
- Universal search
- Sidebar toggle
- Localize currency (บาท)
- Numeric input enhancement
- มาตรฐาน label ของฟอร์ม

#### Changed

- ขยาย module Stock & Customer, Sales, Repairs

### MVP — Foundation (2025-08-15 ~ 08-19)

#### Added

- โครงสร้างเริ่มต้นจาก Create Next App (2025-08-15)
- ผูก **Clerk** สำหรับ authentication/authorization
- ระบบ layout ตอบสนอง (MainLayout/Sidebar/Header) + แสดง user profile
- จัดการ Category + Product (CRUD)
- จัดการ Unit + Product validation + API router tests
- Purchase records + คำนวณต้นทุนเฉลี่ยถ่วงน้ำหนัก
- จัดการลูกค้า (CRUD) + แก้ไข + ประวัติธุรกรรม
- หน้า Sales + สร้างงานขาย + รายละเอียด
- หน้า Repairs + สร้างงานซ่อม + รายละเอียด
- Dashboard Data API + การ์ดสรุป + ตัวเลือกช่วงเวลา
- Trend Graph บน dashboard

---

## หมายเหตุ

- รายละเอียดเชิงเทคนิคของแต่ละเวอร์ชันดูได้ที่ `docs_archive/` (เอกสาร PRD/architecture รุ่นเก่า)
- กฎ/โฟลว์ deployment ดู `CLAUDE.md` ส่วน "Branch & Deployment Strategy"
- การเปลี่ยนแปลงหลัง v1.0.0 ยังอยู่ใน `[Unreleased]` จนกว่าจะ release เวอร์ชันใหม่
