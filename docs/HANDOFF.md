# Handoff — C4 implement เสร็จ + push develop · รอ release v1.3.0

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-22, session 10):** 🟢 **C4 (Financial aggregation) implement เสร็จ + push develop แล้ว** — รอ release
>
> - session 10: `/implement` C4 ตาม design doc → สร้าง `src/server/financials.ts` + ดัดแปลง 3 call sites · `/code-review` (0 hard) · เปิด+ปิด issue `#8`
> - verify: 679/679 เขียว · tsc+lint สะอาด · parity บน dev DB (538 repairs) `Δ=0` · commit `632a9e8` push แล้วบน develop
> - **งานถัดไป = release v1.3.0** (merge develop→main + tag) — **รอผู้ใช้สั่ง** · ยังไม่ release
> - prod ยัง = v1.2.1 (`main` = `df504f0`) · develop = `632a9e8`

---

## 🎯 เป้าหมายเซสชันถัดไป = **release v1.3.0 (C4)**

C4 implement เสร็จ + verify ครบ + push develop แล้ว (commit `632a9e8`) → เหลือแค่ release

**สรุปสิ่งที่ทำ (session 10):**

- สร้าง `src/server/financials.ts` (pure functions: `salesProfit` / `repairMargin` / `grossProfit`) + unit test
- ดัดแปลง 3 call sites: `dashboard.getSummary` · `reports.getMonthlySummary` · `sale.getById` → ใช้กล่อง canonical
- ปลด coupling จากชื่อฟิลด์ `laborCost` ที่หลอก → ใช้ `totalCost − partsCost` ตรงๆ (ADR-0001)
- `/code-review`: Standards 0 hard · Spec 0 hard · แก้ naming drift (`repairMarginValue`) · issue `#8` CLOSED

**Verify (ครบ):**

- `npm test` 679/679 เขียว · tsc + lint สะอาด
- parity บน dev DB (ข้อมูล prod จริง 538 repairs + 44 sales): per-repair invariant เคร่งครัด · กำไรเก่า vs ใหม่ `Δ = 0.000000`

**ขั้นตอน release (รอผู้ใช้สั่ง):**

1. แก้ version files บน develop → `package.json`, `CHANGELOG.md`, `src/components/layout/sidebar.tsx` (ดู `CLAUDE.md` 🏷️ Versioning)
2. commit → `git merge --no-ff develop` ลง main → `git tag v1.3.0` → push develop + main + tag
3. ⚠️ merge/tag/push main โดน Claude auto-classifier บล็อก → **ผู้ใช้รันเองผ่าน `!` prefix**

> **อ้างอิง C4:** `docs/c4-financials-design.md` (grill 7 ข้อ + interface + ขั้นตอน) · `docs/adr/0001-repair-pricing-residual-margin.md`

---

## 🗺️ แผนหลัก C1–C10 + ตำแหน่งปัจจุบัน

> แผนหลัก = `docs/architecture-review-20260705-th.html` (badge = ความสำคัญ)

| C       | ชื่อ                       | badge              | สถานะ                                              |
| ------- | -------------------------- | ------------------ | -------------------------------------------------- |
| **C1**  | EntityPicker               | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                 |
| **C2**  | Repair pricing             | 🟡 Worth exploring | ⚙️ จบด้วย ADR-0001 (คง residual model ไม่แก้โค้ด)  |
| **C3**  | Stock deduction            | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                 |
| **C4**  | Financial aggregation      | 🟢 Strong          | ✅ ทำแล้ว (develop) · รอ release v1.3.0 · issue #8 |
| **C5**  | Auth seam                  | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                 |
| **C6**  | Date-range                 | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                 |
| **C7**  | Date input (DatePicker)    | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                 |
| **C8**  | List + search + pagination | 🟡 Worth exploring | ✅ ทำแล้ว · v1.2.0 + v1.2.1                        |
| **C9**  | Money type                 | 🟡 Worth exploring | ⬜ ยังไม่เริ่ม · ⚠️ แตะ DB (MAJOR candidate 2.0.0) |
| **C10** | แยกหน้า stock 1641 บรรทัด  | ⚪ Speculative     | ⬜ ยังไม่เริ่ม (ลำดับต่ำสุด)                       |

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

- **ADR-0001: Repair pricing = residual margin model** — `laborCost` semantic = margin ไม่ใช่ค่าแรง · `docs/adr/0001-repair-pricing-residual-margin.md`
- **C4 design doc** — `docs/c4-financials-design.md` (grill 7 ข้อ + interface + ขั้นตอน) — **implement เสร็จแล้ว session 10**
- **กฎ versioning** → `CLAUDE.md` section 🏷️ Versioning
- **C8 pagination** = optional config (`pageSize`) ใน `DataTable<T>` · รายละเอียด → `docs/c8-datatable-design.md`
- **C9 (Float/money)** = จุดเดียวที่จะแตะ DB จริง (MAJOR candidate) · **ทดสอบ migration บน dev ที่โคลนจาก prod** ก่อน merge main
- **`matchesAmount(amount, term)` helper** ใน `src/lib/utils.ts` — ฝากไว้ใช้ตอน C9

