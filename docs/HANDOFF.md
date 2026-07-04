# Handoff — เซสชัน 2026-07-01 (ตอนที่ 3: เริ่มสร้าง HTML แผนภาพสถาปัตยกรรม 5 ไฟล์)

> ไฟล์นี้ใช้ส่งต่องานไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env ทั้งหมดอยู่ใน `CLAUDE.md` ไฟล์นี้โฟกัสที่ **ความคืบหน้า + จุดที่จะต่อ**

---

## 📍 สถานะตอนจบเซสชัน
- **สาขา:** `develop` (sync `origin/develop`) — commit ล่าสุด `de03e2b`
- **`main`:** local = `origin/main` = `d95d433` — production ล็อค ห้ามแตะ
- **Working tree:** มีไฟล์ **ยังไม่ commit เยอะ** (สะสมมา 3 ตอน) — ดู "งานค้าง"
- ⚠️ **ยังไม่ได้ commit อะไรเลย** — รอผู้ใช้สั่ง (ตามกฎเหล็ก)

---

## ✅ สิ่งที่ทำเสร็จเซสชันนี้ (ตอนที่ 3)

### 1. สร้างไฟล์แผนภาพที่ 1 สำเร็จ → `docs/architecture-component-20260701.html`
High-Level Component Diagram ของระบบจริง — แบ่ง **6 ชั้น** (Client → Auth Boundary → App Router → tRPC → Domain Routers → Data) อ้างไฟล์จริงใน `src/` ทุกกล่อง. เน้นปัญหาเด่นที่เชื่อมไปเอกสารเดิม:
- 🐞 `reports.getMonthlySummary` = `publicProcedure` (รั่ว auth)
- ⚠ logic ซ้ำข้าม router (sale≈repair · date-range ×3 · dashboard≈reports) = candidate refactor #1/#2/#4/#5
- ⚠ `stock/page.tsx` = 1,295 บรรทัด = candidate #3

### 2. เพิ่ม pan/zoom แบบโต้ตอบให้ภาพใหญ่ (สำคัญที่สุดที่ต้องส่งต่อ)
ผู้ใช้ฟ้องว่าภาพ "ภาพรวมทั้งระบบ" อ่านไม่ได้ (สูงเกิน ถูกตัด ซูม/แพนไม่ได้) → แก้ด้วย **dependency-free pan/zoom**:
- 🖱️ สกอลเมาส์ = ซูม (ยึดตำแหน่งเคอร์เซอร์) · ✋ ลาก = แพน (Pointer Events)
- 🔘 toolbar: `−` / `%` / `+` / `⤢(รีเซ็ต fit ความกว้าง)` · พื้นหลัง checkerboard
- เปิดมาครั้งแรก fit width อัตโนมัติ

**สถาปัตยกรรมโค้ด (REUSABLE — ใช้กับไฟล์ 2–5 ต่อ):**
- โครงสร้าง HTML ทุก diagram ใหญ่ = `.zoom-bar` (toolbar) + `.zoom-stage` (overflow:hidden, ความสูงคงที่ เช่น `70vh`) + `.zoom-canvas` (ครอบ `<pre class="mermaid">`)
- CSS ทั้งหมดอยู่ใน `<style>` ของไฟล์ 1 (class: `.zoom-stage` `.zoom-canvas` `.zoom-bar` `.zoom-pct` `.zoom-hint`)
- JS controller อยู่ใน `<script type="module">` เดียวกับ mermaid init — หลักการ: `mermaid.initialize({startOnLoad:false})` → `await mermaid.run()` → `document.querySelectorAll(".zoom-stage").forEach(initStage)`
- `initStage()` ทำ wheel-zoom + pointer-pan + ปุ่ม เอง; อ่านค่าจาก `canvas.firstElementChild.getBoundingClientRect()` ตอน transform ยังเป็น none
- ⚠ ไฟล์ 2–5 ต้อง **ก๊อปปี้ CSS + JS block ทั้งสอง** มาด้วย ไม่งั้น pan/zoom ไม่ทำงาน

---

## ⏭️ จุดที่จะต่อเซสชันใหม่ — สร้างแผนภาพไฟล์ 2–5 (ทำได้ทันที)
| ไฟล์ | ชื่อ | แหล่งความจริง | หมายเหตุ |
|---|---|---|---|
| ✅ 1 | High-Level Component | `src/` ทั้งระบบ | **เสร็จแล้ว** |
| ⬜ 2 | **Sequence** (จุดซับซ้อนสุด = sale/repair create) | `sale.ts:136-234` · `repair.ts:121-219` | transaction: validate stock → snapshot price/cost → create header+items → decrement stock |
| ⬜ 3 | Logical ER Diagram | `prisma/schema.prisma` | domain models + ความสัมพันธ์ |
| ⬜ 4 | System Architecture | Next.js App Router · tRPC · Clerk · Prisma Postgres · Vercel 2-env | ดู CLAUDE.md "Branch & Deployment" |
| ⬜ 5 | **Physical ERD (reverse-engineer)** | DB **dev** เท่านั้น | ดูคำแนะนำด้านล่าง |

**ชื่อไฟล์ที่ตกลง (footer ไฟล์ 1 ลิงก์ไว้หมดแล้ว):**
- `architecture-sequence-20260701.html`
- `architecture-er-logical-20260701.html`
- `architecture-system-20260701.html`
- `architecture-er-physical-20260701.html`

