# Handoff — C4 grilled + design doc พร้อม · แชทใหม่เข้า `/implement`

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-22, session 9):** 🟡 **C4 (Financial aggregation) grill เสร็จ + design doc พร้อมแล้ว** — ยังไม่ implement
>
> - session 9: เข้า `/grill-with-docs` ไล่ปัญหา C4 (7 ข้อ) → เขียน `docs/c4-financials-design.md` + เพิ่ม Financials module term ใน `CONTEXT.md`
> - **งานถัดไป = `/implement` ตาม design doc** (Matt flow: grill → design doc → implement → verify)
> - **ไม่ได้แตะโค้ด production** — แค่เขียน docs · commit + push แล้ว (`38260c0` บน develop)
> - prod ยัง = v1.2.1 (`main` = `df504f0`) · develop = `38260c0`

---

## 🎯 เป้าหมายเซสชันถัดไป = **`/implement` C4 ตาม design doc**

C4 = **รวมสูตรกำไรเข้ากล่องเดียว** (`src/server/financials.ts`) — refactor ฝั่ง server ไม่แตะ DB

**อ่านก่อน implement:**

1. **`docs/c4-financials-design.md`** ← design doc ฉบับเต็ม (grill 7 ข้อ + interface + ขั้นตอน + verify)
2. `docs/adr/0001-repair-pricing-residual-margin.md` — `laborCost` = margin (residual)
3. ส่วน C4 ใน `docs/architecture-review-20260705-th.html`

### สรุปการตัดสินใจ C4 (7 ข้อ — ล็อกแล้วใน grill)

| #   | ข้อตกลง                                                                           |
| --- | --------------------------------------------------------------------------------- |
| Q1  | scope = แค่ "รวมสูตร" ไม่ยุ่ง Float/Decimal (เก็บ C9)                             |
| Q2  | นิยามกำไรซ่อม = `totalCost − partsCost` (ไม่อ่านฟิลด์ `laborCost` ตรงๆ)           |
| Q3  | กล่อง = pure function รับค่า sum · ที่อยู่ `src/server/financials.ts`             |
| Q4  | call sites = ① dashboard ② reports ③ sale.getById (ปล่อย ④ `repair.getAnalytics`) |
| Q5  | ชื่อในโค้ด = `margin` (DB ยัง `laborCost` ค้างให้ C9)                             |
| Q6  | ไม่จัดการกำไรติดลบ (เป็น C2-remain คนละเรื่อง)                                    |
| Q7  | verify = unit test กล่อง + parity check (เลขก่อน/หลังเท่ากัน)                     |

### ขั้นตอน implement (incremental — ดู design doc ตารางเต็ม)

1. สร้าง `src/server/financials.ts` + `financials.test.ts` → verify: unit test เขียว
2. ดัดแปลง ① `dashboard.getSummary` (`_sum.laborCost` → `_sum.partsCost` ผ่าน `repairMargin`) → ค่าเท่าเดิม
3. ดัดแปลง ② `reports.getMonthlySummary` (รวมต่อแถว sale) → ค่าเท่าเดิม
4. ดัดแปลง ③ `sale.getById` → ค่าเท่าเดิม
5. `npm test` + tsc + lint → เขียว
6. parity check บน dev DB → เลขกำไร dashboard/reports ก่อน = หลัง เป๊ะ

> **คุณสมบัติสำคัญ:** refactor ที่เลขไม่เปลี่ยน (dashboard vs reports ออกเท่ากันอยู่แล้วโดยบังเอิญ — C4 แค่นิยามสูตรที่เดียว)

---

## 🗺️ แผนหลัก C1–C10 + ตำแหน่งปัจจุบัน

> แผนหลัก = `docs/architecture-review-20260705-th.html` (badge = ความสำคัญ)

| C       | ชื่อ                       | badge              | สถานะ                                               |
| ------- | -------------------------- | ------------------ | --------------------------------------------------- |
| **C1**  | EntityPicker               | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                  |
| **C2**  | Repair pricing             | 🟡 Worth exploring | ⚙️ จบด้วย ADR-0001 (คง residual model ไม่แก้โค้ด)   |
| **C3**  | Stock deduction            | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                  |
| **C4**  | Financial aggregation      | 🟢 Strong          | 🔶 **grilled + design doc พร้อม** → รอ `/implement` |
| **C5**  | Auth seam                  | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                  |
| **C6**  | Date-range                 | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                  |
| **C7**  | Date input (DatePicker)    | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                  |
| **C8**  | List + search + pagination | 🟡 Worth exploring | ✅ ทำแล้ว · v1.2.0 + v1.2.1                         |
| **C9**  | Money type                 | 🟡 Worth exploring | ⬜ ยังไม่เริ่ม · ⚠️ แตะ DB (MAJOR candidate 2.0.0)  |
| **C10** | แยกหน้า stock 1641 บรรทัด  | ⚪ Speculative     | ⬜ ยังไม่เริ่ม (ลำดับต่ำสุด)                        |

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

