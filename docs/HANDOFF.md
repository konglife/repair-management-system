# Handoff — stock skips เคลียร์แล้ว → ถัดไป commit + push/issue

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-08):** ✅ **rewrite stock skips เสร็จ (6/6 ดัน ProductPicker)**
>
> - เทส 6 ตัวใน `stock/page.test.tsx` เอา `it.skip` ออก เขียนใหม่ขับ EntityPicker (toggle dropdown → click item) + scope `within(form)` + `fireEvent.submit` · **0 skip แล้ว**
> - `npm test`: 51 suite / **632 pass / 0 skip / 0 fail** · `npm run lint` สะอาด · `npx tsc --noEmit` สะอาด
> - **ยังไม่ commit / ยังไม่ push** (working tree: `stock/page.test.tsx` modified + `docs/HANDOFF.md`) — รอผู้ใช้สั่ง
> - **ไม่แตะ `main`/prod ทั้งหมด**

---

## 🎯 เป้าหมายเซสชันถัดไป

เรียงตามลำดับ (รายละเอียดด้านล่าง):

1. **commit งาน stock-skip rewrite** → `test: เคลียร์หนี้เทส stock skips 6 ตัว (drive EntityPicker)` (รอผู้ใช้สั่ง)
2. **push develop ขึ้น remote** → Vercel deploy preview อัตโนมัติ (รอผู้ใช้สั่ง — action ออกสาธารณะ)
3. **(optional) เปิด GitHub Issue** track candidate ที่เหลือ (รอผู้ใช้สั่ง)
4. **(optional ทุกเมื่อ) `/to-prd`** แปลง candidate ที่เหลือ (C3/C6/C7/C8) เป็น PRD/Issue

---

## ✅ สถานะงานที่จบแล้ว

- **rewrite stock skips (6 tests)** — `stock/page.test.tsx` 6 `it.skip` เขียนใหม่ขับ ProductPicker/EntityPicker → 0 skip · ยังไม่ commit (รอคำสั่ง)
- **C5 (auth seam)** — `reports.getMonthlySummary` public→protected · committed `b262c18`
- **setup-pre-commit** (Husky + lint-staged + typecheck) — committed `69f8944` · gate lint+typecheck+test ทุก commit
- **C1 (EntityPicker)** — ship + verify browser + code-review ผ่าน · committed `7f498c9`
  - สร้าง `EntityPicker<T>` (deep module) + `ProductPicker`/`CustomerPicker` adapters (`src/components/ui/EntityPicker.tsx`, `pickers.tsx`)
  - ลบ `ProductAutocomplete` + `PartsAutocomplete` (และ test)
  - ย้าย sales/repairs/stock มาใช้ EntityPicker ครบ
  - TDD เขียว: `EntityPicker.test.tsx` (10) + `pickers.test.tsx` (6)
  - design: `docs/c1-entitypicker-design.md` (decision log 6 ข้อ)
- **หนี้เทส 10 suite เขียว** — committed `316e976` (แก้เทสให้ตรง component = source of truth)
- **docs** — committed `2459602` (C1 design + ADR-0001 + test-debt plan + chrome CDP + arch review)
- **architecture review** (`/improve-codebase-architecture`) — 10 candidates (HTML report)
- **chrome-devtools MCP + CDP** — ตั้งครบ + login ผ่านแล้ว (ดู `docs/agents/chrome-cdp-mcp.md`)

---

## 🧹 Code-review smell backlog (จาก skill `/code-review` 2026-07-07)

C1 ผ่านทั้ง Standards + Spec (0 hard violation). เก็บ smell minor 4 ข้อไว้ทำทีหลังได้ (judgement call, ไม่บล็อก):

1. **Duplicated Code** (`EntityPicker.tsx`) — ลำดับ reset state (`setSearchTerm("")`/`setHighlight(-1)`) ซ้ำใน 3 handler (select/clear/Escape) → แยก `reset()` ตัวเดียว
2. **Primitive Obsession** (`pickers.tsx` L25-50) — branch `variant === "part" ? "averageCost" : "salePrice"` ซ้ำ ~3 จุด → `Record<ProductVariant, {...}>`
3. **Type hole** (`pickers.tsx` L57) — `(p[priceField] ?? 0) as number` cast ปิด type hole จริง → ควรแก้ที่ type
4. **Mysterious Name** (`EntityPicker.tsx` L33) — `highlight` → `highlightedIndex`/`activeIndex`

> ข้อคุ้มแก้ที่สุด = #1 (extract `reset()`) และ #3 (เอา `as number` ออก)

---

## 📝 รายละเอียด "rewrite stock skips" — ✅ เสร็จแล้ว (2026-07-08)

เทส 6 ตัวใน `src/app/(main)/stock/page.test.tsx` เขียนใหม่หมด เอา `it.skip` ออก → stock suite 14/14 เขียว / 0 skip.

**Pattern ที่ใช้ (เก็บไว้อ้างอิงตอนเขียนเทส EntityPicker ในหน้าอื่น):**

- helper `openPurchaseForm()` = render → คลิกแท็บ "Record Purchase" → คลิก "Add Purchase" (ฟอร์ม toggle-reveal) → คืน `{ user, form }` (`form = container.querySelector("form")`, หน้า purchases มี form เดียว)
- เปิด dropdown: `within(form).getByRole("button", { name: "Toggle dropdown" })` (หลีก debounce ของ SearchInput — ไม่ต้องพิมพ์)
- เลือกสินค้า: `within(form).getByText("iPhone Screen (piece)")` (variant `purchase` = ชื่อ + `(unit)`)
- label ของ page ไม่ได้ผูก input (`getByLabelText("Product")` ใช้ไม่ได้) → ใช้ placeholder `"Search for a product to purchase..."` / `"Enter quantity"` + CurrencyInput ใช้ `getByLabelText("Currency amount input")` (aria-label ในตัว)
- submit หลายปุ่มชื่อ "Record Purchase" (แท็บ + submit) → scope `within(form)` + jsdom ใช้ `fireEvent.submit(form)`
- mutate ส่ง `purchaseDate` ด้วย → assert ด้วย `expect.objectContaining({ productId, quantity, costPerUnit })`

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