### ⚠️ ข้อควรระวังตอนทำ Physical ERD (ไฟล์ 5)
- **ห้ามแตะ DB production** — ใช้ DB **dev** เท่านั้น (`.env.local` ชี้ dev อยู่แล้ว)
- **ทางปลอดภัยที่สุด (ไม่ต่อ DB):** `schema.prisma` = source of truth อยู่แล้ว → `prisma-erd-generator` (`npm i -D prisma-erd-generator` + เพิ่ม generator ใน schema + `npx prisma generate`) สร้าง ERD ออกมา
- เช็ค drift กับ DB dev: `npx prisma db pull --print` (อ่านอย่างเดียว ปลอดภัย) เทียบกับ `schema.prisma`

### สไตล์เอกสาร (ให้คงเส้นคงตะวัน)
Tailwind CDN + Mermaid v11 (ESM) + ภาษาไทย + serif heading + สี slate. ทุก diagram ใหญ่ใส่ pan/zoom block. อ้างอิงโค้ดจริงทุกจุด — **ไม่ใช่สิ่งที่ควรจะเป็น**

---

## 🎯 Suggested skills (สำหรับแชทใหม่)
- **`excalidraw`** — ถ้าอยากได้ diagram ลายมือ (arch/flow/seq) เป็นทางเลือกแทน Mermaid ในบางไฟล์
- **`codebase-design`** — คำศัพท์ deep/shallow module ที่ใช้ใน architecture-review (อาจใช้ตอนวาด "ระบบที่ควรจะเป็น")
- **`handoff`** — ตอนจบเซสชัน สร้างไฟล์นี้ต่ออีกรอบ (skill บอกเขียนลง OS temp dir แต่ repo convention = ไฟล์นี้ ใช้ไฟล์นี้)

> ไม่จำเป็นต้องเรียก skill เพื่อทำไฟล์ 2–5 — ทำตรงได้เลย ส่วนใหญ่เป็น Mermaid + HTML

---

## 🗂️ งานค้าง (ยังไม่ commit ทั้งหมด — สะสม 3 ตอน)
**จากตอนที่ 1:** `CLAUDE.md` · `.gitignore` · `docs/matt-pocock-skills.html` · `docs/agents/{issue-tracker,triage-labels,domain}.md` · `CONTEXT.md` · `docs/journal/2026-07-01.md`
**จากตอนที่ 2:** `docs/architecture-review-20260701.html` · `docs/calculation-logic-20260701.html` · `docs/HANDOFF.md` (ตอนนั้น)
**จากตอนที่ 3 (ใหม่):** `docs/architecture-component-20260701.html` · `docs/HANDOFF.md` (ไฟล์นี้, เขียนทับ)
`.claude/skills/` (24+ skills) — local-only อยู่ใน .gitignore ไม่ commit

---

## 📚 เอกสารอ้างอิงสำคัญ (อ่านคู่กัน ห้ามทำซ้ำเนื้อหา)
- `CLAUDE.md` — กฎ/โฟลว์/env (โหลดอัตโนมัติ)
- `docs/architecture-component-20260701.html` — ไฟล์ 1 (เสร็จ) = ต้นแบบสไตล์ + pan/zoom
- `docs/architecture-review-20260701.html` — 6 candidate refactor + top recommendation
- `docs/calculation-logic-20260701.html` — สูตรคำนวณจริงทั้งระบบ + 8 จุดสังเกต (🐞 A–H)
- `prisma/schema.prisma` — source of truth ของ schema (10 models)

### ข้อมูลอ้างอิง
| | ค่า |
|---|---|
| GitHub repo | `konglife/repair-management-system` |
| Vercel team | `konglife's projects` (`team_raZ7DknFlxOMrqsM67VORqgw`) |
| Vercel projects | prod `repair-management-system` (`prj_Z40riTYpImEgsmtR9DfgSdyd3WJf` ↔ main) · dev `repair-management-system-dev` (`prj_LUp3k2fgydbKfhGQ7cAstdNxZY2l` ↔ develop) |
| commit ล่าสุด develop | `de03e2b` (นำ main 14, หลัง 0) |
| commit ล่าสุด main/prod | `d95d433` |
| Co-author email | `claude <81847+claude@users.noreply.github.com>` |

---

## 📌 ค้างรอการตัดสินใจ (ยังเหมือนเดิม + ของใหม่)
- **commit งานค้างทั้งหมด** — ผู้ใช้ยังไม่สั่ง (docs + 3 HTML + CLAUDE.md edits)
- **pan/zoom** — ผู้ใช้ยังไม่ได้ยืนยันว่าทำงานถูกใจหลังเปิดดูไฟล์ 1 → ถ้าต้องแก้ ให้แก้ในไฟล์ 1 ก่อนแล้วค่อย copy ไป 2–5
- **prod ค้าง deploy 6 เดือน** — วางแผน release (merge develop → main) ระวัง develop นำ 14 commit
- **Repair model** — เมื่อไหร่จะเพิ่ม field "ค่าบริการ/ราคา" แยกจากต้นทุนจริง (resolve คำถามเปิดใน CONTEXT.md)
