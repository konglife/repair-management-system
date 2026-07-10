# Handoff — #7 (code-smell) เสร็จ + browser-verify C3 → ถัดไปเลือก C6/C7/C8

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-10):** ✅ **#7 (code-smell EntityPicker/pickers) เสร็จ + browser-verify · C3 ก็ browser-verify ผ่านแล้ว**
>
> - **C3 browser-verify ผ่าน** (ผู้ใช้ตรวจเองบน dev — สร้าง sale/repair + ขายเกินสต็อก error)
> - **#7** — refactor `EntityPicker.tsx` (extract `reset()` + rename `highlight`→`highlightedIndex`) + `pickers.tsx` (`VARIANT_CONFIG` Record + เอา `as number` ออก) · commit `dfb2d6c` · **browser-verify ผ่าน** (3 variants + filter + keyboard + clear + escape)
> - ผ่าน `/code-review`: Standards 0 hard · Spec ครบ 4 (scope creep เล็กน้อยของ VARIANT_CONFIG แต่ defensible)
> - **`npm test`: 52 suite / 639 pass / 0 skip / 0 fail** · lint + tsc สะอาด
> - **`develop` = `origin/develop`** (commit ล่าสด `dfb2d6c`) · Vercel dev deploy READY · **ปิด issue #7**
> - working tree สะอาด (เหลือ `docs/1.csv`/`docs/2.csv` scratch — ห้าม commit)
> - **ไม่แตะ `main`/prod ทั้งหมด**

---

## 🎯 เป้าหมายเซสชันถัดไป

**โฟลว์: เลือก issue → `/grilling` ออกแบบ interface → implement (TDD) → `/code-review` → browser-verify → ปิด issue**
(ทุก issue มี rationale + ตำแหน่งไฟล์ใน body — เข้า grill เลย ไม่ต้อง /to-prd เพราะมาจาก architecture review แล้ว)

Issue ที่เปิดอยู่ 3 ใบ — เลือก 1 เข้า `/grilling`:

| Issue     | งาน                                                                   | ขนาด | หมายเหตุ                                                                 |
| --------- | --------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------ |
| **#4 C6** | รวม switch date-range ซ้ำ ~150 บรรทัด ใน 6 ที่                        | กลาง | ⭐ แนะนำถัดไป — logic deepening คุ้มที่สุด, ลดซ้ำเยอะ, มีบรรทัดฐานจาก C3 |
| **#5 C7** | DatePicker module เดียว (Reports ใช้ date input ต่างจากหน้าอื่น)      | กลาง | UI — ดู `CONTEXT.md` pain "date picker ไม่สอดคล้อง"                      |
| **#6 C8** | DataTable module (6 หน้า list เขียน search เอง + ยังไม่มี pagination) | ใหญ่ | UI — ดู `CONTEXT.md` pain "ไม่มี pagination, picker ใช้ยากซ้ำ"           |

> **แนะ #4 C6** ก่อน — เป็นฝั่ง logic (มี design pattern จาก C3 `validateAndDeductStock`), ตัดซ้ำได้ชัด, และเป็น warm-up ดีก่อนเข้า 2 งาน UI ใหญ่กว่า

**ก่อน grill:** อ่าน body issue (`gh issue view 4`) หาตำแหน่งไฟล์ 6 ที่ที่ซ้ำ + อ่าน design doc บรรทัดฐาน (`docs/c1-entitypicker-design.md` / `docs/c3-stock-design.md`) เพื่อเทียบรูปแบบ decision log

**C9 (money module ฝั่ง server) ยังไม่เปิด issue** — รอผู้ใช้ triage (ดู `docs/architecture-review-20260705-th.html` §C9)

---

## ✅ สถานะงานที่จบแล้ว

- **#7 (code-smell EntityPicker/pickers)** — refactor + code-review + browser-verify ผ่าน · commit `dfb2d6c` · **ปิด #7**
  - `EntityPicker.tsx`: extract `reset()` (3 handler) + rename `highlight`→`highlightedIndex`
  - `pickers.tsx`: `VARIANT_CONFIG` Record รวม variant branch + เอา `as number` ออก (priceField lock ใน type)
  - browser-verify 3 variants (sale/part/purchase) + filter + keyboard nav + clear + escape — พฤติกรรมเหมือนเดิม 100%
