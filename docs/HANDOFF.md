# Handoff — C3 (stock module) เสร็จ → ถัดไปเลือก issue มาทำ

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-08):** ✅ **C3 (stock module) เสร็จ — merge develop + ปิด issue #3**
>
> - สร้าง `src/server/stock.ts` — `validateAndDeductStock(tx, items) → Map<id,Product>` รวม validate+deduct ที่ซ้ำกันใน `sale.create`/`repair.create`
> - `stock.test.ts` 7 cases (test แรกที่ test stock logic จริง + mock tx) · router ทั้งสอง **net −93 บรรทัด**
> - **`npm test`: 52 suite / 639 pass / 0 skip / 0 fail** · lint + tsc สะอาด
> - ผ่าน `/code-review` (Matt's): Standards 0 hard · Spec แก้หมด (dead branch + doc overclaim + order-change acknowledge)
> - **merge develop → push origin** (`f3ba78b`) · Vercel dev deploy กำลัง build · **ปิด issue #3**
> - **`develop` = `origin/develop`** · working tree สะอาด (เหลือ `docs/1.csv`/`docs/2.csv` scratch — ห้าม commit)
> - **ไม่แตะ `main`/prod ทั้งหมด**

> ⚠️ **C3 ยังไม่ได้ browser-verify** — merge + push develop แล้ว แต่ยังไม่ได้ทดสอบจริงบน dev. เจ้าของร้านกำลังจะตรวจเอง. **เซสชันถัดไปควรเช็คก่อนว่าผู้ใช้ verify แล้วหรือยัง** ถ้ายัง → เช็ค Vercel deploy READY แล้วช่วยทดสอบ 4 ขั้น (สร้าง sale / สร้าง repair / ขายเกินสต็อก → error / ดู history+stock) ก่อนทำ issue ถัดไป

---

## 🎯 เป้าหมายเซสชันถัดไป

Issue ที่เปิดอยู่ (ทุมี rationale + ตำแหน่งไฟล์ใน body เข้า `/grilling` ออกแบบ interface ก่อน — ยกเว้น #7):

1. **#7 code-smell** — งานเล็ก ไม่ต้อง grill ทำอุ่นๆ ได้ (extract `reset()` + เอา `as number` ออก + ชื่อ + lookup)
2. **#4 C6** — รวม switch date-range ซ้ำ ~150 บรรทัด ใน 6 ที่ (logic deepening คุ้ม)
3. **#5 C7** — สร้าง DatePicker module เดียว (Reports ใช้ date input ต่างจากหน้าอื่น) · UI
4. **#6 C8** — สร้าง DataTable module (6 หน้า list เขียน search เอง + ยังไม่มี pagination) · UI

**C9 (money module ฝั่ง server) ยังไม่เปิด issue** — รอผู้ใช้ triage (ดู `docs/architecture-review-20260705-th.html` §C9)

---

## ✅ สถานะงานที่จบแล้ว

- **C3 (stock module)** — ship + code-review ผ่าน · committed `1b9a16f` + `e211129` · merge develop `f3ba78b` · **ปิด #3**
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

## 🧹 Code-review smell backlog (จาก skill `/code-review` 2026-07-07)

C1 ผ่านทั้ง Standards + Spec (0 hard violation). เก็บ smell minor 4 ข้อไว้ทำทีหลังได้ (judgement call, ไม่บล็อก) — **รวมเป็น issue #7 แล้ว**:

1. **Duplicated Code** (`EntityPicker.tsx`) — ลำดับ reset state (`setSearchTerm("")`/`setHighlight(-1)`) ซ้ำใน 3 handler (select/clear/Escape) → แยก `reset()` ตัวเดียว
2. **Primitive Obsession** (`pickers.tsx` L25-50) — branch `variant === "part" ? "averageCost" : "salePrice"` ซ้ำ ~3 จุด → `Record<ProductVariant, {...}>`
3. **Type hole** (`pickers.tsx` L57) — `(p[priceField] ?? 0) as number` cast ปิด type hole จริง → ควรแก้ที่ type
4. **Mysterious Name** (`EntityPicker.tsx` L33) — `highlight` → `highlightedIndex`/`activeIndex`

> ข้อคุ้มแก้ที่สุด = #1 (extract `reset()`) และ #3 (เอา `as number` ออก)

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
- **candidate ที่เหลือ** — C6/C7/C8 (ยังไม่ทำ) · C9 (Float) รอ triage เป็น issue · C3 ปิดแล้ว
- **smell backlog 4 ข้อ** — issue #7 (ดูด้านบน)

---

## 📍 สถานะไฟล์

- **สาขา:** `develop` (ไม่แตะ `main`/prod) · **= `origin/develop`** (sync แล้ว · commit ล่าสด `f3ba78b`)
- **working tree สะอาด** (เหลือแค่ `?? docs/1.csv` / `?? docs/2.csv` — scratch prod **ห้าม commit**)
- **GitHub Issues เปิด:** `#4` `#5` `#6` `#7` (`enhancement,needs-triage`) · ปิดแล้ว: `#3` · ดูรายการ: `gh issue list`

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

สถานะ: C3 (stock module) เสร็จ — merge develop + ปิด issue #3 แล้ว
- npm test: 52 suite / 639 pass / 0 skip / 0 fail · lint+tsc สะอาด
- develop = origin/develop (commit ล่าสด f3ba78b) · Vercel dev deploy กำลัง build
- GitHub Issues เปิด: #4 C6 / #5 C7 / #6 C8 / #7 code-smell (ปิด #3 แล้ว)
- ADR-0001: residual pricing model ถูกต้อง — ห้ามเสนอแยก labor/markup

ถัดไป: เลือก issue มาทำ — แนะ #7 (งานเล็ก) หรือ #4 C6 (ลบซ้ำ ~150 บรรทัด) เข้า /grilling ออกแบบก่อน (ยกเว้น #7)
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
