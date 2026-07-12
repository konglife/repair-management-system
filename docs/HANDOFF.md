# Handoff — C8: implement ครบ 4 ขั้น + 7 call sites → แชทใหม่ "code-review + ปิด #6"

> ไฟล์ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env → `CLAUDE.md` · domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog → `CONTEXT.md`
> เอกสารนี้โฟกัสที่ **เป้าหมาย + สถานะ + จุดที่จะต่อ**

> **สถานะล่าสุด (2026-07-12, session 6):** 🟢 **C8 implement ครบทุกขั้น** — `DataTable<T>` + test สร้าง + **7 call sites migrate หมด** (customers · sales · repairs · stock×4) → 671/671 tests เขียว + tsc + lint สะอาด + browser-verify ผ่านทุกตาราง · ⚠️ **ยังไม่ commit / ยังไม่ code-review / ยังไม่ release**
>
> - **C8 grilling + design จบแล้ว (session 5)** → `docs/c8-datatable-design.md` (interface + ขั้นตอน + verify ครบ)
> - **implement (session 6 นี้):** TDD DataTable.test (21/21 แดง→เขียว) → migrate customers (47/47) → sales+repairs (88/88) → stock×4 (63/63) → full suite 671/671
> - **dead code ตัดระหว่าง migrate:** repairs predicate `repair.status` (Repair model ไม่มี field นี้ = `undefined?.` = falsy เสมอ) + stock `?.` guards ซ้ำซ้อน
> - ⚠️ **ยังไม่ commit** — ทำงานอยู่บน working tree ของ `develop` (design doc + handoff + journal + 7 page files + DataTable + CONTEXT.md แก้)

---

## 🎯 เป้าหมายเซสชันถัดไป = **`/code-review` C8 → ปิด issue #6 → (ระยะไกล) release MINOR**

C8 implement **เสร็จทุกขั้นแล้ว** — flow ถัดไป:

1. **`/code-review`** — รีวิว 2 แกน (Standards + Spec) เทียบ `docs/c8-datatable-design.md` + issue #6
   - ⚠️ ชนชื่อ built-in — ใช้ Matt's `/code-review` (ดู `.claude/skills/README.md`) หรือ built-in `/code-review` แล้วแต่ที่ตั้งไว้
2. แก้ findings (ถ้ามี) → ทำให้เขียว
3. **commit** (บน `develop`) — ยังไม่ push/main
4. ปิด **issue #6** (`gh issue close 6`)
5. (ระยะไกล) release MINOR (`1.2.0`) ตามกฎ versioning ใน `CLAUDE.md`

> ⚠️ **C8 = UI ล้วน ไม่มี DB migration** → release ปลอดภัย (เหมือน C7) · แตะแค่ UI layer

---

## 🧨 สถานะ working tree (สำคัญ — ยังไม่ commit)

**ไฟล์ใหม่/แก้ (ทั้งหมด C8):**

- `src/components/ui/DataTable.tsx` (ใหม่ — deep module)
- `src/components/ui/DataTable.test.tsx` (ใหม่ — 21 tests)
- `src/app/(main)/customers/page.tsx` (migrate)
- `src/app/(main)/sales/page.tsx` (migrate)
- `src/app/(main)/repairs/page.tsx` (migrate)
- `src/app/(main)/stock/page.tsx` (migrate × 4 tables)
- `CONTEXT.md` (+ DataTable module term)
- `docs/HANDOFF.md` (ไฟล์นี้, session 6)
- `docs/journal/2026-07-12.md` (session 5+6)
- `docs/c8-datatable-design.md` (จาก session 5 — ยัง untracked)

**Untracked scratch ห้าม commit:** `docs/1.csv`, `docs/2.csv`

---

## 🧭 Matt Pocock skills — flow ปัจจุบัน

> 24 skills ใน `.claude/skills/` (local-only ไม่ commit) · รายการ + วิธี re-sync → `.claude/skills/README.md`
> **user** = พิมพ์ `/<ชื่อ>` เท่านั้น · **model** = agent หยิบใช้เองได้

**ตำแหน่ง C8 ใน flow:**

```
/to-prd → /to-issues → /triage → /grill-me(/grilling) → [design doc] → /implement → /code-review → /handoff
                                          ✅ (s5)         ✅ (s5)        ✅ (s6)      🔜 เริ่มที่นี่   ✅ (s6)
```

| skill          | ทำอะไร                         | สถานะ                                   |
| -------------- | ------------------------------ | --------------------------------------- |
| `/grilling`    | สัมภาษณ์ดีไซน์หนักๆ            | ✅ จบ (s5)                              |
| `/implement`   | implement ตามแผนที่ grill ได้  | ✅ จบ (s6 — 4 ขั้นครบ)                  |
| `/tdd`         | red-green-refactor             | ✅ ใช้ข้างใน implement                  |
| `/code-review` | รีวิว Standards + Spec (2 แกน) | 🔜 **เริ่มที่นี่** · ⚠️ ชนชื่อ built-in |
| `/handoff`     | อัดเซสชันส่งต่อ                | ✅ ใช้อยู่ (เอกสารนี้)                  |

