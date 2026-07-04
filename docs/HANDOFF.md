# Handoff — เริ่ม Matt Pocock flow จากกระดาษเปล่า

> ไฟล์นี้ใช้ส่งต่อบริบทไปแชทใหม่ — **อ่านก่อนเริ่มงาน**
> กฎ/โฟลว์/env ทั้งหมดอยู่ใน `CLAUDE.md` ไฟล์นี้โฟกัสที่ **เป้าหมาย + สถานะ + ขั้นถัดไป**

---

## 🎯 เป้าหมายของแชทใหม่

**เริ่มใช้ Matt Pocock skills อย่างเป็นระบบเพื่อปรับปรุง/พัฒนาโปรเจ็กต์นี้ โดยเริ่มจากกระดาษเปล่า**

ผู้ใช้เลือกแนวทาง "ล้างเอกสาร domain ที่มี แล้วเริ่ม Matt flow ใหม่" — คือให้ flow สร้างเอกสาร (CONTEXT.md / ADR / PRD) ขึ้นมาเองจากการสนทนา ไม่ใช่เตรียมไว้ก่อน

## ⚠️ กฎเหล็ก (ห้ามละเลย — อยู่ใน CLAUDE.md ด้วย)

1. **ห้าม push/merge ไป `main`** (production ใช้จริงที่ร้าน) เว้นแต่ผู้ใช้สั่ง release เอง
2. **ห้ามแตะฐานข้อมูล production** — ใช้ DB dev เท่านั้น (`.env.local` ชี้ dev อยู่แล้ว)
3. ทำงานบน `develop` หรือสาขาย่อยจาก `develop` เท่านั้น
4. ทุก push/deploy/migration ที่มีผลกระทบ → **บอกผู้ใช้ก่อนทุกครั้ง**

> มี git guardrail hook (`.claude/hooks/block-dangerous-git.sh`) บล็อก `git push` ไป main/master + reset --hard/clean/branch -D อยู่แล้ว (local-only ไม่ได้ commit)

---

## 📍 สถานะตอนจบเซสชันนี้

- **สาขา:** `develop`
- **commit ล่าสุด:** `9f8bf4b` — "docs: baseline เอกสารรอบโปรเจ็กต์ + คู่มือ agent skills" (commit local ยังไม่ push)
- **Working tree (ยังไม่ commit):**
  - `D CONTEXT.md` ← **ลบทิ้งโดยเจตนา** (จะให้ Matt flow สร้างใหม่)
  - `D docs/agents/{domain,issue-tracker,triage-labels}.md` ← **ลบทิ้งโดยเจตนา** (จะให้ `/setup-matt-pocock-skills` สร้างใหม่)
  - `M docs/HANDOFF.md` ← ไฟล์นี้ (ฉบับส่งต่อใหม่)
  - `?? .claude/` ← local-only (hooks/guardrails/skills) **ห้าม commit**

### ⚠️ สิ่งที่ต้องรู้เรื่องการลบ
- `CONTEXT.md` และ `docs/agents/` **ถูกลบทิ้ง**ตามคำสั่งผู้ใช้ เพื่อเริ่ Matt flow จากกระดาษเปล่า
- **`CLAUDE.md` ยังมี reference ไป `docs/agents/*` และ `CONTEXT.md` อยู่** (sections: Issue tracker / Triage labels / Domain docs) → พอลบไฟล์แล้วเป็น dangling reference
- วิธี reconcile: รัน `/setup-matt-pocock-skills` ในแชทใหม่ → มันจะสร้าง `docs/agents/` ใหม่ + reconcile CLAUDE.md (skill ออกแบบให้ idempotent)

---

## ⏭️ ขั้นถัดไปในแชทใหม่ (ทำตามลำดับ)

1. **อ่าน `CLAUDE.md`** ครบ (กฎ/โฟลว์/env/สถาปัตยกรรม) — โหลดอัตโนมัติอยู่แล้ว
2. **รัน `/setup-matt-pocock-skills`** เพื่อสร้าง `docs/agents/` ใหม่ + reconcile CLAUDE.md
   - issue tracker = **GitHub Issues** (`konglife/repair-management-system`, ใช้ `gh` CLI)
   - PRs เป็น request surface = **no** (single-user app)
   - triage labels = default (ชื่อ role)
   - domain docs = **single-context** (`CONTEXT.md` ที่ root)
