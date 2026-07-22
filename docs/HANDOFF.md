# Handoff — ✅ v1.3.0 (C4) released ลง production · เป้าถัดไปกลับแผนหลัก C9

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-22, session 10):** 🟢 **v1.3.0 (C4 Financials module) released ลง production แล้ว**
>
> - session 10: `/implement` C4 → `/code-review` (0 hard) → verify (test+parity+browser) → bump version → **merge main + tag `v1.3.0` + GitHub Release** · issue `#8` CLOSED
> - **C4 จบสมบูรณ์** — `src/server/financials.ts` + 3 call sites · ไม่แตะ DB · เลขกำไรเท่าเดิม (parity `Δ=0` บน 538 repairs)
> - prod = **v1.3.0** (`main` = `fd28488` = tag `v1.3.0` = GitHub Release Latest) · develop = `f8b2396`
> - **งานถัดไป = กลับแผนหลัก** → C9 (Money type · MAJOR · ⚠️แตะ DB) หรือ C10 (Speculative) · ดูตารางด้านล่าง

---

## 🗺️ แผนหลัก C1–C10 + ตำแหน่งปัจจุบัน

> แผนหลัก = `docs/architecture-review-20260705-th.html` (badge = ความสำคัญ)

| C       | ชื่อ                       | badge              | สถานะ                                              |
| ------- | -------------------------- | ------------------ | -------------------------------------------------- |
| **C1**  | EntityPicker               | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                 |
| **C2**  | Repair pricing             | 🟡 Worth exploring | ⚙️ จบด้วย ADR-0001 (คง residual model ไม่แก้โค้ด)  |
| **C3**  | Stock deduction            | 🟢 Strong          | ✅ ทำแล้ว · v1.1.0                                 |
| **C4**  | Financial aggregation      | 🟢 Strong          | ✅ ทำแล้ว · v1.3.0 · issue #8                      |
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

- **release v1.3.0 (C4)** _(session 10)_ — merge `fd28488` + tag + GitHub Release · C4 Financials module · issue `#8` CLOSED
- **C4 implement + code-review** _(session 10)_ — `src/server/financials.ts` + 3 call sites · `/code-review` 0 hard · parity `Δ=0`
- **C4 grilled + design doc** _(session 9)_ — `docs/c4-financials-design.md` + Financials module term ใน `CONTEXT.md`
- **release v1.2.1** _(session 8)_ — merge `df504f0` + tag + GitHub Release · เปิด pagination pageSize 25 + clone tooling
- **clone script** _(session 8)_ — `scripts/clone-prod-to-dev.ts` + `.env.prod-readonly.local` (gitignored)
- **release v1.2.0** _(session 7)_ — DataTable<T> module + 7 call sites · issue #6 CLOSED
- **release v1.1.0** _(session 4)_ — C1/C3/C5/C6/C7 + แยก env dev/prod + กฎ versioning

---

## 📍 สถานะ git

- **สาขาปัจจุบัน = `develop`** (= `f8b2396` · commit + push แล้ว)
- **`main` = `fd28488`** (= origin/main = tag `v1.3.0` = GitHub Release Latest)
- **tag บน GitHub:** `v1.0.0`, `v1.1.0`, `v1.2.0`, `v1.2.1`, `v1.3.0`
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

## 🏷️ v1.3.0 released เรียบร้อย ✅

> C4 ลง production แล้ว (`fd28488` + tag `v1.3.0` + GitHub Release) · รอบถัดไป = แผนหลัก C9/C10
> กฎ release ครั้งต่อไป → `CLAUDE.md` section 🏷️ Versioning
> ⚠️ merge + tag + push main โดน Claude auto-classifier บล็อก → **ผู้ใช้รันเองผ่าน `!` prefix** (เหมือนครั้งนี้)

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: v1.3.0 (C4 Financials module) released ลง production แล้ว · C4 จบสมบูรณ์
- prod = v1.3.0 (main fd28488 = tag v1.3.0 = GitHub Release) · develop = f8b2396 · working tree สะอาด
- C4: src/server/financials.ts + 3 call sites · ไม่แตะ DB · parity Δ=0 (538 repairs) · /code-review 0 hard · issue #8 CLOSED

เป้าหมาย: กลับแผนหลัก → C9 (Money type · MAJOR · แตะ DB) หรือ C10 (Speculative)
- C9 ต้องเริ่มด้วย /grill-with-docs + ทดสอบ migration บน dev (โคลนจาก prod) ก่อน merge main
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
