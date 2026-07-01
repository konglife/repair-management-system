# Handoff — เซสชัน 2026-06-16

> ไฟล์นี้ใช้ส่งต่องานไปแชทใหม่ (วันถัดไป) — อ่านไฟล์นี้ก่อนเริ่มงาน
> กฎ/โฟลว์/env ทั้งหมดอยู่ใน `CLAUDE.md` อยู่แล้ว (จะโหลดอัตโนมัติ) ไฟล์นี้โฟกัสที่ **ความคืบหน้า + จุดที่จะต่อ**

---

## 📍 สถานะตอนจบเซสชัน
- **สาขา:** `develop` = `origin/develop` = commit `a88eacf` — สะอาด, sync กัน
- **Working tree:** สะอาด (ไฟล์ HTML ที่สร้างวันนี้ถูกผู้ใช้ย้ายไปอ่านเองที่อื่น ไม่ได้อยู่ใน repo — และไม่เคยถูก commit จึงไม่มีผลกับ git)
- **`main`:** ล็อคไว้ (production) — **ห้ามแตะ** จนกว่าจะ release จริง
- **ความสัมพันธ์สาขา:** `develop ⊇ main` — develop นำ main **13 commit**, **0 behind** (จัดระเบียบแล้ววันนี้)

---

## ✅ สิ่งที่ทำเสร็จในเซสชันนี้
1. **เคลียร์งานเสริมค้างจากเมื่อวาน (ครบ):**
   - `.gitattributes` (`* text=auto eol=lf`) — แก้ line-ending noise (CRLF/LF) ถาวร
   - `.env.example` (template 10 ตัวแปร ไม่มี secret) + carve-out `!.env.example` ใน `.gitignore`
   - commit `86b6f93` → FF merge เข้า `develop` → push (ทาง A: push ตรง)
2. **ไข + จัดการ "1 commit behind main":**
   - พิสูจน์ด้วย `git diff` ว่าเป็น merge node (`d95d433`, PR #2) ไม่มีเนื้อหาไฟล์หายจริง
   - `git merge origin/main` ใน develop → commit `a88eacf` → **0 behind**, 12 commit เดิมอยู่ครบ (รวมเป็น 13)
3. **อธิบาย Git/GitHub Flow ให้ dev มือใหม่:** push vs PR · แยก commit · GitHub Flow 7 ขั้น · แบนเนอร์เขียว (ห้ามคลิก = merge เข้า main) · แนวคิด `develop ⊇ main` (ไม่ใช่ ==)
4. **สร้างหน้า HTML เรียนรู้ interactive** (`git-github-flow.html`) แล้ว redesign ด้วย skill `frontend-design` (แนว "PHOSPHOR // FIELD MANUAL") — **ผู้ใช้ย้ายไปเก็บอ่านเองที่อื่นแล้ว**
5. **อธิบาย plugin vs skill ของ Claude Code** (ทั้งสอง: `frontend-design` คือ skill ใน plugin ชื่อเดียวกัน จาก marketplace `claude-plugins-official`)

---

## 🎯 กฎ/การตัดสินใจสำคัญ (สรุป — รายละเอียดใน CLAUDE.md)
| ข้อ | การตัดสินใจ |
|---|---|
| `main` / DB production | 🔒 ห้ามแตะ จนกว่าจะ release จริง |
| Workflow | feature branch แตกจาก `develop` |
| push ตรง vs PR | งานเล็ก/ปลอดภัย/คนเดียว → **push ตรง (ทาง A)** · โค้ดลอจิก/อยากตรวจ → **PR (ทาง B)** |
| Co-author email | `claude <81847+claude@users.noreply.github.com>` |
| Env local | `.env.local` อย่างเดียว (DB dev); **Vercel = source of truth** |
| Clerk keys | dev กับ prod ใช้ `live_` ชุดเดียวกัน (ตั้งใจ) |
| line-ending | บังคับ LF ผ่าน `.gitattributes` (อย่าใช้ `core.autocrlf` อย่างเดียว) |

---

## ⏭️ จุดที่จะต่อพรุ่งนี้ (งานค้าง — สำคัญ)
> ⚠️ **ยังไม่ได้เริ่มพัฒนาจริง (วันที่ 2 ติด!)** — ทั้ง 2 วันโฟกัสเก็บกวาด/เตรียมพร้อม/สอนทำความเข้าใจ ยังไม่มี feature ใหม่เข้าไป
> พรุ่งนี้ควรเริ่มจาก **ของจริง** แล้ว

### ลำดับแนะนำ
1. **สำรวจโค้ดปัจจุบัน (read-only)** — ดูว่าพัฒนาไปถึงไหน: หน้า/ฟีเจอร์ที่มี, โมเดล, สิ่งที่ค้าง → รายงานภาพรวม
2. จากนั้นคุยกัน **ตั้งเป้าหมายรอบนี้** จากของจริง (เพิ่มฟีเจอร์ / แก้ปัญหาที่เจอตอนใช้จริง)
3. เริ่มทำบน **feature branch** ใหม่ตามโฟลว์ (เลือกทาง A หรือ B ตามขนาดงาน)

### งานเสริม (ถ้าทำเสร็จ + ยังมีเวลา)
- (เมื่อวานทำครบแล้ว) `.env.example` + `.gitattributes` — **เสร็จแล้ว**
- ตอนนี้ไม่มีงานเสริมค้างชัดเจน — โฟกัสเริ่มพัฒนาจริง

---

## 🔧 ข้อมูลอ้างอิงสำคัญ
| | ค่า |
|---|---|
| GitHub repo | `konglife/repair-management-system` |
| Git identity | `KAINGKAI JEAMRA <78691126+konglife@users.noreply.github.com>` |
| Vercel projects | `repair-management-system` (prod/main), `repair-management-system-dev` (dev/develop) |
| Database | Prisma Postgres (Vercel) — แยก prod/dev |
| Vercel CLI link | เชื่อมกับ **dev project** (`repo.json` ใน `.vercel/`) |
| commit ล่าสุด develop | `a88eacf` (develop ⊇ main, 13 ahead, 0 behind) |
| Memory | `commit-co-author-claude-contributor.md` (จด co-author email ไว้) |

---

## 🚀 วิธีเริ่มพรุ่งนี้ (suggested)
```
1. เปิดแชทใหม่ในโปรเจ็กต์เดียวกัน (CLAUDE.md + memory โหลดอัตโนมัติ)
2. บอกผม: "อ่าน docs/HANDOFF.md แล้วสำรวจโค้ดปัจจุบันให้หน่อย"
3. ผมจะรายงานภาพรวม → ค่อยตั้งเป้าหมายรอบนี้ด้วยกัน
```

> หมายเหตุ: Claude จะขึ้น sidebar **Contributors** หลัง release ถัดไป (merge develop → main) — ตอนนี้ขึ้นแค่ระดับ commit (avatar คู่กับ konglife) ซึ่งถูกต้องแล้ว