3. **เริ่มสนทนาว่าจะปรับปรุง/สร้างอะไร** ผ่าน **`/grill-with-docs`**
   - skill นี้จะดึง `/grilling` + `/domain-modeling` มาสัมภาษณ์ไล่คำถาม + สร้าง `CONTEXT.md` ใหม่จากผลสนทนา
   - **อย่าเพิ่งเขียนโค้ด** — ขั้นนี้คือการลับแผนให้คม
4. พอแผนชัด → **`/to-prd`** (สรุปเป็น PRD → publish GitHub issue) → **`/to-issues`** (แบ่งเป็น vertical slices)
5. แต่ละ issue → เปิดเซสชันใหม่ + **`/implement`** (ขับ `/tdd`) → **`/code-review`**

> ไม่แน่ใจใช้ skill ไหน → รัน **`/ask-matt`** (router ชี้ flow)

---

## 🧭 โฟลว์ dev หลักของ Matt (idea → ship)

```
/grill-with-docs  →  /to-prd  →  /to-issues
                                   ↓ แต่ละ issue เปิดเซสชันใหม่
                            /implement (→/tdd) → /code-review → /handoff
```
on-ramps (เข้ามารวม flow): บั๊ก/request ภายนอก → `/triage` · ของพังดื้อ → `/diagnosing-bugs` · ปรับสถาปัตยกรรม → `/improve-codebase-architecture`

แผนที่ skill ทั้ง 24 ตัว + dependency map อยู่ที่ **`docs/matt-pocock-skills.html`** (เปิดในเบราว์เซอร์)

## 🗂️ เอกสาร domain (สถานะหลังล้าง)
- `CONTEXT.md` — ❌ ถูกลบ → จะถูกสร้างใหม่โดย `/domain-modeling` ตอน `/grill-with-docs`
- `docs/agents/*` — ❌ ถูกลบ → จะถูกสร้างใหม่โดย `/setup-matt-pocock-skills`
- `docs/adr/` — ไม่เคยมี → สร้าง lazy ตอนมี decision จริงใน grill
- `docs/matt-pocock-skills.html` — ✅ มี (แผนที่ skill 24 ตัว)

---

## 📚 ข้อมูลอ้างอิง
| | ค่า |
|---|---|
| GitHub repo | `konglife/repair-management-system` |
| Vercel team | `konglife's projects` (`team_raZ7DknFlxOMrqsM67VORqgw`) |
| Vercel projects | prod `repair-management-system` (`prj_Z40riTYpImEgsmtR9DfgSdyd3WJf` ↔ main) · dev `repair-management-system-dev` (`prj_LUp3k2fgydbKfhGQ7cAstdNxZY2l` ↔ develop) |
| commit ล่าสุด develop | `9f8bf4b` (local, ยังไม่ push — นำ origin 1) |
| commit ล่าสุด main/prod | `d95d433` |
| Co-author email | `claude <81847+claude@users.noreply.github.com>` |

## 📌 ค้างรอการตัดสินใจ (สำหรับแชทใหม่)
- **commit การลบ CONTEXT.md/agents หรือยังไม่ commit?** — working tree ตอนนี้มี deletion ค้างไว้ ผู้ใช้ยังไม่สั่ง commit
- **prod ค้าง deploy 6 เดือน** — develop นำ main ~15 commit ต้องวางแผน release ระวัง
- **Repair model** — ยังไม่มี field "ค่าบริการ/ราคา" แยกจากต้นทุนจริง (totalCost = ค่าซ่อมรวมที่ผู้ใช้ป้อน)
- **บั๊กที่รู้แล้ว** (รอ triage): `reports.getMonthlySummary` = publicProcedure (auth รั่ว) · `repair.laborCost` ติดลบได้ · เงินเก็บเป็น Float