**ADR-0001: Repair pricing = residual margin model (อย่าแยก labor vs markup)**

- เจ้าของร้านคิดเงินแบบ residual: กรอก `totalCost` → `margin = totalCost − partsCost` = "เงินเข้ากระเป๋า"
- **ไม่ต้องการแยก labor กับ markup** · ฟิลด์ DB ชื่อ `laborCost` แต่ semantic จริง = margin
- ดู `docs/adr/0001-repair-pricing-residual-margin.md` + `CONTEXT.md` section "โมเดลราคางานซ่อม"

**ทำไม C1 ข้าม /to-prd → /to-issues:** มาจาก architecture review (มี rationale แล้ว) + grill ให้ design doc (ทำหน้าที่ PRD) + งานเล็ก/single-user → ไม่ต้อง issue tracker สำหรับ C1

---

## 📌 งานแยก (ทำวันไหนก็ได้ ไม่รีบ)

- **prod ค้าง deploy ~10 เดือน** — develop นำ main หลาย commit + C1 + C5. release = merge develop→main (ผู้ใช้ตัดสินใจ)
- **ไม่มี GitHub CI/CD** — มีแค่ Vercel auto-deploy (build only), ไม่มี lint/typecheck/test gate บน remote, ไม่มี branch protection บน `main`. `gh` พร้อม (v2.92.0, login `konglife`). pre-commit hook (local) มีแล้ว แต่ GitHub CI ยังไม่มี
- **candidate ที่เหลือ** — C3/C6/C7/C8 (ยังไม่ทำ) · C9 (Float) รอ triage เป็น issue
- **smell backlog 4 ข้อ** — ดูด้านบน

---

## 📍 สถานะไฟล์

- **สาขา:** `develop` (ไม่แตะ `main`/prod)
- **นำ `origin/develop` อยู่ 5 commits (ยังไม่ push):**
  - `2459602` docs (C1 design + ADR-0001 + test-debt plan + chrome CDP + arch review)
  - `316e976` test (หนี้เทส 10 suite เขียว)
  - `7f498c9` feat (C1 EntityPicker + ย้าย 3 หน้า)
  - `69f8944` chore (pre-commit hooks)
  - `b262c18` fix (C5 auth)
- **working tree (ยังไม่ commit):**
  - `M src/app/(main)/stock/page.test.tsx` (rewrite 6 skips)
  - `M docs/HANDOFF.md`
  - `?? docs/1.csv` / `?? docs/2.csv` — scratch prod **ห้าม commit**

---

## 🛠️ chrome-devtools MCP + CDP (verify UI ตอน rewrite stock skips / หลัง push)

ใช้ตอน verify UI. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- MCP config (`~/.claude.json`) ตั้ง `--browserUrl http://localhost:9222` → แนบเข้า Chrome ที่ผู้ใช้เปิดเอง
- **launcher:** `bash scripts/chrome-debug.sh [url]` — copy session จาก profile จริง → debug profile → เปิด debug port 9222
- ⚠️ ถ้า Chrome debug ปิดไปแล้ว → รัน launcher ใหม่ (cookie อยู่ใน profile → ไม่ต้อง login ใหม่ถ้ายังไม่หมดอายุ)
- ⚠️ ถ้า restart Claude Code → MCP โหลด `--browserUrl` ใหม่อัตโนมัติ

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: rewrite stock skips เสร็จแล้ว (6/6 ดัน EntityPicker) — ยังไม่ commit
- npm test: 51 suite / 632 pass / 0 skip / 0 fail · lint+tsc สะอาด
- working tree: stock/page.test.tsx (rewrite skips) + docs/HANDOFF.md
- ยังไม่ commit / ยังไม่ push (นำ origin/develop 5 commits) — รอคำสั่ง
- code-review: smell backlog 4 ข้อ minor (reset() + as number คุ้มแก้ที่สุด) อยู่ใน HANDOFF
- ADR-0001: residual pricing model ถูกต้อง — ห้ามเสนอแยก labor/markup

ถัดไป:
1. commit stock-skip rewrite (รอผู้ใช้สั่ง)
2. push develop (รอผู้ใช้สั่ง)
3. optional: เปิด GitHub Issue track candidate ที่เหลือ
```

> copy ข้อความนี้ไปแปะในแชทใหม่ได้เลย

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                                           | ที่อยู่                                                         |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog + EntityPicker term | `CONTEXT.md`                                                    |
| **C1 design doc** (decision log 6 ข้อ)                                    | `docs/c1-entitypicker-design.md`                                |
| หนี้เทส pattern 11 ข้อ + root cause แต่ละ suite                           | `docs/test-debt-fix-plan.md`                                    |
| ระบบ chrome CDP+MCP (verify UI)                                           | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh`     |
| ADR: residual margin model                                                | `docs/adr/0001-repair-pricing-residual-margin.md`               |
| Architecture review (10 candidates)                                       | `docs/architecture-review-20260705.html` (EN) / `-th.html` (TH) |
| สถาปัตยกรรม + deployment                                                  | `docs/ARCHITECTURE.md`                                          |
| Matt skill flow                                                           | `README.md` → "Matt Pocock Skills Flow"                         |
