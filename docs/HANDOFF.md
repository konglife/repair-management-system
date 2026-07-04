# Handoff — ส่งต่อเพื่อ grill ต่อ (วันถัดไป)

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · คำศัพท์ domain → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ + skill ที่แนะนำ**

---

## 🎯 เป้าหมายเซสชันถัดไป

**`/grill-with-docs` ต่อ** — ดำเนินการ grill ที่ค้างไว้ สร้าง `CONTEXT.md` ให้สมบูรณ์ขึ้น ก่อนเข้า `/to-prd`

ขณะนี้เราอยู่ใน skill `grill-with-docs` (เปิดโดยผู้ใช้) — หยุดพักไว้ตรง **คำถามที่ 2**

## ⏭️ จุดที่จะต่อ (สำคัญที่สุด)

คำถาม grill ที่ 2 ที่รอคำตอบจากผู้ใช้:

> **ขอบเขตของ "งานขาย" (Sale) vs "งานซ่อม" (Repair) ในชีวิตจริงของร้าน:**
> เวลาลูกค้ามาซ่อมแล้วใช้อะไหล่ — อะไหล่นั้นนับเป็น "งานขาย" ด้วยไหม หรือบันทึกเฉพาะในงานซ่อม?
> "งานขาย" โดยเฉพาะ = ขายของลอยๆ (ลูกค้าซื้อไปทำเอง) ใช่ไหม? และพบบ่อยแค่ไหนเทียบงานซ่อม?

**คำแนะนำที่เสนอไว้:** "งานขาย" = ขายของลอย ส่วนอะไหล่ในงานซ่อมบันทึกใน `UsedPart` คนละทาง (ตรงกับที่โค้ดแยก `Sale`/`UsedPart`) — แต่ต้องยืนยันกับผู้ใช้เพราะสัดส่วนจริงมีผลต่อมุมมอง/รายงาน

หลังได้คำตอบ → อัปเดต `CONTEXT.md` + ไล่ grill ต่อเรื่องอื่น (ปริมาณ/สัดส่วนการใช้งานจริง, คำถามที่ระบบตอบไม่ได้, สิ่งที่รำคาญตอนใช้)

## 🧭 Suggested skills (เซสชันถัดไป)

| Skill | เมื่อไหร่ |
|---|---|
| **`/grill-with-docs`** | ทันที — ต่อจากคำถามที่ 2 |
| `/to-prd` | หลัง grill จนแผนชัด → สรุปเป็น PRD → publish GitHub Issue |
| `/improve-codebase-architecture` | ถ้าผู้ใช้อยากสำรวจ architecture ทั้งระบบ (มี `CONTEXT.md` อ้างอิงได้แล้ว) |
| `/ask-matt` | ไม่แน่ใจใช้ skill ไหน |

## 📍 สถานะ

- **สาขา:** `develop` (ทุกอย่างอยู่ที่นี่ ไม่แตะ `main`/prod)
- **HEAD:** `93cb48c` + commit ใหม่เซสชันนี้ (docs + journal + handoff) — ดู `git log` / `CHANGELOG.md`
- **ปัญหาที่ยืนยันจากโค้ดแล้ว** (เอกสารไว้ใน `docs/API-DOCS.md` → "Known Issues"):
  1. `reports.getMonthlySummary` = `publicProcedure` (auth รั่ว) — router เดียวที่ public
  2. โมเดลราคางานซ่อม: `laborCost = totalCost − partsCost` (ยอดคงเหลือ, markup อะไหล่ถูกกองรวม)
  3. `laborCost` ติดลบได้
  4. เงินเก็บเป็น `Float` ทุกฟิลด์

## 📌 ค้างรอการตัดสินใจ

- **prod ค้าง deploy ~10 เดือน** — develop นำ main หลาย commit ต้องวางแผน release ระวัง (ดู `CHANGELOG.md` → `[Unreleased]`)
- **ยังไม่มี `docs/adr/`** — ADR จะเกิด lazy ตอน grill จน decision แข็งตัว (ตามเงื่อนไข 3 ข้อ ของ `domain-modeling`)
- บั๊ก 4 ข้อข้างบน **ยังไม่ได้ triage** เป็น GitHub Issue (รอหลัง grill เสร็จ → พิจารณา `/triage`)

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

| | ที่อยู่ |
|---|---|
| สถาปัตยกรรม + deployment | `docs/ARCHITECTURE.md` |
| ข้อมูล/ER | `docs/DATABASE.md` |
| API (routers/procedures/known issues) | `docs/API-DOCS.md` |
| หน้า/คอมโพเนนต์ | `docs/UI-UX-SPECIFICATION.md` |
| คำศัพท์ domain | `CONTEXT.md` |
| ประวัติเปลี่ยนแปลง | `CHANGELOG.md` |
| Matt skill flow | `README.md` → "Matt Pocock Skills Flow" |
| ระบบ journal | `docs/journal/README.md` |
| ข้อมูลอ้างอิงโปรเจ็กต์ (repo/team/vercel IDs) | commit `9f8bf4b` / `CLAUDE.md` |
