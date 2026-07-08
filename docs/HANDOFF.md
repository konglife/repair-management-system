# Handoff — stock skips + push + 5 issues เสร็จ → ถัดไปเลือก issue มาทำ

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-08):** ✅ **stock skips + push develop + เปิด 5 issues เสร็จ**
>
> - rewrite stock skips 6 ตัว → **commit `a2f3346` + push ขึ้น `origin/develop`** แล้ว · `npm test`: 51 suite / **632 pass / 0 skip / 0 fail** · lint + tsc สะอาด
> - **Vercel dev project deploy READY** (commit `a2f3346`, runtime logs ไม่มี error)
> - **เปิด GitHub Issues 5 ใบ** (ทั้งหมด label `enhancement,needs-triage`):
>   - `#3` C3 รวมตัดสต็อก · `#4` C6 รวม date-range · `#5` C7 DatePicker · `#6` C8 DataTable · `#7` code-smell EntityPicker
> - **`develop` = `origin/develop`** (sync แล้ว) · working tree สะอาด (เหลือ `docs/1.csv`/`docs/2.csv` scratch — ห้าม commit)
> - **ไม่แตะ `main`/prod ทั้งหมด**

---

## 🎯 เป้าหมายเซสชันถัดไป

เลือกมาทำทีละใบ (ทุมี rationale + ตำแหน่งไฟล์ใน body แล้ว เข้า `/grilling` ออกแบบ interface ก่อนทำ — ยกเว้น #7):

1. **#3 C3 (แนะนำทำก่อน)** — survey จัด "Strong" + คุ้มที่สุด (ลบ ~58 บรรทัด) · ลองจับคู่กับ #6/#7 ตอนที่ไฟล์นั้นเปิดอยู่แล้วก็ได้
2. **#7 code-smell** — งานเล็ก ไม่ต้อง grill ทำอุ่นๆ ได้
3. **#4 / #5 / #6** — เลือกตามความสนใจ (มีทั้ง logic + UI)

**C9 (money module ฝั่ง server) ยังไม่เปิด issue** — รอผู้ใช้ triage (ดู `docs/architecture-review-20260705-th.html` §C9)

---

## ✅ สถานะงานที่จบแล้ว

- **rewrite stock skips (6 tests)** — `stock/page.test.tsx` 6 `it.skip` เขียนใหม่ขับ ProductPicker/EntityPicker → 0 skip · committed `a2f3346` + pushed
- **push develop** — `develop` push ขึ้น `origin/develop` · Vercel dev deploy READY
- **GitHub Issues เปิด 5 ใบ** — `#3` C3 / `#4` C6 / `#5` C7 / `#6` C8 / `#7` code-smell (label `enhancement,needs-triage`)
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

- **สาขา:** `develop` (ไม่แตะ `main`/prod) · **= `origin/develop`** (sync แล้ว)
- **commit ล่าสดบน develop:** `a2f3346` test (stock skips) — นำ main อยู่หลาย commit (ยังไม่ release)
- **working tree สะอาด** (เหลือแค่ `?? docs/1.csv` / `?? docs/2.csv` — scratch prod **ห้าม commit**)
- **GitHub Issues เปิด:** `#3` `#4` `#5` `#6` `#7` (ทั้งหมด `enhancement,needs-triage`) · ดูรายการ: `gh issue list`

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

สถานะ: stock skips + push develop + เปิด 5 issues เสร็จแล้ว — develop sync origin แล้ว
- npm test: 51 suite / 632 pass / 0 skip / 0 fail · lint+tsc สะอาด
- develop = origin/develop (commit ล่าสด a2f3346) · Vercel dev deploy READY
- GitHub Issues เปิด: #3 C3 / #4 C6 / #5 C7 / #6 C8 / #7 code-smell (enhancement,needs-triage)
- ADR-0001: residual pricing model ถูกต้อง — ห้ามเสนอแยก labor/markup

ถัดไป: เลือก issue มาทำ — แนะ #3 (C3 คุ้มที่สุด) หรือ #7 (งานเล็ก) เข้า /grilling ออกแบบก่อน (ยกเว้น #7)
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
