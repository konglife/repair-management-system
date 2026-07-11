# Handoff — C7 จบครบ + push develop → แชทใหม่ "คุยเลือกทางถัดไป"

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-11, หลัง session 3 + คุยต่อ):** 🟢 **C7 จบครบ + push develop + ลด feature/c7 → ผู้ใช้อยาก "คุยเลือกทาง" ในแชทใหม่ (ไม่ใช่ implement ทันที)**
>
> - **C7 ทำครบ 8 ขั้น:** `<DatePicker>` + test → migrate 4 หน้า → reports test ใหม่ → `npm test` 650/650 + tsc + lint → browser-verify 4 หน้า → review 0 blocker
> - **commit/push:** feat `2558599` + docs → **merge develop + push origin** → develop = `60f8492` (= origin) · `feature/c7` ลบแล้ว
> - **`main` ไม่ถูกแตะ** · prod ที่ร้านยังเดิม · ไม่มี DB migration (value Date เหมือนเดิม, router schema เดิม, URL contract เดิม)
> - **คุยกันจบในแชทนี้ (บันทึกไว้ใน doc):** แผนหลัก C1–C10 เต็ม + ตำแหน่งปัจจุบัน + ความรู้ Liquid Glass trade-off (ด้านล่าง)

---

## 🎯 เป้าหมายเซสชันถัดไป = **คุยกันเพื่อเลือกทางถัดไป** (ผู้ใช้บอก "อยากพูดคุยต่อ")

⚠️ **อย่าเริ่ม implement ทันที** — เริ่มจากคุย/ตัดสินใจเลือกทางก่อน ตัวเลือก:

1. **C8 (#6 DataTable)** — UI ล้วน (ปลอดภัย ไม่แตะ DB) · มี issue เปิดอยู่พร้อมทำ · ใช้ `/grilling` เริ่มเหมือน C7
2. **C9 (Float/money)** ⚠️ — **จุดเดียวที่จะแตะ DB จริง** (ชั้น migration) · ยังไม่มี issue ต้อง triage · มีชั้นปลอดภัย (Money module อย่างเดียว ไม่แตะ DB) → ดู "C9 คืออะไร" ด้านล่าง
3. **C4 (financial aggregation)** — Strong badge ตัวเดียวที่ค้าง · "เข้าคู่กับ C2" ซึ่ง C2 ปิดด้วย ADR ไปแล้ว → **ต้องทบทวนว่ายังจำเป็นไหม** ก่อนทำ
4. **release develop→main** — develop = superset ของ main (merge สะอาด) · ไม่มี migration ใหม่ (DB ไม่กระทบ) · ⚠️ ตัวเลข "1 เดือน" ของ dashboard จะเปลี่ยน (rolling แทน since-day-1) = intent ของ #4 · ผู้ใช้ตัดสินใจ · เป็นจังหวะเหมาะเพราะทำครบแทบทุก Strong แล้ว
5. (ลำดับต่ำสุด) **C10** — Speculative · ยังไม่มี issue · ไม่รีบ

---

## 🗺️ แผนหลัก C1–C10 + ตำแหน่งปัจจุบัน

> แผนหลัก = `docs/architecture-review-20260705-th.html` (badge = ความสำคัญ)

| C       | ชื่อ                       | badge                       | สถานะ                                                        |
| ------- | -------------------------- | --------------------------- | ------------------------------------------------------------ |
| **C1**  | EntityPicker               | 🟢 Strong                   | ✅ ทำแล้ว (`7f498c9`)                                        |
| **C2**  | Repair pricing             | 🟡 Worth exploring          | ⚙️ จบด้วย ADR-0001 (คง residual model ไม่แก้โค้ด)            |
| **C3**  | Stock deduction            | 🟢 Strong                   | ✅ ทำแล้ว (#3)                                               |
| **C4**  | Financial aggregation      | 🟢 Strong                   | ❌ **ค้าง** (คู่ C2 · ยังไม่มี issue · ต้องทบทวนจำเป็นไหม)   |
| **C5**  | Auth seam                  | 🟢 Strong                   | ✅ ทำแล้ว (`b262c18`)                                        |
| **C6**  | Date-range                 | 🟢 Strong                   | ✅ ทำแล้ว (#4)                                               |
| **C7**  | Date input (DatePicker)    | 🟢 Strong                   | ✅ ทำแล้ว (#5) · _วันนี้_                                    |
| **C8**  | List + search + pagination | 🟡 Worth exploring          | 🟡 **เปิด issue #6 ยังไม่ทำ**                                |
| **C9**  | Money type                 | 🟡 Worth exploring          | ⬜ ยังไม่เริ่ม · ยังไม่มี issue · ⚠️ แตะ DB (ชั้น migration) |
| **C10** | แยกหน้า stock 1295 บรรทัด  | ⚪ Speculative / in-process | ⬜ ยังไม่เริ่ม · ยังไม่มี issue (ลำดับต่ำสุด)                |

> แยกต่างหาก: **#7** (code-smell EntityPicker/pickers) ✅ — ไม่ใช่ C-series แต่อยู่ใน issue tracker

**สรุปตำแหน่ง:** ✅ ทำครบทุก Strong badge แล้ว ยกเว้น **C4** · 🟡 เหลือ Worth exploring (C8, C9) · ⚪ Speculative (C10) · 🚀 มีตัวเลือก release prod ค้าง ~10 เดือน

---

## 💎 ความรู้ที่คุยกัน (บันทึกไว้ อย่าทำซ้ำ)

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

### Liquid Glass trade-off (ความรู้เสริมจากการคุย C7)

> - reports **เดิม** = native `<input type="date">` (OS/เบราว์เซอร์เป็นคนวาด) → บน iPadOS 26 Safari ได้ **Liquid Glass อัตโนมัติ** (Apple 2025)
> - reports **ใหม่** (+ sales/repairs/stock มาก่อน) = **custom popover** (Radix Popover + react-day-picker, แอปวาดเอง) → **ไม่ได้รับ** styling ของ OS → ไม่มี Liquid Glass บน iPad
> - trade-off = "ความสม่ำเสมอ + ควบคุมหน้าตา" (custom) vs "native feel ต่อ platform" (native input) · C7 เลือก **ความสม่ำเสมอ** ตาม pain point จริงของเจ้าของร้าน ("ทุกหน้าดูไม่เหมือนกัน")
> - ถ้าอยากได้ Liquid Glass คืน ต้องเปลี่ยนทั้ง 4 หน้ากลับเป็น native input แต่จะเสีย: format ผูกตาย `dd/MM/yyyy`, required-asterisk/label a11y แบบเดียวกัน, และหน้าตาจะต่างกันตาม platform อีกครั้ง

### `CONTEXT.md` คือไฟล์อะไร (ถามกันในแชทนี้)

> = เอกสาร **domain หลักของร้าน** ("ใครเป็นคนใช้ ทำอะไร ยังไง เจ็บตรงไหน") · แยกจาก `CLAUDE.md` (กฎเทคนิค) และ `HANDOFF.md` (สถานะงาน) · มี 5 ส่วน: ภาพรวมร้าน · ภาษาธุรกิจ (ubiquitous language + module terms) · รูปร่างธุรกิจจริง (repair-first 92%/95.7% ของเงิน) · workflow + โมเดลราคา residual · pain backlog 4 theme

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

สถานะ: C7 จบครบ + push develop (60f8492) + ลด feature/c7
- npm test 650/650 · browser-verify 4 หน้าผ่าน · code-review 0 blocker
- main ไม่ถูกแตะ · ไม่มี DB migration

อยากคุยเลือกทางถัดไปก่อน (ยังไม่ลงมือทำ): C8 / C9 / C4 / release develop→main / C10
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
