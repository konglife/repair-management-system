# Handoff — ส่งต่อไปทำ `/improve-codebase-architecture` (แชทถัดไป)

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · คำศัพท์ domain + รูปร่างธุรกิจ + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ + skill ที่จะใช้**

---

## 🎯 เป้าหมายเซสชันถัดไป

**`/improve-codebase-architecture`** — survey สถาปัตยกรรมทั้งระบบก่อนตัดสินใจ scope (ก่อนเข้า `/to-prd`)

ทำตาม process ของ skill แบบเคร่งครัด:
1. **Explore** — อ่าน `CONTEXT.md` + ADRs (`docs/adr/` — ยังไม่มี, lazy) ก่อน, แล้วใช้ Agent `subagent_type=Explore` เดินสำรวจโค้ด (ห้ามใช้ heuristic ตายตัว — สำรวจแบบ organic, โฟกัสจุดที่เจอ friction)
2. **HTML report** — เขียน self-contained HTML ลง OS temp dir (`%TEMP%/architecture-review-<ts>.html` บน Windows) ใช้ Tailwind+Mermaid CDN, มี before/after diagram ทุก candidate, `start <path>` เปิดให้ผู้ใช้ แล้วถาม "Which of these would you like to explore?" — **ห้าม propose interface ในขั้นนี้**
3. **Grilling loop** — พอผู้ใช้เลือก candidate → ใช้ skill `/grilling` เดิน design tree, แตะ `/domain-modeling` ค้างไว้ตามต้องการ

ใช้คำศัพท์ `/codebase-design` ตลอด: **module / interface / implementation / depth / deep / shallow / seam / adapter / leverage / locality** (ห้ามใช้ component/service/boundary/wrapper). ใช้ deletion test ทุกที่ที่สงสัยว่า shallow.

## ⏭️ จุดที่จะต่อ

แชทก่อนหน้าจะจะปล่อย Explore agents คู่ขนาน (server + UI) แต่ผู้ใช้ขอหยุดเพื่อส่งต่อ — **เริ่มจากขั้น Explore ใหม่ในแชทนี้** พร้อมบริบทที่สมบูรณ์กว่าเดิม (มีข้อมูล prod แล้ว)

### จุดที่คาดว่าจะเจอ friction (จากข้อมูลที่มี — ใช้เป็น hint ไม่ใช่ checklist)
**ฝั่ง server/business logic:**
- เก็บเงินเป็น `Float` ทุกฟิลด์ — มีที่ parse/round กลางไหม หรือกระจาย? `CurrencyInput` ของเดียว?
- โมเดลราคาซ่อม `laborCost = totalCost − partsCost` — คำนวณที่ไหน จาก input อะไน "repair intake" เป็น module เดียวหรือกระจาย?
- weighted-average cost ตอน purchase — deep module เดียวหรือ inline ใน router?
- stock deduction ซ่อม/ขาย — อยู่ที่ไหน transaction-safe ไหม ซ้ำกันไหม
- "อะไหล่ 0 บาท" (ลูกค้านำมาเอง) — special-case รั่วออกมาทุกที่หรือเป็น seam เดียว?
- `reports.getMonthlySummary` = `publicProcedure` (auth รั่ว) — บอกอะไรเกี่ยวกับ auth seam?
- zod schemas/validation — ซ้ำข้าม router ไหม

**ฝั่ง UI/forms (pain จริงของเจ้าของร้าน):**
- **Picker pattern ซ้ำ N ที่** — ProductAutocomplete/PartsAutocomplete/Customer picker ใช้ยาก เจอซ้ำใน Purchase/Sales/Repair → leverage สูง (deep module เดียวแทน N call sites)
- **inline form → Modal** ซ้ำทุก list page (Add Product/Add Purchase/Add Sale items)
- **ไม่มี pagination** ทุกหน้า (ลิสต์ยาว)
- **date picker ไม่เหมือนกัน** ข้าม Reports/หน้าอื่น
- **ความไม่สอดคล้องกันข้ามหน้า** — เจ้าของร้านเป็นห่วง "มาตรฐาน dev 2026"

