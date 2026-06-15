# Handoff — เซสชัน 2026-06-15

> ไฟล์นี้ใช้ส่งต่องานไปแชทใหม่ (วันถัดไป) — อ่านไฟล์นี้ก่อนเริ่มงาน
> กฎ/โฟลว์/env ทั้งหมดอยู่ใน `CLAUDE.md` อยู่แล้ว (จะโหลดอัตโนมัติ) ไฟล์นี้โฟกัสที่ **ความคืบหน้า + จุดที่จะต่อ**

---

## 📍 สถานะตอนจบเซสชัน
- **สาขา:** `develop` (= `origin/develop` = commit `ccf5a7d`) — สะอาด, sync กัน
- **Working tree:** สะอาด (ไม่มีไฟล์ค้าง)
- **`main`:** ล็อคไว้ (production ที่ร้านใช้จริง) — **ห้ามแตะ** จนกว่าจะ release จริง
- **สาขา feature:** ใช้ครบรอบและลบหมดแล้ว (ทดสอบ workflow ผ่าน)

---

## ✅ สิ่งที่ทำเสร็จในเซสชันนี้ (เก็บกวาด + เตรียมพร้อม)
1. Sync `develop` + ดึง CVE fix (next 15.4.10) + push
2. **เก็บกวาด bmad-method ทั้งหมด** (ลบ `.bmad-core/`, `web-bundles/`, `.claude/`, `.gemini/`, `AGENTS.md` + แก้ `.gitignore`)
3. **อัปเดต CLAUDE.md** ให้ถูกต้อง: Prisma Postgres (ไม่ใช่ NeonDB), โมเดลจริง 10 ตัว (ไม่ใช่ "Planned"), Clerk configured (ไม่ใช่ "to be implemented") + เพิ่มกฎ/โฟลว์/env/commit conventions
4. **ติดตั้ง Vercel CLI** (v54.14.0, login = konglife) + Vercel MCP เชื่อมแล้ว
5. **ตรวจสอบการแยก DB:** prod ≠ dev ยืนยันแล้ว (hash ต่างกัน) — ข้อมูล production ปลอดภัย
6. **จัดระเบียบ env:** `.env.local` สะอาด (10 ตัวแปร app, 0 ขยะระบบ), ลบ `.env.production.local` (เครื่อง local แตะแค่ DB dev)
7. **ตั้งค่า claude contributor attribution:** ใช้ `Co-Authored-By: claude <81847+claude@users.noreply.github.com>` — ยืนยันแล้วว่า avatar claude ขึ้นคู่กับ konglife บนหน้า commit
8. **ทดสอบ feature branch workflow** ครบรอบ: branch → commit → push → merge (fast-forward) → cleanup

---

## 🎯 กฎ/การตัดสินใจสำคัญ (สรุป — รายละเอียดใน CLAUDE.md)
| ข้อ | การตัดสินใจ |
|---|---|
| `main` / DB production | 🔒 ห้ามแตะ จนกว่าจะ release จริง |
| Workflow รอบนี้ | ใช้ **feature branch** แตกจาก `develop` |
| Co-author email | `claude <81847+claude@users.noreply.github.com>` (บันใน memory + CLAUDE.md) |
| Env local | `.env.local` อย่างเดียว (DB dev); **Vercel = source of truth** |
| Clerk keys | dev กับ prod ใช้ `live_` ชุดเดียวกัน (ตั้งใจ) |

---

## ⏭️ จุดที่จะต่อพรุ่งนี้ (งานค้าง)
**ยังไม่ได้เริ่มพัฒนาจริง** — เซสชันนี้โฟกัสเก็บกวาด/เตรียมพร้อมหมด พรุ่งนี้เริ่มตั้งเป้าหมายรอบนี้

### ลำดับแนะนำ
1. **สำรวจโค้ดปัจจุบัน** (read-only) — ดูว่าพัฒนาไปถึงไหน: หน้า/ฟีเจอร์ที่มี, โมเดล, สิ่งที่ค้าง → รายงานภาพรวม
2. จากนั้นคุยกัน **ตั้งเป้าหมายรอบนี้** จากของจริง (เพิ่มฟีเจอร์ / แก้ปัญหาที่เจอตอนใช้จริง / อื่นๆ)
3. เริ่มทำบน **feature branch** ใหม่ตามโฟลว์

### งานเสริม (ถ้าอยากทำ)
- สร้าง `.env.example` (document vars, ไม่มี secret) — ยังไม่ได้ทำ
- เพิ่ม `.gitattributes` (`* text=auto`) แก้ปัญหา line-ending noise ถาวร (ตอนนี้แก้ด้วย discard ไปก่อน)

---

## 🔧 ข้อมูลอ้างอิงสำคัญ
| | ค่า |
|---|---|
| GitHub repo | `konglife/repair-management-system` |
| Git identity | `KAINGKAI JEAMRA <78691126+konglife@users.noreply.github.com>` (noreply ไม่ใช่เมลจริง) |
| Vercel projects | `repair-management-system` (prod/main), `repair-management-system-dev` (dev/develop) |
| Database | Prisma Postgres (Vercel) — แยก prod/dev |
| Vercel CLI link | เชื่อมกับ **dev project** (`repo.json` ใน `.vercel/`) |
| Memory | `commit-co-author-claude-contributor.md` (จด co-author email ไว้) |

---

## 🚀 วิธีเริ่มพรุ่งนี้ (suggested)
```
1. เปิดแชทใหม่ในโปรเจ็กต์เดียวกัน (CLAUDE.md + memory โหลดอัตโนมัติ)
2. บอกผม: "อ่าน docs/HANDOFF.md แล้วสำรวจโค้ดปัจจุบันให้หน่อย"
3. ผมจะรายงานภาพรวม → ค่อยตั้งเป้าหมายรอบนี้ด้วยกัน
```

> หมายเหตุ: Claude จะขึ้น sidebar **Contributors** หลัง release ถัดไป (merge develop → main) — ตอนนี้ขึ้นแค่ระดับ commit (avatar คู่กับ konglife) ซึ่งถูกต้องแล้ว
