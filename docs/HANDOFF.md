# Handoff — C6 (date-range module) เสร็จ/verify/ปิด #4 → เหลือ candidate C7/C8 + release ค้าง

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-11):** 🟢 **C6 (date-range module) ทำครบ — commit + browser-verify + ปิด #4**
>
> - **สาขา `feature/c6-daterange-module`** แตกจาก `develop` @ `9a18e52` · **commit ใหม่ `b44dbbd`** (feat) + docs commit
> - **literal drift ฆ่าตายด้วย `DATE_RANGE_VALUES`** (single source: const + type derive + 6 zod schema ใช้ `z.enum(DATE_RANGE_VALUES)`)
> - **browser-verify ผ่าน** (localhost:3000): สลับ Today/7 Days/1 Month → ตัวเลข summary เปลี่ยนตาม · label canonical ใหม่ขึ้น · รายการเก่ากว่า 1 เดือนถูกตัดออก ✓ · ดูภาพ `docs/c6-verify-last7days.png`
> - **`npm test`: 53 suite / 647 pass / 0 skip / 0 fail** · tsc + lint สะอาด
> - **issue #4 ปิดแล้ว** (konglife/repair-management-system#4)
> - **รวมเข้า develop แล้ว + push** · `develop = 4cce701` (= origin/develop) · **browser-verify ผ่านบน dev.vercel.app** (ตัวเลขเท่า localhost) · **ยังไม่แตะ `main`/prod**

---

## 🎯 เป้าหมายเซสชันถัดไป

C6 ปิดจบสมบูรณ์. ทางเลือกถัดไป (ผู้ใช้ตัดสินใจ):

### ตัวเลือก A — release (merge develop→main = production deploy)

- C6 รวมเข้า `develop` แล้ว (`4cce701`) · verify ผ่านบน `dev.vercel.app`
- **ขั้นต่อไป (release)**: merge `develop`→`main` = production deploy (ผู้ใช้ตัดสินใจ)
- ⚠️ **เตือนชัด: C6 เปลี่ยนพฤติกรรม production dashboard (ตอน release)**:
  - **"1 เดือน"**: จาก _ตั้งแต่วันที่ 1 ของเดือน_ → _ย้อนไป 1 เดือน_ (rolling) → **ตัวเลขแดชบอร์ดจะเปลี่ยน** (เช่น 15 ก.ค. เริ่มนับ 15 มิ.ย. แทน 1 ก.ค.)
  - **"7 วัน"**: ขอบเขตขยับจาก `now−7` → `startOfDay−7` (เล็กน้อย)

### ตัวเลือก B — ทำ candidate ถัดไป (ตาม `docs/agents/issue-tracker.md` flow)