## 🔎 ข้อมูลการใช้งานจริงจาก prod (เก็บแล้วใน `CONTEXT.md`)

ผู้ใช้อนุญาตให้ดูข้อมูลจริง (ร้านเล็กในหมู่บ้าน ไม่อ่อนไหว). **กฎเหล็ก: Claude ห้ามรับ DATABASE_URL prod หรือ execute บน prod** — เขียน SQL read-only aggregate ส่งให้ผู้ใช้รันเอง (วิธี 1). ข้อมูลที่เก็บไว้แล้ว:
- 92% เคส / 95.7% รายได้มาจากซ่อม · ขายของลอย 8% / 4.3%
- ~1.5-2 เคสซ่อม/วัน · บันทึก batch ตอนเย็น · ไม่มีงานซ่อมค้างคืน
- ทุกซ่อมมี `UsedPart` ≥1 (เพราะมี "อะไหล่ 0 บาท" ไว้ตอนลูกค้านำมาเอง)
- `laborCost` ติดลบ = 0 ครั้งใน 530 เคส · Float noise เห็น 141 cell จริง

raw CSV scratch อยู่ที่ `docs/1.csv` (overview) + `docs/2.csv` (รายเดือน) — **อย่า commit** (ข้อมูล prod)

## 🧭 Suggested skills

| Skill | เมื่อไหร่ |
|---|---|
| **`/improve-codebase-architecture`** | ทันที — ทำตาม process 3 ขั้นด้านบน |
| `/codebase-design` | ใช้คำศัพท์ + design-it-twice ตอนเลือก interface ของ deepened module |
| `/grilling` | หลังผู้ใช้เลือก candidate → เดิน design tree |
| `/domain-modeling` | ค้างไว้ตอบ — ตอนตั้งชื่อ concept ใหม่/ลับคำศัพท์ใน `CONTEXT.md` และสร้าง ADR lazy |
| `/to-prd` | หลัง architecture survey เสร็จ → เปลี่ยน pain backlog เป็น PRD/issue |

## 📍 สถานะ

- **สาขา:** `develop` (ไม่แตะ `main`/prod)
- **HEAD:** `1e0ca26`
- **ไฟล์เปลี่ยนยังไม่ commit:** `CONTEXT.md` (M) — เพิ่ม section "รูปร่างธุรกิจจริง" + "Workflow การใช้งานจริง" + "Pain points backlog". `docs/1.csv`/`docs/2.csv` untracked (scratch, อย่า commit)
- **`/grill-with-docs` จบแล้ว** ✅ — `CONTEXT.md` ครบพอเข้า architecture survey

## 📌 ค้างรอการตัดสินใจ

- **prod ค้าง deploy ~10 เดือน** — develop นำ main หลาย commit (ดู `CHANGELOG.md` → `[Unreleased]`)
- **บั๊ก 4 ข้อยังไม่ได้ triage** เป็น issue (auth รั่ว / labor model / negative labor / Float) — เอาเข้า `/to-prd` รวมกับ UX backlog ได้
- **ยังไม่มี `docs/adr/`** — เกิด lazy ตอน architecture survey + grilling จน decision แข็งตัว

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

| | ที่อยู่ |
|---|---|
| Domain + รูปร่างธุรกิจ + pain backlog | `CONTEXT.md` |
| สถาปัตยกรรม + deployment | `docs/ARCHITECTURE.md` |
| ข้อมูล/ER | `docs/DATABASE.md` |
| API (routers/procedures/known issues) | `docs/API-DOCS.md` |
| หน้า/คอมโพเนนต์ | `docs/UI-UX-SPECIFICATION.md` |
| ประวัติเปลี่ยนแปลง | `CHANGELOG.md` |
| Matt skill flow | `README.md` → "Matt Pocock Skills Flow" |
| ระบบ journal | `docs/journal/README.md` |
