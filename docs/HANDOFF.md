# Handoff — C1 (EntityPicker) ship แล้ว → ถัดไป rewrite stock skips + commit/push

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-07):** ✅ **C1 (EntityPicker) ship + verify browser แล้ว**
>
> - สร้าง `EntityPicker<T>` (deep module) + `ProductPicker`/`CustomerPicker` adapters (`src/components/ui/EntityPicker.tsx`, `pickers.tsx`)
> - ลบ `ProductAutocomplete` + `PartsAutocomplete` (และ test) — ย้าย sales/repairs/stock มาใช้ EntityPicker ครบ
> - TDD: `EntityPicker.test.tsx` (10) + `pickers.test.tsx` (6) เขียว · `npm test` 51 suite / **626 pass / 6 skip / 0 fail** · lint + tsc สะอาด
> - verify browser ผ่าน chrome CDP ครบ 3 หน้า (sale/part/purchase variant + customer + keyboard select/clear)
> - **สถานะไฟล์:** setup-pre-commit committed (`69f8944`) · **C1 + หนี้เทส 10 ไฟล์ + docs ยังไม่ commit** (อยู่บน develop ทั้งหมด ไม่แตะ main/prod)

---

## ❓ "หน้าเว็บแอปเปลี่ยนอะไรไปบ้าง? แล้วมีการเทสหรือยัง?"

> คำถามนี้สำคัญ — ตอบตรงๆ:

### 1) หน้าเว็บแอป (UI/component/page code): **ไม่มีการเปลี่ยนแปลงเลย**

- เซสชันนี้แก้แค่ **ไฟล์เทส (`.test.tsx` 10 ไฟล์)** + **docs** — component/app code ของทุกหน้า **เหมือนเดิมทุกบรรทัด**
- ตรวจสอบแล้วด้วย `git diff --name-only HEAD`: `src/` ที่ไม่ใช่ test = **0 ไฟล์เปลี่ยน**
- สิ่งที่ "เปลี่ยน" จริง = **เทสถูกเขียนใหม่ให้ตรงกับ component ที่มีอยู่** (component = source of truth, ไม่ใช่แก้ component ให้ตรงเทส)
- ตัวอย่างที่พบ: component โตขึ้นเมื่อไหร่ (เช่น dashboard เพิ่ม Stock Value + Gross Profit → 7 การ์ด, เปลี่ยน `$`→`฿`, stock form เปลี่ยนเป็น autocomplete+toggle) แต่ **เทสเก่าไม่ได้อัปเดตตาม** → เทสแดงมานาน → เซสชันนี้แก้เทสให้ตรงจริง
- **สรุป: ผู้ใช้/ร้าน ไม่ได้รับผลกระทบอะไรเลย** (แอปที่ร้านใช้ production บน `main` เหมือนเดิม; การแก้ทั้งหมดอยู่บน `develop` และยังไม่ได้ push/merge)

### 2) มีการเทสไหม: **ใช่ — แต่เป็น automated tests (unit/integration) เท่านั้น**

- ✅ **เทสผ่านครบ:** `npm test` = 51 suite / **629 test เขียว / 7 skip / 0 แดง**, บวก `lint` + `typecheck` สะอาด
- ⚠️ **ยังไม่ได้เทสในเบราว์เซอร์จริง (manual/visual/E2E)** — ไม่มีในเซสชันนี้ เพราะแอปไม่ได้เปลี่ยน จึงไม่มีอะไรต้อง verify ด้วยสายตา
- 🧪 **ความครอบคลุมเทส (page-level tests ที่เขียว):**
  - ✅ `dashboard` (15) · `stock` (8 ผ่าน, 6 skip — form tests ดีเฟอร์หลัง C1) · `reports` (8) · `reports/summary` (8) · `repairs` list · `repairs/[id]` (20) · `customers` (8) · `settings` · `sales` · `sales/[id]` · `layout` · `sidebar`
  - บวก component/router tests (ProductAutocomplete, PartsAutocomplete, reports/\* sub-components, tRPC routers ทุกตัว, lib/utils, auth)
