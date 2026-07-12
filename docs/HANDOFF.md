# Handoff — C8 ปิดจบ loop · เป้าถัดไป = release MINOR 1.2.0

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-12, session 7):** 🟢 **C8 ปิดจบ loop สมบูรณ์** — code-review ผ่าน (2 แกน) · `matchesAmount()` extract · commit `e1b76f2` บน develop + push origin/develop → Vercel preview · **issue #6 CLOSED** · 671/671 tests + tsc + lint เขียว · working tree สะอาด (เหลือแค่ scratch csv 2 ไฟล์ที่ไม่ commit ตามปกติ)
>
> - **เป้าถัดไป = release MINOR 1.2.0** (UI ล้วน ไม่มี migration = ปลอดภัย เหมือน C7) — ดู flow ด้านล่าง
> - C8 implement + design + grilling (session 5–6) · C8 code-review + commit + ปิด #6 (session 7 นี้)

---

## 🎯 เป้าหมายเซสชันถัดไป = **release MINOR `1.2.0`** (หรือเลือก C4/C9)

C8 ปิดจบ loop แล้ว — flow ถัดไปคือ release สิ่งที่สะสมบน develop ตั้งแต่ v1.1.0:

1. **ตรวจ preview** บน Vercel dev project (`repair-management-system-dev`) ก่อน release — C8 + งานอื่นๆ ที่สะสม
2. **release MINOR `1.2.0`** ตามกฎ versioning ใน `CLAUDE.md` (ดู flow ด้านล่าง) — UI ล้วน ปลอดภัย
3. (ระยะไกล) เลือก candidate ถัดไป: **C4** (financial aggregation — ทบทวนจำเป็นไหมก่อน) หรือ **C9** (Money type — ⚠️ จะแตะ DB migration)

### 🏷️ Flow release (ทำบน develop → merge main → tag → push)

> กฎเต็ม → `CLAUDE.md` section 🏷️ Versioning · ห้ามแก้บน main ตรงๆ

1. แก้บน `develop` (3 ไฟล์):
   - `package.json` → bump `version` `1.1.0` → `1.2.0`
   - `CHANGELOG.md` → `[Unreleased]` → `[1.2.0] - วันที่` พร้อมสรุปงาน (C8 DataTable + matchesAmount + งานอื่นที่สะสม) + เปิด `[Unreleased]` ใหม่ว่างด้านบน
   - `src/components/layout/sidebar.tsx` → เลข version label ต้องตรง `package.json` (**ห้ามปล่อยให้ label โกหก**)
2. commit บน develop → `git merge --no-ff develop` ลง `main`
3. `git tag v1.2.0` ที่ merge commit บน main
4. push: `develop` + `main` + tag (push main/tag **โดน hook → ผู้ใช้กดเอง**)
5. `gh release create v1.2.0 --notes "..."` บน GitHub

> ⚠️ release = "release housekeeping" → ทำบน develop ตรงๆ ได้ ไม่ต้องแตกสาขา feature/

---

## 💎 สรุปงานที่สะสมรอ release (ตั้งแต่ v1.1.0)

- **C8 — DataTable module** _(session 5–7)_ — `DataTable<T>` deep module + 7 call sites migrate + `matchesAmount()` helper · `e1b76f2` · issue #6 CLOSED
- _(ดู `git log v1.1.0..develop --oneline` สำหรับ commit อื่นๆ ที่อาจสะสมถึงจะ release)_

---

## 🧨 สถานะ working tree (สะอาด)

- **develop = `e1b76f2`** (= origin/develop) — ทุกอย่าง commit หมดแล้ว
- **เหลือ untracked:** `docs/1.csv`, `docs/2.csv` — scratch ห้าม commit (ตามปกติ)

---

## 🗺️ แผนหลัก C1–C10 + ตำแหน่งปัจจุบัน

> แผนหลัก = `docs/architecture-review-20260705-th.html` (badge = ความสำคัญ)

