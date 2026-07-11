# Handoff — C6 เสร็จครบ + รวม develop + ลดสาขา → เหลือ C7/C8 หรือ release

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-11):** 🟢 **C6 ทำครบทุกขั้น — commit + merge develop + browser-verify + ปิด #4 + ลดสาขา**
>
> - **`develop` = `6dee60e`** (= origin/develop, push แล้ว) — C6 รวมเข้า develop แล้ว (merge ff จาก feature/c6) · **browser-verify ผ่าน 2 ที่**: localhost:3000 + dev.vercel.app (ตัวเลขเท่ากัน)
> - **C6 เสร็จจริง**: `parseDateRange` deep module + `DATE_RANGE_VALUES` (single source) ฆ่า enum/semantic/literal drift · routers −154 บรรทัด · `npm test` 53 suite/647 pass · tsc + lint สะอาด
> - **issue #4 ปิดแล้ว** (konglife/repair-management-system#4)
> - **สาขาเหลือ 2 อัน**: `main` + `develop` (ลบ feature/c3, feature/c6 ทั้ง local+remote แล้ว) · มี `origin/vercel/...cve` ของ Vercel แก้ CVE (ไม่ใช่ของเรา ปล่อยไว้)
> - **`main` ไม่ถูกแตะ** · prod ที่ร้านยังเดิม (ค้าง deploy ~10 เดือน)

---

## 🎯 เป้าหมายเซสชันถัดไป

C6 ปิดจบสมบูรณ์. ทางเลือกถัดไป (ผู้ใช้ตัดสินใจ):

### ตัวเลือก A — release (merge develop→main = production deploy)