- 🔜 **เทสในเบราว์เซอร์จะทำตอน verify C1** (EntityPicker) ผ่าน chrome-devtools MCP + CDP — ดู `docs/agents/chrome-cdp-mcp.md`
- 📌 **หากอยากเทสแอปในเบราว์เซอร์เดี๋ยวนี้:** ใช้ skill `/run` หรือ launcher `bash scripts/chrome-debug.sh http://localhost:3000` (dev server อาจปิดอยู่ — เปิด `npm run dev` ก่อน)

---

## 🎯 เป้าหมายเซสชันถัดไป (แนะนำ)

## 🎯 เป้าหมายเซสชันถัดไป (แนะนำ)

**C1 จบแล้ว** — งานที่เหลือเรียงตามลำดับ (รายละเอียดด้านล่างใน section ⏭️):

> ✅ `setup-pre-commit` shipped `69f8944` · ✅ C1 (EntityPicker) shipped + verified browser
> ถัดไป: (1) commit+push งานค้าง (C1 + หนี้เทส 10 ไฟล์ + docs) บน develop (2) rewrite stock skips 6 tests (ทำได้แล้ว) (3) optional `/to-prd`

_หมายเหตุ: เนื้อหาเดิมด้านล่าง (gate/setup/C1 steps) เป็นประวัติ — ทำเสร็จแล้วทั้งคู่_

### 1. `setup-pre-commit` (Husky + lint-staged) — gate lint+typecheck+test

- ตอนนี้ยังไม่มี `.husky/`, ไม่มีใน `package.json`
- ใช้ Matt skill `/setup-pre-commit` (มีใน `.claude/skills/` — เก็บเฉพาะเครื่อง)
- gate: `tsc --noEmit` + `eslint` + `jest --findRelatedTests` บนไฟล์ที่ staged

### 2. implement C1 (EntityPicker) — TDD

- design doc พร้อม: `docs/c1-entitypicker-design.md` (decision log 6 ข้อ)
- TDD ตาม acceptance 6A (unit test EntityPicker) → verify browser 3 หน้า ผ่าน chrome CDP (6A+6B)
- หลัง C1 เสร็อ จะได้ **rewrite stock skips** ด้วย (ด้านล่าง)

### ⚠️ ค้าง: stock skips + GitHub Issue

- `stock/page.test.tsx` skip ไว้ 6 tests (drive `ProductAutocomplete`/form validation/submit) — defer หลัง C1 เพราะ C1 จะแทน ProductAutocomplete
- **ยังไม่ได้เปิด GitHub Issue** (ผู้ใช้ยังไม่สั่ง create — เป็น action ออกสาธารณะ) → รอผู้ใช้สั่ง แล้วใช้ `gh issue create` (label `needs-triage,enhancement`, title "test: rewrite stock/page.test.tsx purchase-form tests after C1 (EntityPicker)")
- template ข้อความ issue อยู่ใน git history ของเซสชันนี้ หรือดู root cause ใน `docs/test-debt-fix-plan.md`

---

## ⏭️ หลังแก้หนี้เทสแล้ว → ลำดับถัดไป

1. **`setup-pre-commit`** (Husky + lint-staged) — ตั้ง gate lint+typecheck+test (ตอนนี้ยังไม่มี `.husky/`, ไม่มีใน `package.json`)
2. **implement C1 (EntityPicker)** — TDD ตาม `docs/c1-entitypicker-design.md` → verify browser 3 หน้า ผ่าน chrome CDP (6A+6B)
3. (optional ทุกเมื่อ) **`/to-prd`** แปลง candidate อื่น (C3/C6/C7/C8...) เป็น GitHub Issue

---

## ✅ สถานะงานที่จบแล้ว