- **C3 (stock module)** — ship + code-review ผ่าน · committed `1b9a16f` + `e211129` · merge develop `f3ba78b` · **ปิด #3** · **browser-verify ผ่าน (ผู้ใช้ตรวจเอง)**
  - `validateAndDeductStock(tx, items)` ใน `src/server/stock.ts` (deep module)
  - แทน validate+deduct block ใน `sale.create`/`repair.create` · router net −93 บรรทัด
  - `stock.test.ts` 7 cases (happy/not-found/insufficient/exact/duplicate/multi-item-fail/empty)
  - design: `docs/c3-stock-design.md` (decision log 10 ข้อ จาก /grilling)
  - ⚠️ **behavior note**: order เปลี่ยน (deduct มาก่อน customer-validate + create) แต่ tx เดียว rollback ด้วยกัน = DB state เท่าเดิม (error ordering เปลี่ยน — ดู design doc §ความเสี่ยง)
  - ⚠️ **router test เดิม (`sale.test.ts`/`repair.test.ts`) เป็น fake** — re-implement logic ในไฟล์ test ไม่ได้ test router จริง (test-debt) → `stock.test.ts` คือ safety net จริงตัวแรกของ stock logic
- **rewrite stock skips (6 tests)** — committed `a2f3346` + pushed
- **GitHub Issues เปิด 4 ใบคงเหลือ** — `#4` C6 / `#5` C7 / `#6` C8 / `#7` code-smell (label `enhancement,needs-triage`) · #3 ปิดแล้ว
- **C5 (auth seam)** — `reports.getMonthlySummary` public→protected · committed `b262c18`
- **setup-pre-commit** (Husky + lint-staged + typecheck) — committed `69f8944` · gate lint+typecheck+test ทุก commit
- **C1 (EntityPicker)** — ship + verify browser + code-review ผ่าน · committed `7f498c9`
  - สร้าง `EntityPicker<T>` (deep module) + `ProductPicker`/`CustomerPicker` adapters (`src/components/ui/EntityPicker.tsx`, `pickers.tsx`)
  - ลบ `ProductAutocomplete` + `PartsAutocomplete` (และ test) · ย้าย sales/repairs/stock มาใช้ครบ
  - TDD เขียว: `EntityPicker.test.tsx` (10) + `pickers.test.tsx` (6) · design: `docs/c1-entitypicker-design.md`
- **หนี้เทส 10 suite เขียว** — committed `316e976` (แก้เทสให้ตรง component = source of truth)
- **docs** — committed `2459602` (C1 design + ADR-0001 + test-debt plan + chrome CDP + arch review)
- **architecture review** (`/improve-codebase-architecture`) — 10 candidates (HTML report)
- **chrome-devtools MCP + CDP** — ตั้งครบ + login ผ่านแล้ว (ดู `docs/agents/chrome-cdp-mcp.md`)

---

## 🧹 Code-review smell backlog

~~C1 smell minor 4 ข้อ~~ → **จบหมดแล้วใน #7** (commit `dfb2d6c`):

1. ✅ Duplicated Code → extract `reset()`
2. ✅ Primitive Obsession → `VARIANT_CONFIG` Record
3. ✅ Type hole → เอา `as number` ออก
4. ✅ Mysterious Name → `highlight`→`highlightedIndex`

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

**ADR-0001: Repair pricing = residual margin model (อย่าแยก labor vs markup)**

- เจ้าของร้านคิดเงินแบบ residual: กรอก `totalCost` → `margin = totalCost − partsCost` = "เงินเข้ากระเป๋า"
- **ไม่ต้องการแยก labor กับ markup** · ฟิลด์ DB ชื่อ `laborCost` แต่ semantic จริง = margin
- ดู `docs/adr/0001-repair-pricing-residual-margin.md` + `CONTEXT.md` section "โมเดลราคางานซ่อม"

**ทำไม C-series ข้าม /to-prd → /to-issues:** มาจาก architecture review (มี rationale แล้ว) + grill ให้ design doc (ทำหน้าที่ PRD) + งานเล็ก/single-user

---

## 📌 งานแยก (ทำวันไหนก็ได้ ไม่รีบ)

