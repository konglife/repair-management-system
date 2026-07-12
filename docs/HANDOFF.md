# Handoff — release 1.2.1 ลงแล้ว · เป้าถัดไป = กลับแผนหลัก (C4/C9)

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-12, session 8):** 🟢 **release v1.2.1 ลง production แล้ว** — เปิด pagination ทุกหน้า list (pageSize 25) + clone tooling · merge `df504f0` · tag `v1.2.1` + GitHub Release · tests 671/671 + tsc + lint เขียว · working tree สะอาด
>
> - **เป้าถัดไป = กลับไปแผนหลัก** เลือก **C4** (financial aggregation — ทบทวนจำเป็นไหม คู่ C2) หรือ **C9** (Money type — ⚠️ แตะ DB migration, MAJOR candidate)
> - session 8: release 1.2.1 + clone script + เปิด pagination · (session 7: C8 ปิดจบ loop)

---

## 🎯 เป้าหมายเซสชันถัดไป = **เลือก candidate ถัดไปจากแผนหลัก**

release 1.2.1 ลงแล้ว — งาน UI ค่อนข้างจบ ขั้นถัดไปคือ candidate ที่เหลือจาก architecture review:

1. **C4 — Financial aggregation** (🟢 Strong badge เดียวที่ค้าง)
   - คู่กับ C2 (ปิดด้วย ADR-0001 แล้ว) → **ทบทวนก่อนว่ายังจำเป็นไหม** (dashboard/reports/analytics คิดกำไร 3 แบบไม่เหมือนกัน · dashboard repair-profit ผิด)
   - ถ้าทำ → เข้า `/grill-with-docs` ก่อน (เหมือน C6/C7/C8)
2. **C9 — Money type** (🟡 Worth exploring · ⚠️ schema migration)
   - ⚠️ แตะ DB (Float → Decimal/Int-cents) = **จุดเดียวที่จะแตะข้อมูลจริง** → MAJOR candidate (2.0.0) · ต้องระวังสูง + clone prod→dev ทดสอบ migration ก่อน (ใช้ `npm run db:clone-prod-to-dev` ที่มีแล้ว)

> แนะนำเริ่ม C4 ก่อน (UI/logic ฝั่ง server ไม่แตะ DB = ปลอดภัย) ส่วน C9 เก็บไว้ทำเป็น MAJOR release ทีหลัง

---

## 🧰 เครื่องมือใหม่: โคลนข้อมูล prod → dev เพื่อทดสอบ

> เพิ่มใน session 8 — `npm run db:clone-prod-to-dev` (`scripts/clone-prod-to-dev.ts`)

- **วัตถุประสงค์** = โคลนข้อมูลจริงจากร้าน (prod) ลง dev เพื่อทดสอบ UI/logic กับข้อมูลจริงก่อน merge main (เช่น ตรวจ pagination ต้องเห็นข้อมูลเยอะ)
- 🔁 **รันซ้ำ = แค่ `npm run db:clone-prod-to-dev`** (prod URL อยู่ใน `.env.prod-readonly.local` แล้ว ไม่ต้องกรอกใหม่)
- 🛡️ guard กันทำลาย prod: prod client อ่าน (`findMany`/`count`) เท่านั้น · abort ถ้า prod/dev DB instance เดียวกัน (เช็ค **username** ไม่ใช่ host — Prisma Postgres ใช้ host เดียวกัน `db.prisma.io`) · confirm `YES` ก่อนลบ dev · clone ใน `dev.$transaction` (พัง→rollback dev)
- ⚠️ แตะ prod (read-only) → **เตือนผู้ใช้ก่อนรันทุกครั้ง** ตามกฎเหล็ก
- กรอกครั้งแรก → `.env.prod-readonly.example` (ทำไปแล้วในเครื่องนี้)
- รายละเอียด/ข้อยกเว้น env → `CLAUDE.md` section 📥 ข้อยกเว้น

---

## 🏷️ Flow release (ทำบน develop → merge main → tag → push)

> กฎเต็ม → `CLAUDE.md` section 🏷️ Versioning · ห้ามแก้บน main ตรงๆ
> ⚠️ **สังเกต session 8**: `git merge --no-ff develop` ลง main + `git tag` โดน **Claude auto-classifier บล็อก** (กัน push main) → ต้องให้ผู้ใช้รัน merge+tag+push เองผ่าน `!` prefix (merge + tag + push เป็นคำสั่งเดียว)

---

## 🗺️ แผนหลัก C1–C10 + ตำแหน่งปัจจุบัน

> แผนหลัก = `docs/architecture-review-20260705-th.html` (badge = ความสำคัญ)