---

## 🗺️ แผนหลัก C1–C10 + ตำแหน่งปัจจุจบ

> แผนหลัก = `docs/architecture-review-20260705-th.html` (badge = ความสำคัญ)

| C       | ชื่อ                       | badge                       | สถานะ                                                             |
| ------- | -------------------------- | --------------------------- | ----------------------------------------------------------------- |
| **C1**  | EntityPicker               | 🟢 Strong                   | ✅ ทำแล้ว (`7f498c9`) · อยู่ใน v1.1.0                             |
| **C2**  | Repair pricing             | 🟡 Worth exploring          | ⚙️ จบด้วย ADR-0001 (คง residual model ไม่แก้โค้ด)                 |
| **C3**  | Stock deduction            | 🟢 Strong                   | ✅ ทำแล้ว (#3) · อยู่ใน v1.1.0                                    |
| **C4**  | Financial aggregation      | 🟢 Strong                   | ❌ **ค้าง** (คู่ C2 · ยังไม่มี issue · ต้องทบทวนจำเป็นไหม)        |
| **C5**  | Auth seam                  | 🟢 Strong                   | ✅ ทำแล้ว (`b262c18`) · อยู่ใน v1.1.0                             |
| **C6**  | Date-range                 | 🟢 Strong                   | ✅ ทำแล้ว (#4) · อยู่ใน v1.1.0                                    |
| **C7**  | Date input (DatePicker)    | 🟢 Strong                   | ✅ ทำแล้ว (#5) · อยู่ใน v1.1.0                                    |
| **C8**  | List + search + pagination | 🟡 Worth exploring          | 🔨 **implement เสร็จ (ยังไม่ commit/review)** · issue #6 เปิดอยู่ |
| **C9**  | Money type                 | 🟡 Worth exploring          | ⬜ ยังไม่เริ่ม · ยังไม่มี issue · ⚠️ แตะ DB (ชั้น migration)      |
| **C10** | แยกหน้า stock 1295 บรรทัด  | ⚪ Speculative / in-process | ⬜ ยังไม่เริ่ม · ยังไม่มี issue (ลำดับต่ำสุด)                     |

---

## 💎 สรุป C8 งานที่ทำ (session 6) — อ่าน `docs/c8-datatable-design.md` ประกอบ

### DataTable<T> (deep module)

`src/components/ui/DataTable.tsx` — ครอง: SearchInput (uncontrolled term state) + empty short-circuit + `.filter(predicate)` + Table render + loading/empty states + optional pagination (reset/clamp/hide).

```tsx
interface Column<T> {
  header;
  cell: (row) => ReactNode;
  className?;
  headerClassName?;
}
interface DataTableProps<T extends { id: string }> {
  rows;
  columns;
  search?: { placeholder?; predicate: (row, term) => boolean };
  loading?;
  emptyMessage?;
  emptySearchMessage?;
  pagination?: { pageSize };
}
```

### ผล verify แต่ละขั้น

| ขั้น | งาน                    | test                     | browser                                            |
| ---- | ---------------------- | ------------------------ | -------------------------------------------------- |
| 1    | DataTable + test (TDD) | 21/21                    | —                                                  |
| 2    | customers              | 47/47                    | ✅ search + edit dialog                            |
| 3    | sales + repairs        | 88/88                    | ✅ nested `customer.name` + format/currency search |
| 4    | stock ×4               | 63/63                    | ✅ inline edit + conditional column + pre-filter   |
| —    | **ทั้งระบบ**           | **671/671 · tsc · lint** | —                                                  |

### สิ่งที่ validate ได้จากการ migrate (design ถูกต้อง)

- **Q2 cell render fn** รองรับ cell variety ทั้งหมดจริง: nested field · format date · currency · truncate · null fallback · **inline edit (`<form>`/`<select>`/`<CurrencyInput>` ใน cell)** · action button
- **Q3 predicate fn** (ไม่ใช่ keys) จำเป็นจริง: nested `customer.name` + formatted date/currency ทำด้วย keys ไม่ได้
- **purchase history edge case**: conditional column (5↔4) + pre-filter base rows (product/all) + 3 empty messages → map เป็น `columns` array สลับ + `emptyMessage` conditional + `emptySearchMessage` ได้พอดี
- **pagination = optional ทุกหน้า** (omit = show all = current behavior เป๊ะ ไม่ regress)

### การตัดสินใจเล็กน้อยที่ทำระหว่าง migrate (จดไว้ review)

- **reorder UI เล็กน้อยใน stock**: create form + "Filter by product" select ย้ายไปไว้ **ก่อน** `<DataTable>` (เดิมอยู่ระหว่าง SearchInput กับ Table) — เพราะ DataTable ครอง search+table ไว้ด้วยกัน · ไม่ใช่ regress (table appearance เหมือนเดิม)
- **repairs placeholder แก้** "Search by customer name, device, or status..." → "Search by customer name or description..." (เดิมโกหก — ค้น status ไม่ได้เพราะ model ไม่มี field)
- **repairs/stock predicate ตัด dead `?.` guard** ที่ไม่จำเป็น (type-safe อยู่แล้วใน row type)

---

## ✅ สถานะงานที่จบแล้ว

- **C8 implement** _(session 6)_ — DataTable + 7 call sites · 671/671 + browser · **พร้อม code-review**
- **C8 design + grilling** _(session 5)_ — `docs/c8-datatable-design.md` + CONTEXT module term
- **release v1.1.0** _(session 4)_ — merge develop→main `742513e` + tag + GitHub Release + bump 1.1.0 + กฎ versioning
- **C7 (#5)** `2558599` · **C6 (#4)** `b44dbbd` · **#7** `dfb2d6c` · **C3 (#3)** · **C1** `7f498c9` · **C5** `b262c18` — ทั้งหมดอยู่ใน v1.1.0

---

## 🔑 Decision สำคัญที่ต้องรู้ก่อนทำงานต่อ

- **ADR-0001: Repair pricing = residual margin model** — `laborCost` semantic = margin ไม่ใช่ค่าแรง · `docs/adr/0001-repair-pricing-residual-margin.md`
- **กฎ versioning** → `CLAUDE.md` section 🏷️ Versioning (release = แก้ package.json + CHANGELOG + sidebar บน develop → merge → tag → `gh release create`)
- **C8 = UI ล้วน ไม่มี migration** → release ปลอดภัย · ⚠️ **C9 (Float/money)** = จุดเดียวที่จะแตะ DB จริง
- **C8 design decisions** → `docs/c8-datatable-design.md` (8 ข้อ Q1–Q8)

---

## 📌 งานแยก (ทำวันไหนก็ได้ ไม่รีบ)

- **C4 (financial aggregation)** — Strong badge เดียวที่ค้าง · แต่คู่กับ C2 ปิดด้วย ADR แล้ว → ทบทวนจำเป็นไหมก่อนทำ
- **`docs/1.csv`, `docs/2.csv`** — scratch ห้าม commit (untracked)

---

## 📍 สถานะ git

- **สาขาปัจจุบัน = `develop`** (= `c2371c3` = origin/develop)
- **`main` = `742513e`** (= origin/main = tag `v1.1.0` = GitHub Release Latest)
- **tag บน GitHub:** `v1.0.0`, `v1.1.0`
- **working tree:** ไฟล์ C8 ทั้งหมด (ดู section "สถานะ working tree" ด้านบน) — **uncommitted**
- **GitHub Issues เปิด:** `#6` C8 (implement เสร็จ รอ code-review → close) · ปิดแล้ว: `#3` `#4` `#5` `#7`

---

## 🛠️ chrome-debugtools MCP + CDP (verify UI)

ใช้ตอน browser-verify. **อ่าน `docs/agents/chrome-cdp-mcp.md` ก่อน**

- launcher: `bash scripts/chrome-debug.sh [url]` (copy session จาก profile จริง → debug profile → port 9222)
- ⚠️ ถ้า Chrome debug ปิด → รัน launcher ใหม่ · กฎ: เปิดครั้งเดียว ใช้ยาวทั้ง session
- dev server: `npm run dev` (CLAUDE.md บอกรันอยู่แล้ว — **แต่ session นี้ปิดอยู่จริง ต้อง start เอง** · บทเรียน: verify จริงก่อน อย่าเชื่อ doc ตาบอด)

---

## 💬 ตัวอย่างข้อความแรกในแชทใหม่

```
อ่าน docs/HANDOFF.md ก่อน

สถานะ: C8 implement ครบ 4 ขั้น + 7 call sites — 671/671 tests เขียว + browser-verify ผ่าน
- develop = c2371c3 · งานทั้งหมดยัง uncommitted บน working tree · ไม่มี DB migration

เป้าหมายถัดไป: /code-review C8 (2 แกน Standards+Spec เทียบ docs/c8-datatable-design.md + issue #6)
- รีวิวแล้ว → แก้ findings → commit บน develop → ปิด #6
- (ระยะไกล) release MINOR 1.2.0
```

---

## 📚 อ้างอิง (อย่าทำซ้ำ — ไปอ่านที่ไฟล์)

|                                                         | ที่อยู่                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| Domain + รูปร่างธุรกิจ + โมเดลราคาซ่อม + pain backlog   | `CONTEXT.md`                                                |
| **กฎ versioning**                                       | `CLAUDE.md` → section 🏷️ Versioning                         |
| **C8 design doc** (interface + 8 ข้อ decision + verify) | `docs/c8-datatable-design.md`                               |
| **C7/C6/C3 design doc** (deep-module precedent)         | `docs/c{7,6,3}-*.md`                                        |
| หนี้เทส pattern 11 ข้อ + root cause                     | `docs/test-debt-fix-plan.md`                                |
| ระบบ chrome CDP+MCP (verify UI)                         | `docs/agents/chrome-cdp-mcp.md` + `scripts/chrome-debug.sh` |
| ADR: residual margin model                              | `docs/adr/0001-repair-pricing-residual-margin.md`           |
| สถาปัตยกรรม + deployment                                | `docs/ARCHITECTURE.md`                                      |