- **prod ค้าง deploy ~10 เดือน** — develop นำ main หลาย commit + C1 + C5 + C3. release = merge develop→main (ผู้ใช้ตัดสินใจ)
- **ไม่มี GitHub CI/CD** — มีแค่ Vercel auto-deploy (build only), ไม่มี lint/typecheck/test gate บน remote, ไม่มี branch protection บน `main`. `gh` พร้อม (v2.92.0, login `konglife`). pre-commit hook (local) มีแล้ว แต่ GitHub CI ยังไม่มี
- **candidate ที่เหลือ** — C6/C7/C8 (ยังไม่ทำ) · C9 (Float) รอ triage เป็น issue · C3 + #7 ปิดแล้ว
- **smell backlog** — จบหมดแล้วใน #7

---

## 📍 สถานะไฟล์

- **สาขา:** `develop` (ไม่แตะ `main`/prod) · **= `origin/develop`** (sync แล้ว · commit ล่าสด `dfb2d6c`)
- **working tree สะอาด** (เหลือแค่ `?? docs/1.csv` / `?? docs/2.csv` — scratch prod **ห้าม commit**)
- **GitHub Issues เปิด:** `#4` `#5` `#6` (`enhancement,needs-triage`) · ปิดแล้ว: `#3` `#7` · ดูรายการ: `gh issue list`

---

## 🛠️ chrome-devtools MCP + CDP (verify UI)

ใช้ตอน verify UI. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- MCP config (`~/.claude.json`) ตั้ง `--browserUrl http://localhost:9222` → แนบเข้า Chrome ที่ผู้ใช้เปิดเอง
- **launcher:** `bash scripts/chrome-debug.sh [url]` — copy session จาก profile จริง → debug profile → เปิด debug port 9222
- ⚠️ ถ้า Chrome debug ปิดไปแล้ว → รัน launcher ใหม่ (cookie อยู่ใน profile → ไม่ต้อง login ใหม่ถ้ายังไม่หมดอายุ)
- ⚠️ ถ้า restart Claude Code → MCP โหลด `--browserUrl` ใหม่อัตโนมัติ

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: #7 (code-smell) เสร็จ + browser-verify · C3 ก็ browser-verify ผ่านแล้ว · production ค้าง release (develop นำ main 34 commits)
- npm test: 52 suite / 639 pass / 0 skip / 0 fail · lint+tsc สะอาด
- develop = origin/develop (commit ล่าสด 0fe52e0) · working tree สะอาด · Vercel dev deploy READY
- GitHub Issues เปิด: #4 C6 / #5 C7 / #6 C8 (ปิด #3 + #7 แล้ว)
- ADR-0001: residual pricing model ถูกต้อง — ห้ามเสนอแยก labor/markup

ถัดไป: เลือก 1 ใน 3 แล้วเข้า /grilling ออกแบบ interface ก่อน implement — แนะนำ #4 C6 (รวม switch date-range ซ้ำ ~150 บรรทัด, ฝั่ง logic, มีบรรทัดฐานจาก C3)
ก่อน grill: อ่าน gh issue view <n> + design doc บรรทัดฐาน docs/c3-stock-design.md
```

> copy ข้อความนี้ไปแปะในแชทใหม่ได้เลย

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                                           | ที่อยู่                                                         |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog + EntityPicker term | `CONTEXT.md`                                                    |
| **C1 design doc** (decision log 6 ข้อ)                                    | `docs/c1-entitypicker-design.md`                                |
| **C3 design doc** (decision log 10 ข้อ)                                   | `docs/c3-stock-design.md`                                       |
| หนี้เทส pattern 11 ข้อ + root cause แต่ละ suite                           | `docs/test-debt-fix-plan.md`                                    |
| ระบบ chrome CDP+MCP (verify UI)                                           | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh`     |
| ADR: residual margin model                                                | `docs/adr/0001-repair-pricing-residual-margin.md`               |
| Architecture review (10 candidates)                                       | `docs/architecture-review-20260705.html` (EN) / `-th.html` (TH) |
| สถาปัตยกรรม + deployment                                                  | `docs/ARCHITECTURE.md`                                          |
| Matt skill flow                                                           | `README.md` → "Matt Pocock Skills Flow"                         |