| C       | ชื่อ                       | badge                       | สถานะ                                                        |
| ------- | -------------------------- | --------------------------- | ------------------------------------------------------------ |
| **C1**  | EntityPicker               | 🟢 Strong                   | ✅ ทำแล้ว (`7f498c9`) · อยู่ใน v1.1.0                        |
| **C2**  | Repair pricing             | 🟡 Worth exploring          | ⚙️ จบด้วย ADR-0001 (คง residual model ไม่แก้โค้ด)            |
| **C3**  | Stock deduction            | 🟢 Strong                   | ✅ ทำแล้ว (#3) · อยู่ใน v1.1.0                               |
| **C4**  | Financial aggregation      | 🟢 Strong                   | ❌ **ค้าง** (คู่ C2 · ยังไม่มี issue · ต้องทบทวนจำเป็นไหม)   |
| **C5**  | Auth seam                  | 🟢 Strong                   | ✅ ทำแล้ว (`b262c18`) · อยู่ใน v1.1.0                        |
| **C6**  | Date-range                 | 🟢 Strong                   | ✅ ทำแล้ว (#4) · อยู่ใน v1.1.0                               |
| **C7**  | Date input (DatePicker)    | 🟢 Strong                   | ✅ ทำแล้ว (#5) · อยู่ใน v1.1.0                               |
| **C8**  | List + search + pagination | 🟡 Worth exploring          | ✅ **เสร็จ + ปิด #6** (`e1b76f2`) · รอ release 1.2.0         |
| **C9**  | Money type                 | 🟡 Worth exploring          | ⬜ ยังไม่เริ่ม · ยังไม่มี issue · ⚠️ แตะ DB (ชั้น migration) |
| **C10** | แยกหน้า stock 1295 บรรทัด  | ⚪ Speculative / in-process | ⬜ ยังไม่เริ่ม · ยังไม่มี issue (ลำดับต่ำสุด)                |

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

- **ADR-0001: Repair pricing = residual margin model** — `laborCost` semantic = margin ไม่ใช่ค่าแรง · `docs/adr/0001-repair-pricing-residual-margin.md`
- **กฎ versioning** → `CLAUDE.md` section 🏷️ Versioning (release = แก้ package.json + CHANGELOG + sidebar บน develop → merge → tag → `gh release create`)
- **C8 = UI ล้วน ไม่มี migration** → release ปลอดภัย · ⚠️ **C9 (Float/money)** = จุดเดียวที่จะแตะ DB จริง (MAJOR candidate)
- **C8 design decisions** → `docs/c8-datatable-design.md` (8 ข้อ Q1–Q8)
- **`matchesAmount(amount, term)` helper** อยู่ใน `src/lib/utils.ts` — รวม pattern ค้นหาเงิน (raw number + formatted currency) · ไว้ใช้ตอน C9 (Money type)

---

## ✅ สถานะงานที่จบแล้ว

- **C8 code-review + commit + ปิด #6** _(session 7)_ — `e1b76f2` · matchesAmount extract + doc fix · 2-axis review ผ่าน
- **C8 implement** _(session 6)_ — DataTable + 7 call sites · 671/671 + browser
- **C8 design + grilling** _(session 5)_ — `docs/c8-datatable-design.md` + CONTEXT module term
- **release v1.1.0** _(session 4)_ — merge develop→main `742513e` + tag + GitHub Release + bump 1.1.0 + กฎ versioning
- **C7 (#5)** `2558599` · **C6 (#4)** `b44dbbd` · **#7** `dfb2d6c` · **C3 (#3)** · **C1** `7f498c9` · **C5** `b262c18` — ทั้งหมดอยู่ใน v1.1.0

---

## 📌 งานแยก (ทำวันไหนก็ได้ ไม่รีบ)

- **C4 (financial aggregation)** — Strong badge เดียวที่ค้าง · แต่คู่กับ C2 ปิดด้วย ADR แล้ว → ทบทวนจำเป็นไหมก่อนทำ
- **`docs/1.csv`, `docs/2.csv`** — scratch ห้าม commit (untracked)

---

## 📍 สถานะ git

- **สาขาปัจจุบัน = `develop`** (= `e1b76f2` = origin/develop)
- **`main` = `742513e`** (= origin/main = tag `v1.1.0` = GitHub Release Latest)
- **tag บน GitHub:** `v1.0.0`, `v1.1.0`
- **working tree:** สะอาด (เหลือแค่ scratch csv)
- **GitHub Issues เปิด:** ไม่มี · ปิดแล้ว: `#3` `#4` `#5` `#6` `#7`

---

## 🛠️ chrome-debugtools MCP + CDP (verify UI)

ใช้ตอน browser-verify. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- launcher: `bash scripts/chrome-debug.sh [url]` (copy session จาก profile จริง → debug profile → port 9222)
- ⚠️ ถ้า Chrome debug ปิด → รัน launcher ใหม่ · กฎ: เปิดครั้งเดียว ใช้ยาวทั้ง session
- dev server: `npm run dev` (CLAUDE.md บอกรันอยู่แล้ว — **แต่ session ใหม่อาจปิดอยู่จริง ต้อง start เอง** · บทเรียน: verify จริงก่อน อย่าเชื่อ doc ตาบอด)

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: C8 ปิดจบ loop — code-review ผ่าน · commit e1b76f2 บน develop + push · issue #6 CLOSED · 671/671 เขียว
- develop = e1b76f2 · working tree สะอาด · ไม่มี DB migration

เป้าหมายถัดไป: release MINOR 1.2.0 (UI ล้วน ปลอดภัย) — แก้ package.json + CHANGELOG + sidebar → merge main → tag → push → gh release create
- (ระยะไกล) เลือก candidate ถัดไป: C4 (ทบทวน) หรือ C9 (⚠️ แตะ DB)
```

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                         | ที่อยู่                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog   | `CONTEXT.md`                                                |
| **กฎ versioning + flow release**                        | `CLAUDE.md` → section 🏷️ Versioning                         |
| **C8 design doc** (interface + 8 ข้อ decision + verify) | `docs/c8-datatable-design.md`                               |
| **C7/C6/C3 design doc** (deep-module precedent)         | `docs/c{7,6,3}-*.md`                                        |
| หนี้เทส pattern 11 ข้อ + root cause                     | `docs/test-debt-fix-plan.md`                                |
| ระบบ chrome CDP+MCP (verify UI)                         | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh` |
| ADR: residual margin model                              | `docs/adr/0001-repair-pricing-residual-margin.md`           |
| สถาปัตยกรรม + deployment                                | `docs/ARCHITECTURE.md`                                      |
