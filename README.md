# Repair Management System (ระบบจัดการงานซ่อม) By Konlife

ระบบจัดการงานซ่อมสำหรับร้านซ่อมมอไซค์และเครื่องตัดหญ้าขนาดเล็ก ช่วยบริหารสต็อกสินค้า, การขาย, การซ่อม, และข้อมูลลูกค้า พร้อมสรุปรายงานเพื่อการวิเคราะห์ ทดแทนการจดบัญชีมือ ปัจจุบัน **ใช้งานจริงใน production แล้ว**

> 👤 ออกแบบสำหรับ **single-user** (เจ้าของร้านคนเดียว)

## ✨ Features (คุณสมบัติหลัก)

- **Dashboard:** ภาพรวมธุรกิจ, สินค้าใกล้หมด, และกิจกรรมล่าสุด
- **Stock Management:** จัดการสินค้า, หมวดหมู่, หน่วยนับ + ประวัติรับสินค้าเข้า (คำนวณต้นทุนเฉลี่ย)
- **Sales:** บันทึกงานขาย + ดูประวัติ (optimistic UI ไม่ต้อง reload)
- **Repairs:** บันทึกงานซ่อม + อะไหล่ที่ใช้ + ดูประวัติ
- **Customer Management:** ข้อมูลลูกค้า + ประวัติธุรกรรม
- **Reports:** สรุปยอดขาย/ต้นทุน/กำไรรายเดือน พร้อมโลโก้ร้าน
- **User Authentication:** ระบบล็อกอินปลอดภัยด้วย Clerk

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **API:** tRPC 11
- **Database:** Prisma Postgres (Vercel) + Prisma ORM 6
- **Authentication:** Clerk
- **Styling:** Tailwind CSS 4 + Shadcn/ui
- **Testing:** Jest + React Testing Library

## 🚀 Getting Started

### Prerequisites
- Node.js v22+
- npm
- PostgreSQL (หรือ Prisma Postgres บน Vercel)

### Installation
```bash
git clone https://github.com/konglife/repair-management-system.git
cd repair-management-system
npm install
```

### Environment
สร้าง `.env.local` (ดู `.env.example`):
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

> 💡 วิธี sync env จาก Vercel (source of truth): `vercel env pull .env.local --environment production` — แต่ระวัง ใช้เฉพาะตอนจำเป็น แล้วลบทิ้ง

### Database & Run
```bash
npx prisma migrate dev    # สร้าง/apply migration (dev เท่านั้น)
npm run dev               # http://localhost:3000
```

## 📜 Available Scripts

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | build production |
| `npm run start` | รัน production server |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |
| `npm run test:watch` | test watch mode |
| `npx prisma studio` | DB GUI |

## 🌿 Branch & Deployment

| สาขา | Vercel Project | บทบาท | Database |
|---|---|---|---|
| `main` | `repair-management-system` | **production** 🔒 | Prisma Postgres **prod** |
| `develop` | `repair-management-system-dev` | preview / dev | Prisma Postgres **dev** |

- push → `main` → deploy production อัตโนมัติ
- push → `develop` → deploy preview อัตโนมัติ
- **กฎเหล็ก:** ทำงานบน `develop`/สาขาย่อย เท่านั้น ห้าม push `main` / แตะ DB prod โดยไม่ได้รับอนุญาต (ดู `CLAUDE.md`)

## 🔗 Live
- Production: deploy อัตโนมัติทุกครั้งที่ merge ไป `main`

---

## 🧠 Matt Pocock Skills Flow

โปรเจ็กต์นี้ใช้ **[Matt Pocock's skills](https://github.com/mattpocock/skills)** (24 skills) เก็บไว้ที่ `.claude/skills/` (**เฉพาะเครื่อง** — ไม่ commit, อยู่ใน `.gitignore`) เพื่อขับเคลื่อนการพัฒนาอย่างเป็นระบบ

### โฟลว์หลัก (idea → ship)

```
/grill-with-docs  →  /to-prd  →  /to-issues
                                   ↓ แต่ละ issue เปิดเซสชันใหม่
                            /implement (→/tdd) → /code-review → /handoff
```

| ขั้น | Skill | ทำอะไร |
|---|---|---|
| ลับแผน | `/grill-with-docs` | สัมภาษณ์ไล่คำถาม + สร้าง `CONTEXT.md` (glossary) |
| สรุปเป็น PRD | `/to-prd` | แปลงแผนเป็น PRD → publish GitHub Issue |
| แบ่งเป็นชิ้น | `/to-issues` | แบ่ง PRD เป็น vertical slices |
| สร้าง | `/implement` | ขับเคลื่อนด้วย `/tdd` (test-first) |
| ตรวจ | `/code-review` | review ตามมาตรฐาน + spec |
| ส่งต่อ | `/handoff` | ส่งต่องานไปแชทใหม่ |

### on-ramps (เข้ามารวม flow)
- บั๊ก/request ภายนอก → `/triage`
- ของพังดื้อๆ → `/diagnosing-bugs`
- ปรับสถาปัตยกรรม → `/improve-codebase-architecture`

### เอกสารที่ flow นี้ใช้/สร้าง
- `CONTEXT.md` — คำศัพท์ domain (glossary) สร้าง lazy จากการ grill
- `docs/adr/` — บันทึกการตัดสินใจเชิงสถาปัตยกรรม (สร้างเฉพาะตอน decision แข็งตัว)
- `docs/agents/` — config สำหรับ skill (issue tracker / triage labels / domain layout)
- ไม่แน่ใจใช้ skill ไหน → `/ask-matt` (router ชี้ flow)

> แผนที่ skill ทั้ง 24 ตัว: `docs/matt-pocock-skills.html` (เปิดในเบราว์เซอร์)
> รายละเอียด: `.claude/skills/README.md`

---

## 📚 Documentation

| ไฟล์ | เนื้อหา |
|---|---|
| `CLAUDE.md` | กฎ/โฟลว์/env/สถาปัตยกรรม (อ่านก่อนทำงานทุกเซสชัน) |
| `CONTEXT.md` | คำศัพท์ domain (glossary) |
| `docs/ARCHITECTURE.md` | ภาพรวมสถาปัตยกรรม + deployment |
| `docs/DATABASE.md` | ER + โมเดลข้อมูล |
| `docs/API-DOCS.md` | tRPC routers/procedures |
| `docs/UI-UX-SPECIFICATION.md` | หน้า/คอมโพเนนต์ |
| `docs/HANDOFF.md` | ส่งต่องานไปแชทใหม่ |
| `docs/journal/` | บันทึกประจำวันของ Claude |
| `CHANGELOG.md` | ประวัติการเปลี่ยนแปลง |
| `docs_archive/` | เอกสารรุ่นเก่า (MVP → 2.3.0) เก็บอ้างอิง **ห้ามแก้** |
