# Handoff — C7 จบครบ (implement + merge develop) → เลือกงานถัดไป

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-11, session 3):** 🟢 **C7 จบครบ 8 ขั้น + merge เข้า develop → ปิด #5**
>
> - **ทำครบ:** สร้าง `<DatePicker>` + test คู่ → migrate 4 หน้า (sales/repairs/stock/reports) → reports test เขียนใหม่ → `npm test` 650/650 + tsc + lint เขียว → browser-verify 4 หน้าผ่าน → `/code-review` 2 แกน 0 blocker
> - **commit:** feat `2558599` (บน `feature/c7`) → **merge เข้า develop** (ดู git log ล่าสุด) · design doc + CONTEXT/API-DOCS/UI-UX doc drift รวมอยู่ใน commit เดียวกัน
> - **ค้นพบสำคัญ:** Radix Popover + react-day-picker **เปิดใน jsdom ได้จริง** → reports test ใช้ calendar day-click ตาม design ไม่ต้อง mock · stock `onChange` wrapper เป็น **type guard จำเป็น** (ไม่ใช่ dead code)
> - **`main` ไม่ถูกแตะ** · prod ที่ร้านยังเดิม · ไม่มี DB migration (value Date เหมือนเดิม, router schema เดิม, URL contract เดิม)

---

## 🎯 เป้าหมายเซสชันถัดไป = **เลือกงานจาก candidate ที่เหลือ** (หรือ release)

candidate ที่เหลือ:

- **C8 (#6 DataTable)** — UI ล้วน (ปลอดภัย ไม่แตะ DB) · ใช้ `/grilling` เริ่มเหมือน C7
- **C9 (Float/money)** ⚠️ — **จุดเดียวที่จะแตะ DB จริง** · ดูรายละเอียดด้านล่าง ⬇
- **release develop→main** — develop = superset ของ main (merge สะอาด) · ไม่มี migration ใหม่ (DB ไม่กระทบ) · ⚠️ ตัวเลข "1 เดือน" ของ dashboard จะเปลี่ยน (rolling แทน since-day-1) = intent ของ #4 · ผู้ใช้ตัดสินใจ

### C9 คืออะไร (ย่อ)

> ทุกคอลัมน์เงินใน DB เป็น **`Float`** → ทศนิยมลอย → บวก/คูณแล้วเกิด noise (เช่น `0.1+0.2 = 0.30000000000000004`) · เห็นจริงใน prod: **141 cell มี noise (~8.6% ของยอดเงินทั้งหมด)** ส่งผลต่อรายงาน/UI
>
> UI มี `CurrencyInput` (deep module) แล้ว แต่ **ฝั่ง server ไม่มีอะไรเลย** — money ไหลผ่าน zod (`z.number()`) → DB (Float) → aggregation (`Σ Float`) โดยไม่มี seam ดัก rounding/format
>
> **แบ่งเป็น 2 ชั้นงาน (ความเสี่ยงต่างกันมาก):**
>
> 1. **Money module (ฝั่ง server)** — สร้าง type/module `{ parse · round · format · add }` ที่เดียวที่จัดการทศนิยม · **ไม่แตะ DB** (logic + test) → ลงได้ก่อน ปลอดภัย
> 2. **schema migration** — เปลี่ยนคอลัมน์เงิน `Float` → `Decimal` หรือ `Int` (เก็บเป็นสตางค์) · ⚠️ **แตะข้อมูล prod จริง** (migration + backfill) → ทำทีหลังสุด ระวังสูง
>
> อ้างอิง: `docs/architecture-review-20260705-th.html` §C9 · `CONTEXT.md` pain (Float rounding) · ยังไม่มี GitHub issue (ต้อง triage)

---

## ✅ สถานะงานที่จบแล้ว

- **C7 (#5 DatePicker)** _(session 3)_ — commit `2558599` + merge develop · browser-verify 4 หน้า · review ผ่าน · **ปิด #5**
- **C7 grill + design** _(session 2)_ — design doc + drift fix พร้อม → implement
- **C6 (#4 date-range module)** — commit `b44dbbd` + merge develop `6dee60e` · browser-verify · **ปิด #4**
- **#7 (code-smell EntityPicker/pickers)** — refactor + review + verify · commit `dfb2d6c` · **ปิด #7**
- **C3 (stock module)** — ship + review + verify · **ปิด #3**
- **C1 (EntityPicker)** — `7f498c9` · **C5 (auth seam)** — `b262c18` · **setup-pre-commit** — `69f8944`

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

**ADR-0001: Repair pricing = residual margin model** — `laborCost` semantic = margin ไม่ใช่ค่าแรง · ดู `docs/adr/0001-repair-pricing-residual-margin.md`

**C7 ไม่กระทบ DB:** value = `Date` เหมือนเดิม → ไม่มี migration / ไม่แตะข้อมูลเดิม · mutation/router รับ Date เหมือนเดิม · Reports URL contract (`startDate/endDate` yyyy-MM-dd) คงเดิม · repairs router `repairDate: z.date().optional()` **ยัง optional** (required เป็น UI-level เท่านั้น)

**ความปลอดภัยของ DB ตอน release:** ทุก issue ปัจจุบัน (C1/C3/C5/#7/C6/C7) = โค้ดล้วน ไม่มี migration → merge develop→main **ไม่แตะ DB prod** · ⚠️ **C9 (Float/money)** = จุดเดียวที่จะแตะ DB จริง (migration + backfill)

---

## 📌 งานแยก (ทำวันไหนก็ได้ ไม่รีบ)

- **prod ค้าง deploy ~10 เดือน** — develop นำ main · release = merge develop→main (ผู้ใช้ตัดสินใจ) · merge สะอาด (develop = superset)
- **`docs/1.csv`, `docs/2.csv`** — scratch ห้าม commit (ยัง untracked อยู่)

---

## 📍 สถานะไฟล์ + git

- **สาขาปัจจุบัน = `develop`** (= `c72bddd` = origin/develop) · `feature/c7` **ลบแล้ว** (local เท่านั้น — ไม่เคย push remote)
- **`main` = `d95d433`** (prod, ไม่ถูกแตะ)
- **working tree:** `docs/1.csv`, `docs/2.csv` (scratch ห้าม commit) — นอกนั้นสะอาด
- **GitHub Issues เปิด:** `#6` C8 · ปิดแล้ว: `#3` `#4` `#5` `#7`

---

## 🛠️ chrome-devtools MCP + CDP (verify UI)

ใช้ตอน browser-verify. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- launcher: `bash scripts/chrome-debug.sh [url]` (copy session จาก profile จริง → debug profile → port 9222)
- ⚠️ ถ้า Chrome debug ปิด → รัน launcher ใหม่ · กฎ: เปิดครั้งเดียว ใช้ยาวทั้ง session
- บทเรียน session 3: dev server + Chrome debug อาจปิดอยู่ทั้งคู่ → curl เช็คก่อน อย่าเชื่อ doc ตาบอด

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: C7 จบครบ + merge develop + ปิด #5
- commit 2558599 · develop ล่าสุด · main ไม่ถูกแตะ · ไม่มี DB migration
- npm test 650/650 · browser-verify 4 หน้าผ่าน · code-review 0 blocker

เลือกงานถัดไป: C8 (#6 DataTable, UI ล้วน) / C9 (⚠️ แตะ DB) / release develop→main
```

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                       | ที่อยู่                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog | `CONTEXT.md`                                                |
| **C7 design doc** (decision log 7 ข้อ)                | `docs/c7-datepicker-design.md`                              |
| **C6 design doc** (deep-module precedent)             | `docs/c6-daterange-design.md`                               |
| **C3 design doc** (deep-module precedent + test-debt) | `docs/c3-stock-design.md`                                   |
| หนี้เทส pattern 11 ข้อ + root cause                   | `docs/test-debt-fix-plan.md`                                |
| ระบบ chrome CDP+MCP (verify UI)                       | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh` |
| ADR: residual margin model                            | `docs/adr/0001-repair-pricing-residual-margin.md`           |
| สถาปัตยกรรม + deployment                              | `docs/ARCHITECTURE.md`                                      |
