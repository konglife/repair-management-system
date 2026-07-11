# Architecture

> **Snapshot วันที่ 2026-07-04** — ไฟล์ reference นี้สะท้อนสถานะโค้ด ณ วันที่สร้าง
> หากมีการเปลี่ยนแปลงโครงสร้างครั้งใหญ่ ควรอัปเดตไฟล์นี้
> การตัดสินใจเชิงสถาปัตยกรรม (ที่ hard-to-reverse) บันทึกแยกที่ `docs/adr/` (สร้าง lazy)

## ภาพรวม

ระบบจัดการงานซ่อมร้านมอไซค์/เครื่องตัดหญ้า สร้างด้วย **T3 Stack** (Next.js App Router + tRPC + Prisma) เป็น single-user application ที่ **ใช้งานจริงใน production แล้ว**

```
Browser ── Clerk Auth ──> Next.js (App Router)
                              │
                              ├── Server Components / Client Components (React)
                              ├── tRPC Client (type-safe API calls)
                              │
                              ▼
                         tRPC Server (api/trpc/[...trpc])
                              │
                              ├── protectedProcedure (ตรวจ auth ผ่าน Clerk)
                              └── Prisma Client
                                      │
                                      ▼
                              Prisma Postgres (Vercel)
```

## Tech Stack

| ชั้น | เทคโนโลยี | บทบาท |
|---|---|---|
| Framework | Next.js 15.4 (App Router) | full-stack framework |
| Language | TypeScript 5 (strict) | type-safety ตลอดทั้ง stack |
| API | tRPC 11.4 | type-safe API ไม่ต้อง codegen |
| ORM | Prisma 6.14 | เข้าถึงฐานข้อมูล + migration |
| Database | Prisma Postgres (Vercel) | managed PostgreSQL |
| Auth | Clerk | middleware + provider, ผูก user directory เดียว |
| UI | Shadcn/ui + Tailwind CSS 4 | component library + styling |
| State | React Hooks + React Query (via tRPC) | client state + cache |
| Testing | Jest + React Testing Library | unit/integration |
| Icons | Lucide | icon set |

## โครงสร้างโฟลเดอร์หลัก

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # กลุ่มหน้า sign-in / sign-up
│   ├── (main)/                   # กลุ่มหน้าหลัก (ต้องล็อกอิน)
│   │   ├── dashboard/            # ภาพรวมธุรกิจ
│   │   ├── stock/                # จัดการสินค้า/หมวด/หน่วย
│   │   ├── sales/                # งานขาย (+ [id] detail)
│   │   ├── repairs/              # งานซ่อม (+ [id] detail)
│   │   ├── customers/            # ลูกค้า (+ [id] detail/history)
│   │   ├── reports/              # รายงาน + /summary
│   │   └── settings/             # ตั้งค่าร้าน (BusinessProfile)
│   ├── api/trpc/[...trpc]/       # tRPC endpoint เดียวทั้งระบบ
│   └── layout.tsx                # root layout (ClerkProvider)
├── components/
│   ├── ui/                       # Shadcn/ui primitives
│   ├── layout/                   # MainLayout / Sidebar / Header
│   ├── dashboard/                # การ์ด/กราฟ dashboard
│   ├── charts/                   # กราฟแนวโน้ม
│   └── reports/                  # คอมโพเนนต์รายงาน
└── server/api/
    ├── root.ts                   # appRouter: รวม 10 routers
    ├── trpc.ts                   # context, publicProcedure, protectedProcedure
    └── routers/                  # 1 router ต่อ domain (10 ตัว)