| C       | ชื่อ                       | badge                       | สถานะ                                                        |
| ------- | -------------------------- | --------------------------- | ------------------------------------------------------------ |
| **C1**  | EntityPicker               | 🟢 Strong                   | ✅ ทำแล้ว · v1.1.0                                           |
| **C2**  | Repair pricing             | 🟡 Worth exploring          | ⚙️ จบด้วย ADR-0001 (คง residual model ไม่แก้โค้ด)            |
| **C3**  | Stock deduction            | 🟢 Strong                   | ✅ ทำแล้ว · v1.1.0                                           |
| **C4**  | Financial aggregation      | 🟢 Strong                   | ❌ **ค้าง** (Strong เดียวที่เหลือ · คู่ C2 · ทบทวนจำเป็นไหม) |
| **C5**  | Auth seam                  | 🟢 Strong                   | ✅ ทำแล้ว · v1.1.0                                           |
| **C6**  | Date-range                 | 🟢 Strong                   | ✅ ทำแล้ว · v1.1.0                                           |
| **C7**  | Date input (DatePicker)    | 🟢 Strong                   | ✅ ทำแล้ว · v1.1.0                                           |
| **C8**  | List + search + pagination | 🟡 Worth exploring          | ✅ ทำแล้ว · v1.2.0 (module) + v1.2.1 (**เปิด pagination**)   |
| **C9**  | Money type                 | 🟡 Worth exploring          | ⬜ ยังไม่เริ่ม · ⚠️ แตะ DB (MAJOR candidate 2.0.0)           |
| **C10** | แยกหน้า stock 1641 บรรทัด  | ⚪ Speculative / in-process | ⬜ ยังไม่เริ่ม (ลำดับต่ำสุด)                                 |

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

- **ADR-0001: Repair pricing = residual margin model** — `laborCost` semantic = margin ไม่ใช่ค่าแรง · `docs/adr/0001-repair-pricing-residual-margin.md`
- **กฎ versioning** → `CLAUDE.md` section 🏷️ Versioning
- **C8 pagination** = optional config (`pageSize`) ใน `DataTable<T>` · เปิดใช้ทุกหน้าตอน v1.2.1 (25 แถว/หน้า) · รายละเอียด → `docs/c8-datatable-design.md`
- **C9 (Float/money)** = จุดเดียวที่จะแตะ DB จริง (MAJOR candidate) · **ทดสอบ migration บน dev ที่โคลนจาก prod** ก่อน merge main
- **`matchesAmount(amount, term)` helper** ใน `src/lib/utils.ts` — ฝากไว้ใช้ตอน C9

---

## ✅ สถานะงานที่จบแล้ว

- **release v1.2.1** _(session 8)_ — merge `df504f0` + tag + GitHub Release + bump 1.2.1 · เปิด pagination pageSize 25 (7 หน้า) + clone tooling
- **clone script** _(session 8)_ — `scripts/clone-prod-to-dev.ts` + `.env.prod-readonly.local` (gitignored) + guard username · CLAUDE.md ข้อยกเว้น
- **release v1.2.0** _(session 7)_ — DataTable<T> module + 7 call sites + matchesAmount · issue #6 CLOSED
- **release v1.1.0** _(session 4)_ — C1/C3/C5/C6/C7 + แยก env dev/prod + กฎ versioning

---

## 📍 สถานะ git

- **สาขาปัจจุบัน = `develop`** (= `3c23dc9` = origin/develop)
- **`main` = `df504f0`** (= origin/main = tag `v1.2.1` = GitHub Release Latest)
- **tag บน GitHub:** `v1.0.0`, `v1.1.0`, `v1.2.0`, `v1.2.1`
- **working tree:** สะอาด (เหลือแค่ scratch `docs/1.csv`, `docs/2.csv` ตามปกติ)
- **GitHub Issues เปิด:** ไม่มี · ปิดแล้ว: `#3` `#4` `#5` `#6` `#7`

---

## 🛠️ chrome-debugtools MCP + CDP (verify UI)

ใช้ตอน browser-verify. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- launcher: `bash scripts/chrome-debug.sh [url]` (copy session จาก profile จริง → debug profile → port 9222)
- ⚠️ ถ้า Chrome debug ปิด → รัน launcher ใหม่ · กฎ: เปิดครั้งเดียว ใช้ยาวทั้ง session
- dev server: `npm run dev` (CLAUDE.md บอกรันอยู่แล้ว — **แต่ session ใหม่อาจปิดอยู่จริง ต้อง start เอง**)
- **dev DB = ข้อมูล prod จริง** (โคลนไว้ session 8) → browser-verify บน dev เจอข้อมูลเยอะเหมือนร้าน

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: release v1.2.1 ลง prod แล้ว — pagination ทุกหน้า (25/หน้า) + clone tooling · main = df504f0 = tag v1.2.1
- develop = 3c23dc9 · working tree สะอาด · 671/671 เขียว

เป้าหมายถัดไป: กลับแผนหลัก — เลือก C4 (financial aggregation · ทบทวนจำเป็นไหม) หรือ C9 (Money type · ⚠️ แตะ DB = MAJOR)
- clone tool พร้อม: npm run db:clone-prod-to-dev (ทดสอบ migration C9 บน dev ที่โคลนจาก prod ได้)
```

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                       | ที่อยู่                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog | `CONTEXT.md`                                                        |
| **กฎ versioning + flow release**                      | `CLAUDE.md` → section 🏷️ Versioning                                 |
| **clone tool + ข้อยกเว้น env read-only**              | `CLAUDE.md` → section 📥 ข้อยกเว้น · `scripts/clone-prod-to-dev.ts` |
| **C8 design doc** (DataTable + pagination)            | `docs/c8-datatable-design.md`                                       |
| **C7/C6/C3 design doc** (deep-module precedent)       | `docs/c{7,6,3}-*.md`                                                |
| หนี้เทส pattern 11 ข้อ + root cause                   | `docs/test-debt-fix-plan.md`                                        |
| ระบบ chrome CDP+MCP (verify UI)                       | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh`         |
| ADR: residual margin model                            | `docs/adr/0001-repair-pricing-residual-margin.md`                   |
| สถาปัตยกรรม + deployment                              | `docs/ARCHITECTURE.md`                                              |