---

## ✅ สถานะงานที่จบแล้ว

- **C4 implement + code-review** _(session 10)_ — `src/server/financials.ts` + 3 call sites · `/code-review` 0 hard · parity `Δ=0` · issue `#8` CLOSED (ยังไม่ release)
- **C4 grilled + design doc** _(session 9)_ — `docs/c4-financials-design.md` + Financials module term ใน `CONTEXT.md`
- **release v1.2.1** _(session 8)_ — merge `df504f0` + tag + GitHub Release · เปิด pagination pageSize 25 + clone tooling
- **clone script** _(session 8)_ — `scripts/clone-prod-to-dev.ts` + `.env.prod-readonly.local` (gitignored)
- **release v1.2.0** _(session 7)_ — DataTable<T> module + 7 call sites · issue #6 CLOSED
- **release v1.1.0** _(session 4)_ — C1/C3/C5/C6/C7 + แยก env dev/prod + กฎ versioning

---

## 📍 สถานะ git

- **สาขาปัจจุบัน = `develop`** (= `632a9e8` · commit + push แล้ว)
- **`main` = `df504f0`** (= origin/main = tag `v1.2.1` = GitHub Release Latest)
- **tag บน GitHub:** `v1.0.0`, `v1.1.0`, `v1.2.0`, `v1.2.1`
- **working tree:** สะอาด (เหลือแค่ scratch `docs/1.csv`, `docs/2.csv` ตามปกติ)
- **GitHub Issues เปิด:** ไม่มี · ปิดแล้ว: `#3` `#4` `#5` `#6` `#7` `#8`

---

## 🧰 เครื่องมือ

### clone prod → dev (ทดสอบกับข้อมูลจริง)

- 🔁 `npm run db:clone-prod-to-dev` (prod URL อยู่ใน `.env.prod-readonly.local` แล้ว) — **ใช้แล้วใน C4 parity check** (เทียบเลขกำไรก่อน/หลัง refactor บนข้อมูลจริง · `Δ=0`)
- ⚠️ แตะ prod (read-only) → เตือนผู้ใช้ก่อนรันทุกครั้ง

### chrome-devtools MCP + CDP (verify UI)

- อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน · launcher: `bash scripts/chrome-debug.sh [url]`
- dev server: `npm run dev` (session ใหม่ต้อง start เอง) · **dev DB = ข้อมูล prod จริง** (โคลนไว้ session 8)

---

## 🏷️ Flow release v1.3.0 (C4 — รอผู้ใช้สั่ง)

> C4 implement เสร็จ + push develop แล้ว → เหลือ release · กฎเต็ม → `CLAUDE.md` section 🏷️ Versioning
> C4 = ฟีเจอร์ใหม่ (module) ของเดิมยังใช้ได้ = **MINOR** (`1.3.0`) · ไม่แตะ DB (ไม่ใช่ MAJOR)
> ขั้นตอน: แก้ version files บน develop → merge main → tag v1.3.0 → push
> ⚠️ merge + tag + push main โดน Claude auto-classifier บล็อก → **ผู้ใช้รันเองผ่าน `!` prefix**

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: C4 (Financial aggregation) implement เสร็จ + push develop แล้ว — รอ release v1.3.0
- src/server/financials.ts + 3 call sites (dashboard/reports/sale) · commit 632a9e8 บน develop
- verify: 679/679 เขียว · tsc+lint สะอาด · parity บน dev DB (538 repairs) Δ=0 · /code-review 0 hard · issue #8 CLOSED
- prod = v1.2.1 (main df504f0) · develop = 632a9e8 · working tree สะอาด

เป้าหมาย: release v1.3.0 (merge develop→main + tag) — รอคำสั่ง
- Matt flow: grill(เสร็จ) → design doc(เสร็จ) → implement(เสร็จ) → code-review(เสร็จ) → release(ต่อ)
- แก้ version files บน develop (package.json/CHANGELOG.md/sidebar.tsx) → merge main → tag → push
```

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                       | ที่อยู่                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| **C4 design doc** (Financials module)                 | `docs/c4-financials-design.md`                                      |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog | `CONTEXT.md`                                                        |
| **กฎ versioning + flow release**                      | `CLAUDE.md` → section 🏷️ Versioning                                 |
| **clone tool + ข้อยกเว้น env read-only**              | `CLAUDE.md` → section 📥 ข้อยกเว้น · `scripts/clone-prod-to-dev.ts` |
| C8 design doc (DataTable + pagination)                | `docs/c8-datatable-design.md`                                       |
| C7/C6/C3 design doc (deep-module precedent)           | `docs/c{7,6,3}-*.md`                                                |
| หนี้เทส pattern 11 ข้อ + root cause                   | `docs/test-debt-fix-plan.md`                                        |
| ระบบ chrome CDP+MCP (verify UI)                       | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh`         |
| ADR: residual margin model                            | `docs/adr/0001-repair-pricing-residual-margin.md`                   |
| สถาปัตยกรรม + deployment                              | `docs/ARCHITECTURE.md`                                              |