- **C7 (#5 DatePicker)** · **C8 (#6 DataTable)** · C9 (Float/money) รอ triage เป็น issue
- โฟลว์: เลือก issue → `/grilling` (design doc) → implement (TDD) → `/code-review` → browser-verify → ปิด issue

---

## 📝 รายละเอียด C6 (สรุปสำหรับแชทใหม่)

อ่าน `docs/c6-daterange-design.md` (decision log 8 ข้อจาก `/grilling`) สำหรับเหตุผลเต็ม

**สิ่งที่สร้าง/แก้:**

- `src/server/dates.ts` (ใหม่) — `parseDateRange(range, now=new Date()) → {gte:Date}|undefined` + `export type DateRange`
- `src/server/dates.test.ts` (ใหม่) — 8 cases (today/7days/1month/undefined/inject now/startOfDay/cross-year/type coverage)
- `sale.ts` / `repair.ts` — getAll + getAnalytics: switch 15+ บรรทัด → `parseDateRange(input?.dateRange)`
- `dashboard.ts` — getSummary + getTopProducts: migrate enum `period`→`dateRange`, `today/last7days/thismonth`→`today/7days/1month`, ลบ switch
- `dashboard/page.tsx` + `TopProductsChart.tsx` — TimePeriod→DateRange, prop `period`→`dateRange`, label "This Month"→"Last 1 Month"
- tests ที่แตะ: `dashboard/page.test.tsx`, `TopProductsChart.test.tsx` (migrate enum/label ตาม canonical)
- **ไม่แตะ**: `getTrendData` + `TrendGraph.tsx` (`last30days`) — ออกจากขอบเขต (คนละ concept)

**ลดซ้ำ:** routers รวม −154 บรรทัด (ตรงเป้า issue ~150)

**deletion test ผ่าน**: เอา module ออก → 6 sites ต้องเขียน switch ใหม่ = concentrate ไม่ move → deep จริง

---

## ✅ สถานะงานที่จบแล้ว

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

---

## 📌 งานแยก (ทำวันไหนก็ได้ ไม่รีบ)

- **prod ค้าง deploy ~10 เดือน** — develop นำ main หลาย commit + C1/C5/C3/#7 + (เมื่อ commit) C6. release = merge develop→main (ผู้ใช้ตัดสินใจ)
- **ไม่มี GitHub CI/CD** — มีแค่ Vercel auto-deploy (build only), ไม่มี lint/typecheck/test gate บน remote, ไม่มี branch protection บน `main`. `gh` พร้อม (v2.92.0, login `konglife`). pre-commit hook (local) มีแล้ว
- **candidate ที่เหลือ** — C7 (#5 DatePicker) / C8 (#6 DataTable) · C9 (Float/money) รอ triage เป็น issue · C6/#4 ใกล้ปิด

---

## 📍 สถานะไฟล์

- **สาขา `develop` = `4cce701`** (= origin/develop, push แล้ว) — **C6 รวมเข้า develop แล้ว** (merge ff จาก `feature/c6-daterange-module`) · สาขา feature ยังอยู่ (local + origin) · **`main` ไม่ถูกแตะ**
- **C6 ทั้งหมด commit แล้ว** (`b44dbbd`): `dates.ts`, `dates.test.ts`, `dashboard.ts`, `repair.ts`, `sale.ts`, `dashboard/page.tsx`, `dashboard/page.test.tsx`, `TopProductsChart.tsx`, `TopProductsChart.test.tsx`, `docs/c6-daterange-design.md`
- **scratch ห้าม commit:** `docs/1.csv`, `docs/2.csv`
- **GitHub Issues เปิด:** `#5` C7 · `#6` C8 · ปิดแล้ว: `#3` `#4` `#7`

---

## 🛠️ chrome-devtools MCP + CDP (verify UI)

ใช้ตอน browser-verify C6. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- launcher: `bash scripts/chrome-debug.sh [url]` (copy session จาก profile จริง → debug profile → port 9222)
- ⚠️ ถ้า Chrome debug ปิด → รัน launcher ใหม่ · ถ้า restart Claude Code → MCP โหลด `--browserUrl` ใหม่อัตโนมัติ
- **จุดตรวจ C6**: เปิดแดชบอร์ด → เลือก "Last 1 Month"/"Last 7 Days"/"Today" → ตัวเลข summary + top products เปลี่ยนตาม · เทียบกับหน้า sales/repairs ช่วงเดียวกัน = ต้องตรงกัน (เพราะ unified semantic แล้ว)

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: C6 (date-range module) implement เสร็จ + /code-review ผ่านทั้ง 2 แกน แต่ยังไม่ commit
- สาขา feature/c6-daterange-module · ทุกอย่างใน working tree (UNCOMMITTED)
- npm test: 53 suite / 647 pass · tsc + lint สะอาด
- develop = origin/develop (9a18e52) · ไม่แตะ main/prod

Decision ค้าง 1 ข้อก่อน commit: zod literal ซ้ำ ×6 — แกะก่อน commit (เพิ่ม DATE_RANGE_VALUES) หรือปล่อย+follow-up? (แนะแกะก่อน)
หลัง commit: browser-verify (ดูตัวเลขแดชบอร์ดเปลี่ยนตามช่วงวัน) → ปิด #4

ถัดไป: ตัดสินใจข้อ literal นั้น → commit → browser-verify → ปิด #4
ก่อนทำ: อ่าน docs/c6-daterange-design.md (decision log 8 ข้อ)
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