- **architecture review** (`/improve-codebase-architecture`) — Explore + HTML report + 10 candidates ✅
- **C5 (auth seam)** — `reports.getMonthlySummary` publicProcedure → protectedProcedure ✅ · **committed `b262c18` บน `develop` แล้ว** (push ยัง — รอผู้ใช้สั่ง)
- **chrome-devtools MCP + CDP** — ตั้งคงครบ + login ผ่านแล้ว ✅ (ดู `docs/agents/chrome-cdp-mcp.md`)
- **grill C1 จบ** ✅ — design doc พร้อม `docs/c1-entitypicker-design.md`, term "EntityPicker" ลง `CONTEXT.md` แล้ว

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

**ADR-0001: Repair pricing = residual margin model (อย่าแยก labor vs markup)**

- เจ้าของร้านคิดเงินแบบ residual: กรอก `totalCost` → `margin = totalCost − partsCost` = "เงินเข้ากระเป๋า"
- **ไม่ต้องการแยก labor กับ markup** · ฟิลด์ DB ชื่อ `laborCost` แต่ semantic จริง = margin
- ดู `docs/adr/0001-repair-pricing-residual-margin.md` + `CONTEXT.md` section "โมเดลราคางานซ่อม"

---

## 📐 สรุปการออกแบบ C1 (EntityPicker) — ตัดตอนจาก `docs/c1-entitypicker-design.md`

| คำถาม grill                  | ตัดสินใจ                                                                    |
| ---------------------------- | --------------------------------------------------------------------------- |
| รูปร่าง deep module          | **generic `EntityPicker<T>`** + thin adapter (ไม่ใช่ primitive กลาง)        |
| Part เป็น adapter ของตัวเอง? | **ไม่** — Part = Product variant (table `Product` ตัวเดียวกัน ตาม schema)   |
| เก็บข้อมูลเอง/รับ list?      | **รับ `items[]` prop** (caller fetch, picker ไม่ยุ่ง tRPC/DB)               |
| Customer: ค้นหา/สร้างใหม่?   | **แค่ค้นหา** (inline-create ทีหลัง)                                         |
| ย้ายกี่หน้า?                 | **3 หน้า (sales+repairs+stock) + ลบ ProductAutocomplete/PartsAutocomplete** |
| คีย์บอร์ด?                   | **↑↓/Enter/Esc** (repair-first shop บันทึก batch → ลด friction)             |
| ตรวจว่าเสร็จ?                | **unit test + verify browser จริง** ผ่าน chrome CDP                         |

---

## 🛠️ chrome-devtools MCP + CDP (ตั้งค่าครบ ✅)

ใช้ตอน verify UI หลัง implement C1. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- config MCP (`~/.claude.json`) ตั้ง `--browserUrl http://localhost:9222` แล้ว → MCP แนบเข้า Chrome ที่ผู้ใช้เปิดเอง
- **launcher**: `bash scripts/chrome-debug.sh [url]` — copy session จาก profile จริง → debug profile → เปิด debug port 9222
- ⚠️ **ถ้า restart Claude Code แล้ว** MCP โหลด `--browserUrl` ใหม่อัตโนมัติ
- ⚠️ **ถ้า Chrome debug ปิดไปแล้ว** → รัน launcher ใหม่ (cookie อยู่ใน profile → ไม่ต้อง login ใหม่ถ้ายังไม่หมดอายุ)
- **grill/แก้เทส ไม่ใช้ browser** — ใช้เฉพาะ verify หลัง implement

> หมายเหตุเซสชันก่อน: chrome debug + dev server ถูกปิดไปแล้ว (grill ไม่ใช้) — เปิดใหม่ตอน verify เท่านั้น

---

## 📌 งานแยก (ทำวันไหนก็ได้ ไม่รีบ)

- **prod ค้าง deploy ~10 เดือน** — develop นำ main หลาย commit + C5. release = merge develop→main (ผู้ใช้ตัดสินใจ)
- **ไม่มี GitHub CI/CD** — มีแค่ Vercel auto-deploy (build only), ไม่มี lint/typecheck/test gate, ไม่มี branch protection บน `main`. `gh` พร้อม (v2.92.0, login `konglife`, scope `workflow`). **ทำหลัง setup-pre-commit**
- บั๊กเดิม 4 ข้อ — auth รั่ว (C5 แก้แล้ว) · labor model + negative labor (ADR-0001 คลอบ: ไม่ใช่ bug ของ model) · เหลือ Float (C9) รอ triage เป็น issue