```

## API Architecture (tRPC)

- **Endpoint เดียว**: `/api/trpc/[...trpc]` — ทุกการเรียกผ่านจุดนี้
- **10 routers** (ดู `src/server/api/root.ts`):
  `categories` · `units` · `products` · `purchases` · `customers` · `sales` · `repairs` · `dashboard` · `settings` · `reports`
- **2 ประเภท procedure** (ดู `src/server/api/trpc.ts`):
  - `publicProcedure` — ไม่ตรวจ auth (ปัจจุบันมีแค่ `reports.getMonthlySummary`)
  - `protectedProcedure` — ตรวจ `ctx.auth.userId` โยน `UNAUTHORIZED` ถ้าไม่ล็อกอิน (ใช้กับ router อื่นทั้งหมด)
- **Context**: สร้างทุก request, inject `db` (Prisma) + `auth` (Clerk)
- **superjson transformer**: serialize ประเภทข้อมูลเช่น `Date` ข้าม wire
- รายละเอียดแต่ละ procedure → `docs/API-DOCS.md`

## Authentication

- **Clerk** จัดการ session ทั้งหมด: middleware + `ClerkProvider` ใน root layout
- สาขา production และ dev ใช้ Clerk `live_` keys **ชุดเดียวกัน** (single-user app → user directory ชุดเดียว)
- การป้องกันแบ่ง 2 ชั้น:
  1. **ชั้นหน้า** (route): middleware ของ Clerk + route group `(main)` บังคับล็อกอิน
  2. **ชั้น API**: `protectedProcedure` ตรวจอีกชั้น (defense-in-depth)

> ⚠️ `reports.getMonthlySummary` ยังเป็น `publicProcedure` — ไม่ได้รับการป้องกันชั้น API (รอแก้)

## Business Logic ที่สำคัญ

| Logic | ที่อยู่ | คำอธิบาย |
|---|---|---|
| ต้นทุนเฉลี่ยถ่วงน้ำหนัก | `purchases.create` | `(qtyเดิม×costเดิม + qtyใหม่×costใหม่)/(qtyรวม)` |
| หักสต็อกอัตโนมัติ | `sales.create` / `repairs.create` | ลด `Product.quantity` ใน transaction |
| ตรวจสต็อกก่อนขาย/ซ่อม | `sales`/`repairs.create` | โยน `BAD_REQUEST` ถ้าขอไม่พอ |
| คำนวณกำไร | `sales`/`dashboard` | `กำไร = รายได้ − ต้นทุน` |
| Transaction safety | mutation ทุกตัว | ใช้ `db.$transaction` ให้ atomic |

## Deployment & Environments

> **สำคัญ**: ดูกฎเหล็กทั้งหมดใน `CLAUDE.md` (ห้าม push main, ห้ามแตะ DB prod)

### สถาปัตยกรรม 2 environments (แยกขาด)

| สาขา | Vercel Project | บทบาท | Database |
|---|---|---|---|
| `main` | `repair-management-system` | **production** (ใช้จริงที่ร้าน) 🔒 | Prisma Postgres **prod** |
| `develop` | `repair-management-system-dev` | preview / dev | Prisma Postgres **dev** (คนละ instance) |

### CI/CD — ความเป็นจริง

- **ไม่มี GitHub Actions** (ไม่มี `.github/workflows/`)
- "CI/CD" ของระบบนี้ = **Vercel git integration auto-deploy** เท่านั้น:
  - push → `main` → deploy production อัตโนมัติ
  - push → `develop` → deploy preview อัตโนมัติ
- แยก DB (prod ≠ dev) คือกำแพงนิรภัยหลัก: พัง/ลบผิดบน develop ข้อมูลจริงไม่โดน

### แหล่งที่มาของ env

- **Vercel = source of truth** — env จริงอยู่บน Vercel (แยก 2 project)
- ไฟล์ในเครื่องเป็น "สำเนา" สำหรับรัน local: `.env.local` (ชี้ DB dev เท่านั้น)
- sync ด้วย `vercel env pull .env.local --environment production` (ใช้ด้วยความระมัดระวัง)

## Cross-references

- โครงสร้างข้อมูล → `docs/DATABASE.md`
- รายละเอียด API → `docs/API-DOCS.md`
- หน้า/คอมโพเนนต์ → `docs/UI-UX-SPECIFICATION.md`
- คำศัพท์ domain → `CONTEXT.md`
- กฎ/โฟลว์/env → `CLAUDE.md`