- **ADR-0001: Repair pricing = residual margin model** — `laborCost` semantic = margin ไม่ใช่ค่าแรง · `docs/adr/0001-repair-pricing-residual-margin.md`
- **C4 design doc** — `docs/c4-financials-design.md` (grill 7 ข้อ + interface + ขั้นตอน) — **อ่านก่อน implement**
- **กฎ versioning** → `CLAUDE.md` section 🏷️ Versioning
- **C8 pagination** = optional config (`pageSize`) ใน `DataTable<T>` · รายละเอียด → `docs/c8-datatable-design.md`
- **C9 (Float/money)** = จุดเดียวที่จะแตะ DB จริง (MAJOR candidate) · **ทดสอบ migration บน dev ที่โคลนจาก prod** ก่อน merge main
- **`matchesAmount(amount, term)` helper** ใน `src/lib/utils.ts` — ฝากไว้ใช้ตอน C9

---

## ✅ สถานะงานที่จบแล้ว

- **C4 grilled + design doc** _(session 9)_ — `docs/c4-financials-design.md` + Financials module term ใน `CONTEXT.md` (ยังไม่ implement)
- **release v1.2.1** _(session 8)_ — merge `df504f0` + tag + GitHub Release · เปิด pagination pageSize 25 + clone tooling
- **clone script** _(session 8)_ — `scripts/clone-prod-to-dev.ts` + `.env.prod-readonly.local` (gitignored)
- **release v1.2.0** _(session 7)_ — DataTable<T> module + 7 call sites · issue #6 CLOSED
- **release v1.1.0** _(session 4)_ — C1/C3/C5/C6/C7 + แยก env dev/prod + กฎ versioning

---

## 📍 สถานะ git

- **สาขาปัจจุบัน = `develop`** (= `38260c0` · commit + push แล้ว)
- **`main` = `df504f0`** (= origin/main = tag `v1.2.1` = GitHub Release Latest)
- **tag บน GitHub:** `v1.0.0`, `v1.1.0`, `v1.2.0`, `v1.2.1`
- **working tree:** สะอาด (เหลือแค่ scratch `docs/1.csv`, `docs/2.csv` ตามปกติ)
- **GitHub Issues เปิด:** ไม่มี · ปิดแล้ว: `#3` `#4` `#5` `#6` `#7`

---

## 🧰 เครื่องมือ

### clone prod → dev (ทดสอบกับข้อมูลจริง)

- 🔁 `npm run db:clone-prod-to-dev` (prod URL อยู่ใน `.env.prod-readonly.local` แล้ว) — **ใช้ parity check C4 ขั้น 6** (เทียบเลขกำไรก่อน/หลัง refactor บนข้อมูลจริง)
- ⚠️ แตะ prod (read-only) → เตือนผู้ใช้ก่อนรันทุกครั้ง

### chrome-devtools MCP + CDP (verify UI)

- อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน · launcher: `bash scripts/chrome-debug.sh [url]`
- dev server: `npm run dev` (session ใหม่ต้อง start เอง) · **dev DB = ข้อมูล prod จริง** (โคลนไว้ session 8)

---

## 🏷️ Flow release (เมื่อ C4 implement เสร็จ + พอใจ)

> ทำบน `develop` → merge main → tag → push · กฎเต็ม → `CLAUDE.md` section 🏷️ Versioning
> C4 = ฟีเจอร์ใหม่ (module) ของเดิมยังใช้ได้ = **MINOR** (1.3.0) · ไม่แตะ DB (ไม่ใช่ MAJOR)
> ⚠️ merge + tag + push main โดน Claude auto-classifier บล็อก → ผู้ใช้รันเองผ่าน `!` prefix

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: C4 (Financial aggregation) grill เสร็จ + design doc พร้อมแล้ว — ยังไม่ implement
- design doc: docs/c4-financials-design.md (grill 7 ข้อ + interface + ขั้นตอน + verify)
- docs ทั้งหมด commit + push แล้วบน develop (38260c0) · working tree สะอาด
- prod = v1.2.1 (main df504f0) · develop = 38260c0 · 671/671 เขียว

เป้าหมาย: /implement C4 ตาม design doc — รวมสูตรกำไรเข้า src/server/financials.ts (refactor ไม่แตะ DB)
- Matt flow: grill(เสร็จ) → design doc(เสร็จ) → implement(ต่อ) → verify
- หลัง implement ใช้ npm run db:clone-prod-to-dev เทียบเลขกำไรก่อน/หลัง (parity)
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
