# Handoff — release v1.1.0 ขึ้น prod แล้ว → แชทใหม่ "ทำ C8 DataTable + pagination"

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-11, session 4):** 🟢 **release v1.1.0 ขึ้น production สำเร็จ (merge develop→main + tag + GitHub Release + Vercel build ผ่าน + sidebar ขึ้น 1.1.0 จริง)** → ผู้ใช้เลือกทำ **C8 (#6 DataTable) พร้อมเพิ่ม pagination** เป็นงานถัดไป
>
> - **release v1.1.0 ทำครบ:** merge `develop→main` (`--no-ff` commit `742513e`) · tag `v1.1.0` · GitHub Release (Latest) · bump `package.json`/CHANGELOG/sidebar → `1.1.0` · **ไม่มี DB migration** (DB prod ไม่กระทบ)
> - **กฎ versioning เพิ่มใน `CLAUDE.md`** (section 🏷️ Versioning) — เลข SemVer + ขั้นตอน release ที่ต้องแก้ไฟล์ 3 ที่ก่อน merge
> - **GitHub Releases vs tag:** เข้าใจกันแล้ว — tag ≠ Release (Release = หน้าจัดแต่งบน GitHub UI ต้องสร้างด้วย `gh release create` แยก)
> - **ผู้ใช้ตัดสินใจ C8:** ทำ DataTable + **เพิ่ม pagination ด้วย** (ทั้งที่ issue #6 เตือนว่า pagination speculative ตอนข้อมูลน้อย)

---

## 🎯 เป้าหมายเซสชันถัดไป = **ทำ C8 (#6 DataTable) + เพิ่ม pagination**

flow เหมือน C7 ทุก Strong badge:

1. **`/grilling` ออกแบบ interface `DataTable<T>` ก่อน** (T generic, predicate shape, รูปแบบ pagination)
2. implement บน `develop` (หรือสาขา `feature/c8` จาก develop)
3. test แต่ละ list page เขียว + tsc + lint
4. browser-verify 6 หน้า list
5. code-review

⚠️ **ก่อนเริ่ม** — issue #6 บอกชัดว่า pagination เป็น speculative ตอนนี้ (ข้อมูลร้านยังน้อย: Low Stock 20 รายการ, Recent Activities ~10). **ผู้ใช้เลือกจะเพิ่ม pagination อยู่ดี** → ตอน `/grilling` ให้ย้ำ trade-off นี้อีกครั้ง และออกแบบให้ pagination เป็น optional config ของ `DataTable<T>` (เปิด/ปิดได้ต่อหน้า) จะได้ไม่บังคับใช้ทุกหน้า

---

## 🗺️ แผนหลัก C1–C10 + ตำแหน่งปัจจุบัน

> แผนหลัก = `docs/architecture-review-20260705-th.html` (badge = ความสำคัญ)

| C       | ชื่อ                       | badge                       | สถานะ                                                        |
| ------- | -------------------------- | --------------------------- | ------------------------------------------------------------ |
| **C1**  | EntityPicker               | 🟢 Strong                   | ✅ ทำแล้ว (`7f498c9`) · **อยู่ใน v1.1.0**                    |
| **C2**  | Repair pricing             | 🟡 Worth exploring          | ⚙️ จบด้วย ADR-0001 (คง residual model ไม่แก้โค้ด)            |
| **C3**  | Stock deduction            | 🟢 Strong                   | ✅ ทำแล้ว (#3) · **อยู่ใน v1.1.0**                           |
| **C4**  | Financial aggregation      | 🟢 Strong                   | ❌ **ค้าง** (คู่ C2 · ยังไม่มี issue · ต้องทบทวนจำเป็นไหม)   |
| **C5**  | Auth seam                  | 🟢 Strong                   | ✅ ทำแล้ว (`b262c18`) · **อยู่ใน v1.1.0**                    |
| **C6**  | Date-range                 | 🟢 Strong                   | ✅ ทำแล้ว (#4) · **อยู่ใน v1.1.0**                           |
| **C7**  | Date input (DatePicker)    | 🟢 Strong                   | ✅ ทำแล้ว (#5) · **อยู่ใน v1.1.0**                           |
| **C8**  | List + search + pagination | 🟡 Worth exploring          | 🔜 **เป้าหมายถัดไป** · issue #6 เปิดอยู่ · + pagination      |
| **C9**  | Money type                 | 🟡 Worth exploring          | ⬜ ยังไม่เริ่ม · ยังไม่มี issue · ⚠️ แตะ DB (ชั้น migration) |
| **C10** | แยกหน้า stock 1295 บรรทัด  | ⚪ Speculative / in-process | ⬜ ยังไม่เริ่ม · ยังไม่มี issue (ลำดับต่ำสุด)                |

> แยกต่างหาก: **#7** (code-smell EntityPicker/pickers) ✅ — ไม่ใช่ C-series แต่อยู่ใน issue tracker · อยู่ใน v1.1.0

**สรุปตำแหน่ง:** ✅ ทำครบทุก Strong badge แล้ว ยกเว้น **C4** (ต้องทบทวนจำเป็นไหม) · 🚀 **v1.1.0 ขึ้น prod แล้ว** (เลิกค้าง deploy) · 🟡 เหลือ Worth exploring (C8, C9) · ⚪ Speculative (C10)

---

## 💎 ความรู้ที่คุยกัน (บันทึกไว้ อย่าทำซ้ำ)

### C8 คืออะไร (ย่อ)

> 6 หน้า list (customers · stock×3 · sales · repairs) แต่ละหน้าเขียน `useMemo` + `.filter()` ค้นหาของตัวเองซ้ำๆ และไม่มี pagination เลย
>
> **เป้าหมาย:** สร้าง `DataTable<T>` รับ `rows + predicate + pagination` → 6 หน้าบางลง มี interface เดียว
>
> **แบ่งเป็น 2 ส่วนใน module เดียวกัน:**
>
> 1. **search consolidation** — รวม search เป็น interface เดียว (ไม่ speculative, ทำเลย)
> 2. **pagination** — เพิ่มแบ่งหน้า (issue #6 ว่า speculative ตอนข้อมูลน้อย แต่ **ผู้ใช้เลือกทำด้วย**) → ออกแบบเป็น optional config
>
> ⚠️ **ความเสี่ยง:** UI ล้วน ไม่แตะ DB → ปลอดภัย · แต่แตะ 6 หน้าพร้อมกัน → ต้อง test + browser-verify ทุกหน้า
>
> อ้างอิง: `docs/architecture-review-20260705-th.html` §C8 · issue `#6` · ยังไม่มี design doc (ต้องสร้างตอน `/grilling`)

### Versioning flow + กฎใหม่ (เพิ่งตกผลึก session นี้)

> - เลขเวอร์ชัน `MAJOR.MINOR.PATCH`: **PATCH**=แก้บั๊ก · **MINOR**=เพิ่มฟีเจอร์ของเดิมไม่พัง (กรณีปกติ) · **MAJOR**=breaking (เช่น C9 migration)
> - **git tag ≠ GitHub Release** — tag แค่ป้ายชี้ commit (สร้าง `git tag`+push); Release คือหน้าจัดแต่งบน GitHub UI (สร้าง `gh release create` แยก)
> - **ขั้นตอน release (บันทึกเป็นกฎใน `CLAUDE.md` แล้ว):** แก้ไฟล์ 3 ที่บน develop ก่อน (package.json + CHANGELOG + sidebar) → merge `--no-ff` ไป main → tag → push (main โดน hook ต้องผู้ใช้กด) → `gh release create`
> - บทเรียน: pre-commit hook (jest --findRelatedTests) ดัก label เก่า `2.3.0.DEV` ใน `layout.test.tsx` → แก้เป็น substring `/Repair Shop/` ไว้แล้ว จะไม่พังตอน bump ครั้งต่อไป

### รายละเอียดเดิม (คงไว้ อ้างอิงได้)

- **Liquid Glass trade-off** (C7) — custom popover (Radix) ไม่ได้ Liquid Glass บน iPadOS 26 ต่างจาก native `<input type="date">`
- **C9 (Float/money)** ⚠️ — 141 cell มี noise ~8.6% · จุดเดียวที่จะแตะ DB จริง · มีชั้นปลอดภัย Money module (ไม่แตะ DB) ทำก่อนได้ · ยังไม่มี issue ต้อง triage
- **`CONTEXT.md`** = เอกสาร domain หลักของร้าน (ใครใช้/ทำอะไร/เจ็บตรงไหน) แยกจาก CLAUDE.md กับ HANDOFF.md

---

## ✅ สถานะงานที่จบแล้ว

- **release v1.1.0** _(session 4)_ — merge develop→main `742513e` + tag + GitHub Release + bump 1.1.0 + กฎ versioning · browser-verify ผู้ใช้ (sidebar 1.1.0)
- **C7 (#5 DatePicker)** _(session 3)_ — commit `2558599` · **ปิด #5** · อยู่ใน v1.1.0
- **C6 (#4 date-range)** — commit `b44dbbd` · **ปิด #4** · อยู่ใน v1.1.0
- **#7 (code-smell)** — commit `dfb2d6c` · **ปิด #7** · อยู่ใน v1.1.0
- **C3 (stock)** — **ปิด #3** · อยู่ใน v1.1.0
- **C1 (EntityPicker)** `7f498c9` · **C5 (auth seam)** `b262c18` · **setup-pre-commit** `69f8944` — อยู่ใน v1.1.0

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

**ADR-0001: Repair pricing = residual margin model** — `laborCost` semantic = margin ไม่ใช่ค่าแรง · ดู `docs/adr/0001-repair-pricing-residual-margin.md`

**กฎ versioning (ใหม่):** ดู `CLAUDE.md` section 🏷️ Versioning — release = แก้ package.json + CHANGELOG + sidebar บน develop ก่อน → merge → tag → `gh release create`

**ความปลอดภัยของ DB:** C8 = UI ล้วน ไม่มี migration → ทำได้สบาย · ⚠️ **C9 (Float/money)** = จุดเดียวที่จะแตะ DB จริง (migration + backfill)

---

## 📌 งานแยก (ทำวันไหนก็ได้ ไม่รีบ)

- **C4 (financial aggregation)** — Strong badge เดียวที่ค้าง · แต่คู่กับ C2 ซึ่งปิดด้วย ADR ไปแล้ว → ต้องทบทวนก่อนว่ายังจำเป็นไหม ก่อนเสียเวลาทำ
- **`docs/1.csv`, `docs/2.csv`** — scratch ห้าม commit (ยัง untracked อยู่)

---

## 📍 สถานะไฟล์ + git

- **สาขาปัจจุบัน = `develop`** (= `5527caa` = origin/develop)
- **`main` = `742513e`** (= origin/main = tag `v1.1.0` = GitHub Release Latest)
- **tag บน GitHub:** `v1.0.0`, `v1.1.0`
- **working tree:** `docs/1.csv`, `docs/2.csv` (scratch ห้าม commit) — นอกนั้นสะอาด
- **GitHub Issues เปิด:** `#6` C8 (เป้าหมายถัดไป) · ปิดแล้ว: `#3` `#4` `#5` `#7`

---

## 🛠️ chrome-devtools MCP + CDP (verify UI)

ใช้ตอน browser-verify. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- launcher: `bash scripts/chrome-debug.sh [url]` (copy session จาก profile จริง → debug profile → port 9222)
- ⚠️ ถ้า Chrome debug ปิด → รัน launcher ใหม่ · กฎ: เปิดครั้งเดียว ใช้ยาวทั้ง session
- บทเรียน session 3/4: dev server + Chrome debug อาจปิดอยู่ทั้งคู่ → curl เช็คก่อน อย่าเชื่อ doc ตาบอด

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: release v1.1.0 ขึ้น prod แล้ว (merge main + tag + GitHub Release + sidebar 1.1.0)
- develop = 5527caa · main = 742513e (= v1.1.0) · ไม่มี DB migration

เป้าหมายถัดไป: ทำ C8 (#6 DataTable) + เพิ่ม pagination
- เริ่มด้วย /grilling ออกแบบ interface DataTable<T> เหมือน C7
```

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                       | ที่อยู่                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog | `CONTEXT.md`                                                |
| **กฎ versioning (ใหม่)**                              | `CLAUDE.md` → section 🏷️ Versioning                         |
| **C7 design doc** (deep-module precedent)             | `docs/c7-datepicker-design.md`                              |
| **C6 design doc** (deep-module precedent)             | `docs/c6-daterange-design.md`                               |
| **C3 design doc** (deep-module precedent + test-debt) | `docs/c3-stock-design.md`                                   |
| หนี้เทส pattern 11 ข้อ + root cause                   | `docs/test-debt-fix-plan.md`                                |
| ระบบ chrome CDP+MCP (verify UI)                       | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh` |
| ADR: residual margin model                            | `docs/adr/0001-repair-pricing-residual-margin.md`           |
| สถาปัตยกรรม + deployment                              | `docs/ARCHITECTURE.md`                                      |