---

## 📍 สถานะไฟล์

- **สาขา:** `develop` (ไม่แตะ `main`/prod)
- **committed แล้ว (push ยัง):** `b262c18` C5 auth fix
- **เปลี่ยนยังไม่ commit:**
  - **ไฟล์เทสที่แก้ให้เขียว (เซสชัน 2026-07-05 + 2026-07-06):** `layout.test.tsx`, `sidebar.test.tsx`, `settings/page.test.tsx`, `customers/page.test.tsx`, **`dashboard/page.test.tsx`** (15/15), **`stock/page.test.tsx`** (8 pass/6 skip), **`reports/page.test.tsx`** (8/8), **`reports/summary/page.test.tsx`** (8/8), **`repairs/[id]/page.test.tsx`** (20/20), **`SalesTable.test.tsx`** (typecheck)
  - `docs/test-debt-fix-plan.md` (M) — pattern 11 ข้อ + root cause แต่ละ suite + ผลลัพธ์
  - `docs/HANDOFF.md` (M) — ไฟล์นี้
  - ของเดิมจากเซสชันก่อนๆ (ยังไม่ commit เหมือนเดิม): `CONTEXT.md` (M, +EntityPicker term), `docs/c1-entitypicker-design.md` (new), `docs/adr/0001-...md`, `docs/agents/chrome-cdp-mcp.md`, `docs/architecture-review-20260705.html`+`-th.html`, `scripts/chrome-debug.sh`
  - `docs/1.csv`/`docs/2.csv` (untracked) — scratch prod **ห้าม commit**

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md และ docs/test-debt-fix-plan.md ก่อน

แชทก่อนหน้าจบแล้ว: ✅ หนี้เทสเคลียร์ครบ
- npm test: 51 suite / 629 pass / 7 skip / 0 fail · lint สะอาด · tsc สะอาด
- แก้ไฟล์เทส 10 ไฟล์ (dashboard/stock/reports/reports-summary/repairs[id]/layout/sidebar/settings/customers/SalesTable)
- สำคัญ: แอป/หน้าเว็บ "ไม่ได้เปลี่ยนเลย" — แก้แค่เทสให้ตรง component (component = source of truth)
- stock skip 6 tests (form/autocomplete) defer หลัง C1 — ยังไม่ได้เปิด GitHub Issue (รอผู้ใช้สั่ง)

ถัดไป (ตามลำดับ):
1. /setup-pre-commit (Husky + lint-staged) — gate lint+typecheck+test ตอนนี้ที่เทสเขียวทำได้เลย
2. TDD C1 (EntityPicker) → docs/c1-entitypicker-design.md → verify browser ผ่าน chrome CDP

บริบทอื่น:
- ไฟล์เทส 10 ไฟล์ + docs ยังไม่ commit (อยู่บน develop, ไม่แตะ main/prod)
- C5 (auth) committed บน develop แล้ว ยังไม่ push
- ADR-0001: residual pricing model ถูกต้อง — ห้ามเสนอแยก labor/markup
- pattern 11 ข้อ + root cause แต่ละ suite อยู่ใน test-debt-fix-plan.md
```

> copy ข้อความนี้ไปแปะในแชทใหม่ได้เลย

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                                               | ที่อยู่                                                         |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog + **EntityPicker term** | `CONTEXT.md`                                                    |
| **C1 design doc** (decision log 6 ข้อ)                                        | `docs/c1-entitypicker-design.md`                                |
| ระบบ chrome CDP+MCP (verify UI)                                               | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh`     |
| ADR: residual margin model                                                    | `docs/adr/0001-repair-pricing-residual-margin.md`               |
| Architecture review (10 candidates)                                           | `docs/architecture-review-20260705.html` (EN) / `-th.html` (TH) |
| สถาปัตยกรรม + deployment                                                      | `docs/ARCHITECTURE.md`                                          |
| Matt skill flow                                                               | `README.md` → "Matt Pocock Skills Flow"                         |