- **merge ปลอดภัย/สะอาด**: develop = superset ของ main (main ไม่มีอะไรที่ develop ไม่มี) → **ไม่มี code conflict แน่นอน**
- **DB ปลอดภัย**: ทุก issue ปัจจุบัน (C1/C3/C5/#7/C6) เป็นโค้ดล้วน ไม่มี migration ใหม่ (migration ล่าสุด ส.ค. 2025 อยู่บน prod แล้ว) → deploy ไม่แตะข้อมูล/โครงสร้าง DB
- ⚠️ **เตือนชัด: C6 เปลี่ยนพฤติกรรม production dashboard (ตอน release จริง)**:
  - **"1 เดือน"**: จาก _ตั้งแต่วันที่ 1 ของเดือน_ → _ย้อน 1 เดือน_ (rolling) → **ตัวเลขแดชบอร์ดจะเปลี่ยน** (เช่น 15 ก.ค. เริ่มนับ 15 มิ.ย. แทน 1 ก.ค.) — เป็น intent ของ issue #4 ไม่ใช่บั๊ก
  - **"7 วัน"**: ขอบเขตขยับจาก `now−7` → `startOfDay−7` (เล็กน้อย)
- **วิธี release**: `git checkout main && git merge --ff-only develop && git push origin main` (Vercel deploy prod อัตโนมัติ) · บอกผู้ใช้ก่อนทุกครั้งตามกฎเหล็ก

### ตัวเลือก B — ทำ candidate ถัดไป (ตาม `docs/agents/issue-tracker.md` flow)

- **C7 (#5 DatePicker)** = UI ล้วน ❌ ไม่แตะ DB
- **C8 (#6 DataTable)** = UI ล้วน ❌ ไม่แตะ DB
- **C9 (Float/money)** ⚠️ รอ triage เป็น issue — **อันนี้น่าจะแตะ DB จริง** (เปลี่ยนวิธีเก็บเงิน → migration + backfill) → พอถึงคิวต้องวางแผนระวัง บอกผู้ใช้ก่อน
- โฟลว์: แตกสาขาจาก develop → `/grilling` (design doc) → implement (TDD) → `/code-review` → browser-verify → merge develop → ปิด issue

---

## 📝 รายละเอียด C6 (สรุปสำหรับแชทใหม่)

อ่าน `docs/c6-daterange-design.md` (decision log 8 ข้อจาก `/grilling`) สำหรับเหตุผลเต็ม

**สิ่งที่สร้าง/แก้:**

- `src/server/dates.ts` (ใหม่) — `parseDateRange(range, now=new Date()) → {gte:Date}|undefined` + `DATE_RANGE_VALUES as const` + `export type DateRange` (derive)
- `src/server/dates.test.ts` (ใหม่) — 8 cases (today/7days/1month/undefined/inject now/startOfDay/cross-year/type coverage)
- `sale.ts` / `repair.ts` — getAll + getAnalytics: switch 15+ บรรทัด → `parseDateRange(input?.dateRange)`
- `dashboard.ts` — getSummary + getTopProducts: migrate enum `period`→`dateRange`, `today/last7days/thismonth`→`today/7days/1month`, ลบ switch
- 6 zod schema ใช้ `z.enum(DATE_RANGE_VALUES)` (ฆ่า literal drift)
- `dashboard/page.tsx` + `TopProductsChart.tsx` — TimePeriod→DateRange, prop `period`→`dateRange`, label "This Month"→"Last 1 Month"
- tests ที่แตะ: `dashboard/page.test.tsx`, `TopProductsChart.test.tsx` (migrate enum/label ตาม canonical)
- **ไม่แตะ**: `getTrendData` + `TrendGraph.tsx` (`last30days`) — ออกจากขอบเขต (คนละ concept)

**ลดซ้ำ:** routers รวม −154 บรรทัด (ตรงเป้า issue ~150)

**deletion test ผ่าน**: เอา module ออก → 6 sites ต้องเขียน switch ใหม่ = concentrate ไม่ move → deep จริง

---

## ✅ สถานะงานที่จบแล้ว

- **C6 (#4 date-range module)** — commit `b44dbbd` + merge develop `4cce701`/`6dee60e` · browser-verify localhost+dev · **ปิด #4**
- **#7 (code-smell EntityPicker/pickers)** — refactor + code-review + browser-verify ผ่าน · commit `dfb2d6c` · **ปิด #7**
- **C3 (stock module)** — ship + code-review + browser-verify ผ่าน · **ปิด #3**
  - `validateAndDeductStock(tx, items)` ใน `src/server/stock.ts` · ⚠️ router test เดิมเป็น fake (test-debt) → `stock.test.ts` คือ safety net จริง
- **C1 (EntityPicker)** — ship + verify + code-review ผ่าน · commit `7f498c9`
- **C5 (auth seam)** — `reports.getMonthlySummary` public→protected · commit `b262c18`
- **setup-pre-commit** (Husky + lint-staged + typecheck) · commit `69f8944`

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

**ADR-0001: Repair pricing = residual margin model (อย่าแยก labor vs markup)**

- เจ้าของร้านคิดเงิน residual: `margin = totalCost − partsCost` · ฟิลด์ DB ชื่อ `laborCost` แต่ semantic = margin
- ดู `docs/adr/0001-repair-pricing-residual-margin.md` + `CONTEXT.md`

**ทำไม C-series ข้าม /to-prd → /to-issues:** มาจาก architecture review (มี rationale แล้ว) + grill ให้ design doc (ทำหน้าที่ PRD) + งานเล็ก/single-user

**ความปลอดภัยของ DB ตอน release (วิเคราะห์แล้ว 2026-07-11):**

- ทุก issue ปัจจุบัน (C1/C3/C5/#7/C6) = โค้ดล้วน ไม่มี migration → merge develop→main **ไม่แตะข้อมูล/โครงสร้าง DB prod**
- build script รัน `prisma migrate deploy` แต่ไม่มี migration ค้าง = no-op
- ⚠️ **C9 (Float/money)** = จุดเดียวในอนาคตที่จะแตะ DB จริง (migration + backfill) → ต้องระวังเป็นพิเศษ บอกผู้ใช้ก่อนทำ

---

## 📌 งานแยก (ทำวันไหนก็ได้ ไม่รีบ)

- **prod ค้าง deploy ~10 เดือน** — develop นำ main ~40 commit (C1/C5/C3/#7/C6 + docs). release = merge develop→main (ผู้ใช้ตัดสินใจ) · merge สะอาด (develop = superset)
- **ไม่มี GitHub CI/CD** — มีแค่ Vercel auto-deploy (build only), ไม่มี lint/typecheck/test gate บน remote, ไม่มี branch protection บน `main`. `gh` พร้อม (v2.92.0, login `konglife`). pre-commit hook (local) มีแล้ว
- **candidate ที่เหลือ** — C7 (#5 DatePicker) / C8 (#6 DataTable) · C9 (Float/money) รอ triage เป็น issue

---

## 📍 สถานะไฟล์

- **สาขา `develop` = `6dee60e`** (= origin/develop, push แล้ว) · **`main` = `d95d433`** (prod, ไม่ถูกแตะ) · develop = superset ของ main
- **สาขา feature ทั้งหมดลบแล้ว** (c3, c6 — local + remote) เพราะรวมเข้า develop หมด · เหลือแค่ develop + main (+ `origin/vercel/...cve` ของ bot)
- **scratch ห้าม commit:** `docs/1.csv`, `docs/2.csv`
- **GitHub Issues เปิด:** `#5` C7 · `#6` C8 · ปิดแล้ว: `#3` `#4` `#7`

---

## 🛠️ chrome-devtools MCP + CDP (verify UI)

ใช้ตอน browser-verify. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- launcher: `bash scripts/chrome-debug.sh [url]` (copy session จาก profile จริง → debug profile → port 9222)
- ⚠️ ถ้า Chrome debug ปิด → รัน launcher ใหม่ · ถ้า restart Claude Code → MCP โหลด `--browserUrl` ใหม่อัตโนมัติ
- กฎสำคัญ: เปิด Chrome debug ครั้งเดียว ใช้ยาวทั้ง session (เปิดซ้ำจะสะสมแท็บ)

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: C6 ทำครบ — commit + merge develop (6dee60e) + browser-verify + ปิด #4 + ลดสาขา
- develop = origin/develop (6dee60e) · main ไม่ถูกแตะ (prod ค้าง ~10 เดือน)
- สาขาเหลือแค่ develop + main (ลบ feature/c3, feature/c6 แล้ว)
- npm test: 53 suite / 647 pass · tsc + lint สะอาด

ถัดไปเลือก 1 ทาง (ผู้ใช้ตัดสินใจ):
  A. release = merge develop→main (สะอาด ไม่มี conflict, DB ไม่กระทบ, แต่ตัวเลข "1 เดือน" เปลี่ยน)
  B. ทำ C7 (#5 DatePicker) หรือ C8 (#6 DataTable) — UI ล้วน ไม่แตะ DB
     หรือ C9 (Float/money) ⚠️ อันนี้จะแตะ DB (migration + backfill)
```

> copy ข้อความนี้ไปแปะในแชทใหม่ได้เลย

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                            | ที่อยู่                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog      | `CONTEXT.md`                                                    |
| **C6 design doc** (decision log 8 ข้อ) **← อ่านก่อนทำต่อ** | `docs/c6-daterange-design.md`                                   |
| **C3 design doc** (deep-module precedent)                  | `docs/c3-stock-design.md`                                       |
| **C1 design doc** (decision log 6 ข้อ)                     | `docs/c1-entitypicker-design.md`                                |
| หนี้เทส pattern 11 ข้อ + root cause                        | `docs/test-debt-fix-plan.md`                                    |
| ระบบ chrome CDP+MCP (verify UI)                            | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh`     |
| ADR: residual margin model                                 | `docs/adr/0001-repair-pricing-residual-margin.md`               |
| Architecture review (10 candidates)                        | `docs/architecture-review-20260705.html` (EN) / `-th.html` (TH) |
| สถาปัตยกรรม + deployment                                   | `docs/ARCHITECTURE.md`                                          |
| Matt skill flow                                            | `README.md` → "Matt Pocock Skills Flow"                         |
