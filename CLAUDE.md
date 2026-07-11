# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a repair shop back-office management system built as a modern full-stack Next.js application using the T3 Stack. The system manages products, customers, sales, repairs, and provides business intelligence dashboards for a single-user repair shop environment.

**production (สาขา `main`) ใช้งานจริงที่ร้านอยู่แล้ว** — ระวังการเปลี่ยนแปลงใดๆ ที่อาจกระทบข้อมูลจริง (ดู "Branch & Deployment Strategy" ด้านล่าง)

## Development Commands

### Essential Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code quality checks
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode

### Database Commands (Prisma)

- `npx prisma migrate dev` - Create and apply database migrations (dev only)
- `npx prisma studio` - Open Prisma Studio database GUI
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma db push` - Push schema changes to database (dev only)

### Vercel Commands (CLI)

- `vercel env pull .env.local --environment production` - Sync env จาก project ที่ link อยู่ลงเครื่อง (source of truth = Vercel)
- `vercel env ls` - ดูรายชื่อ env vars ของ project ที่ link อยู่
- `vercel link --project <name> --yes` - สลับ project ที่ link (repo นี้ link กับ dev project โดย default)

## Branch & Deployment Strategy

> ส่วนนี้คือกฎเหล็กของโปรเจ็กต์ — ปฏิบัติเคร่งครัดเพื่อปกป้องข้อมูล production ที่ร้าน

### สถาปัตยกรรม 2 environments (แยกขาดจากกัน)

| สาขา      | Vercel Project                 | บทบาท                              | Database                                |
| --------- | ------------------------------ | ---------------------------------- | --------------------------------------- |
| `main`    | `repair-management-system`     | **production** (ใช้จริงที่ร้าน) 🔒 | Prisma Postgres **prod**                |
| `develop` | `repair-management-system-dev` | preview / dev                      | Prisma Postgres **dev** (คนละ instance) |

Vercel แต่ละ project deploy อัตโนมัติเมื่อ push ไปยังสาขาที่เชื่อม (main → prod, develop → dev)

### 🚫 กฎเหล็ก (Hard Rules)

1. **ห้าม push/merge ไป `main` เด็ดขาด** เว้นแต่ผู้ใช้สั่งเองอย่างชัดเจนเพื่อ release เวอร์ชันใหม่
2. **ห้ามแตะฐานข้อมูล production เด็ดขาด** เว้นแต่ผู้ใช้อนุญาตเป็นครั้งๆ ไป และต้องเตือนชัดเจนก่อนทำ
3. ทำงานบน `develop` หรือสาขาย่อยที่แตกจาก `develop` เท่านั้น
4. ทุกการ `git push` / deploy / migration ที่อาจมีผลกระทบ → **บอกผู้ใช้ก่อนทุกครั้ง**

> การแยก DB (prod ≠ dev) คือกำแพงนิรภัยหลัก: แม้พัง/ลบผิดบน `develop` ข้อมูลจริงที่ร้านก็ไม่โดน

### 🔄 Workflow การทำงาน

```
1. แตกสาขาย่อยจาก develop:   git checkout -b feature/ชื่องาน
2. ทำงาน + ทดสอบในเครื่อง:    npm run dev / npm test  (DB dev เท่านั้น)
3. พอใจ → push ขึ้น develop:   Vercel สร้าง preview อัตโนมัติให้ดู
4. ตรวจ preview → แก้จนดี
5. (ระยะไกล) เมื่อพร้อม release: merge develop → main = production deploy
```

### 🏷️ Versioning (ตอน merge develop → main = release)

ทุกครั้งที่ release ให้ตัดเวอร์ชันใหม่ + tag ตาม [Semantic Versioning](https://semver.org/) และ [Keep a Changelog](https://keepachangelog.com/) (repo ใช้อยู่แล้วใน `CHANGELOG.md`)

**เลขเวอร์ชัน `MAJOR.MINOR.PATCH` (เลือกตามสิ่งที่เปลี่ยน):**

- `PATCH` (`1.0.`**`1`**) — แค่แก้บั๊ก ของเดิมไม่เปลี่ยน
- `MINOR` (`1.`**`1`**`.0`) — เพิ่มฟีเจอร์ใหม่ แต่ของเดิมยังใช้ได้ ← **กรณีปกติของ release ส่วนใหญ่**
- `MAJOR` (**`2`**`.0.0`) — breaking change (ของเดิมพัง/เปลี่ยน API/DB migration ใหญ่ เช่น C9 Float→Decimal)

**ขั้นตอน release (ทำบน `develop` ก่อน แล้วค่อย merge ไป `main` — ห้ามแก้บน main ตรงๆ):**

1. แก้ไฟล์ทั้งหมดนี้บน `develop`:
   - `package.json` → bump `version`
   - `CHANGELOG.md` → เปลี่ยน `[Unreleased]` → `[X.Y.Z] - วันที่` พร้อมสรุปงานที่ release + เปิด `[Unreleased]` ใหม่ว่างไว้ด้านบน
   - `src/components/layout/sidebar.tsx` → เลขเวอร์ชันใน label ต้องตรง `package.json` (**ห้ามปล่อยให้ label โกหก** เหมือนครั้งที่ค้างเป็น `2.3.0.DEV`)
2. commit บน develop → `git merge --no-ff develop` ลง main
3. `git tag vX.Y.Z` ที่ merge commit บน main
4. push: `develop` (ได้) + `main` และ tag (**โดน hook → ผู้ใช้กดเอง** เหมือน push main ปกติ)

> งาน versioning = "release housekeeping" (เล็ก/เจาะจง) → ทำบน develop ตรงๆ ได้ ไม่ต้องแตกสาขา feature/

## Environment Variables

> **หลักการ: Vercel = source of truth** env ของจริงอยู่บน Vercel ไฟล์ในเครื่องเป็นแค่ "สำเนา" สำหรับรัน local — ใช้ `vercel env pull` เพื่อ sync อย่าแก้มือ

### ไฟล์ env ในเครื่อง

- `.env.local` → ใช้ตอน `npm run dev` และ `npm test` → **ชี้ DB dev** (ไฟล์ local เดียวที่ใช้)
- **ไม่มี `.env.production.local`** (ตัดทิ้งโดยเจตนา — เพื่อไม่ให้เครื่อง local เชื่อม DB production โดยไม่จำเป็น)
- หากจำเป็นต้องทดสอบ production build จริงๆ → `vercel env pull` ชั่วคราว แล้วลบทิ้งเมื่อเสร็จ

### env บน Vercel (แยก 2 project)

- `repair-management-system` (prod) → DB prod
- `repair-management-system-dev` (dev) → DB dev
- ทั้งสอง project ใช้ Clerk `live_` keys ชุดเดียวกัน (กำหนดโดยเจตนา — single-user app, ใช้ user directory ชุดเดียว)

### ตัวแปรที่จำเป็น

- `DATABASE_URL` / `PRISMA_DATABASE_URL` / `DIRECT_URL` / `POSTGRES_URL` - Prisma Postgres (Vercel) connection strings — แยกสำหรับ production และ dev
- Clerk keys: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, และ sign-in/up redirect URLs

### ⚠️ ระวัง: ตัวแปรระบบของ Vercel

เมื่อ `vercel env pull` จะมีตัวแปรระบบแทรกมาด้วย (`VERCEL_GIT_*`, `TURBO_*`, `NX_*`, `VERCEL_OIDC_TOKEN`, ฯลฯ) — พวกนี้มีความหมายเฉพาะตอน deploy จริง เป็น noise ในไฟล์ local (สามารถลบออกได้)

## Architecture

### Tech Stack

- **Framework**: Next.js 15.4.x with App Router
- **Language**: TypeScript 5.x
- **Database**: Prisma Postgres (Vercel) — แยกฐานข้อมูลระหว่าง production (`main`) กับ dev (`develop`)
- **ORM**: Prisma 6.14.x
- **API Layer**: tRPC 11.4.x for type-safe APIs
- **Authentication**: Clerk (configured — middleware + ClerkProvider, มีหน้า sign-in/sign-up)
- **UI Components**: Shadcn/ui components
- **Styling**: Tailwind CSS 4.x
- **State Management**: React Hooks + Zustand (when needed)
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide Icons

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/trpc/[...trpc]/ # tRPC API endpoint
│   ├── (auth)/             # sign-in / sign-up pages
│   ├── (main)/             # authenticated app pages
│   └── layout.tsx          # Root layout (ClerkProvider)
├── components/
│   └── ui/                 # Shadcn/ui components
├── lib/
│   ├── api.ts              # tRPC client setup
│   ├── db.ts               # Prisma client
│   ├── trpc.ts             # tRPC React hooks
│   └── utils.ts            # Utility functions
└── server/
    └── api/
        ├── root.ts         # Main tRPC router
        ├── routers/        # Feature-specific routers
        └── trpc.ts         # tRPC server setup
```

### Core Data Models

ระบบจัดการข้อมูลดังนี้ (โมเดลสร้างแล้วใน `prisma/schema.prisma`):

- **Category** - หมวดหมู่สินค้า
- **Unit** - หน่วยนับ (ชิ้น, กล่อง, ฯลฯ)
- **Product** - สินค้าคงคลัง (track stock)
- **PurchaseRecord** - ประวัติรับสินค้าเข้า (สำหรับคำนวณต้นทุน)
- **Customer** - ข้อมูลลูกค้า
- **Sale** / **SaleItem** - การขาย (header + line items)
- **Repair** - งานซ่อม
- **UsedPart** - อะไหล่ที่ใช้ในงานซ่อม
- **BusinessProfile** - ข้อมูลร้าน/ธุรกิจ

## API Architecture

### tRPC Router Structure

The API follows domain-driven router organization (ดู `src/server/api/root.ts` — 10 routers):

- `categories` - Category CRUD operations
- `units` - Unit management
- `products` - Product inventory management
- `purchases` - Stock purchase recording
- `customers` - Customer CRM operations
- `sales` - Sales transaction management
- `repairs` - Repair job management
- `dashboard` - Business intelligence summaries
- `settings` - BusinessProfile / ตั้งค่าร้าน
- `reports` - รายงานสรุป (sales/repairs/purchases)

### Key Business Logic

- **Average Cost Calculation**: Weighted average when recording purchases
- **Stock Deduction**: Automatic inventory updates on sales/repairs
- **Profit Calculation**: Track cost vs revenue for reporting
- **Transaction Safety**: Use Prisma transactions for data consistency

## Development Patterns

### File Naming

- Components: PascalCase (e.g., `ProductForm.tsx`)
- Pages: lowercase (e.g., `dashboard/page.tsx`)
- Utilities: camelCase (e.g., `calculateAverage.ts`)
- Constants: UPPER_SNAKE_CASE

### Testing Strategy

- Unit tests for business logic (cost calculations, stock updates)
- Integration tests for tRPC procedures
- Component tests for complex UI interactions
- Focus on critical business workflows (sales, repairs, stock management)

### Code Quality

- TypeScript strict mode enabled
- ESLint configuration with Next.js rules
- Prettier formatting (run with `npm run format`)
- Path aliases: `~/*` for `src/*`, `@/*` for `src/*`

### Commit Conventions

- ทุก commit ลงท้ายด้วย trailer นี้ (เพื่อให้ github.com/claude ขึ้นเป็น contributor):
  ```
  Co-Authored-By: claude <81847+claude@users.noreply.github.com>
  ```

  - ใช้ email นี้ (GitHub-native noreply ของบัญชี `claude` ID 81847) **ห้าม** ใช้ `noreply@anthropic.com` (มีบั๊ก misattribution — ถูกคนอื่น claim)
  - commit-level attribution (avatar บนหน้า commit) ขึ้นทันทีที่ push; sidebar **Contributors** ขึ้นหลัง commit นั้นถูก merge เข้า `main`
- ภาษา commit message: ไทย (ตามสไตล์ repo)

## Business Context

This system replaces manual bookkeeping for a repair shop with goals to:

- Reduce daily accounting time by 90%
- Achieve 100% data accuracy
- Enable 5-second stock lookups
- Support 1-minute transaction entry
- Provide instant monthly summaries

The application supports the complete repair shop workflow from inventory management through customer service to financial reporting.

## Testing Notes

- Run tests before committing changes
- Critical business logic must have unit test coverage
- Use `npm run test:watch` during development
- Mock external services (database, auth) in tests
- `npm run dev` และ `npm test` ในเครื่องใช้ `.env.local` เท่านั้น → แตะ DB dev เท่านั้น (ไม่มีทางไปโดน DB production)
- No need to run npm run dev because it is already running.
- Do not use hardcoded methods.

## Documentation

เอกสารเก่าทั้งหมด (งานกับ agent รุ่นเก่า) เก็บไว้ที่ `docs_archive/` เพื่ออ้างอิง ห้ามแก้ไข/ลบ:

- `docs_archive/docs_mvp/` - เอกสารรุ่น MVP
- `docs_archive/docs_2.0/`, `docs_2.1.0/`, `docs_2.2.0/`, `docs_2.3.0/` - เอกสารรุ่นถัดๆ มา

เอกสารรอบพัฒนาปัจจุบันอยู่ที่ `docs/`:

- `docs/HANDOFF.md` - ส่งต่องานไปแชทใหม่ (**อ่านก่อนเริ่มงานทุกเซสชัน**)
- `docs/journal/YYYY-MM-DD.md` - บันทึกประจำวันของ Claude (ดู `docs/journal/README.md` สำหรับระบบ)

## Agent Skills

โปรเจ็กต์นี้ติดตั้ง **Matt Pocock's skills** (24 skills) ไว้ที่ `.claude/skills/`:

- **เก็บเฉพาะเครื่อง** (อยู่ใน `.gitignore` ไม่ commit) — เครื่องอื่น clone มาจะไม่มี
- Layout **flat** (`.claude/skills/<skill>/`) เพราะ Claude Code ค้นพบ project skills แบบ 1 ระดับ
- รายการ + แผนที่หมวด + วิธี re-sync อยู่ใน `.claude/skills/README.md`
- ⚠️ `/code-review` ของ Matt ชนชื่อกับ built-in — ลบ `.claude/skills/code-review/` ถ้าอยากกลับเป็น built-in

### Issue tracker

Issues/PRD เก็บเป็น **GitHub Issues** บน `konglife/repair-management-system` ใช้ `gh` CLI (PRs ไม่ใช่ request surface). See `docs/agents/issue-tracker.md`.

### Triage labels

ใช้ default label = ชื่อ role (`needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`) + category `bug`/`enhancement`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — `CONTEXT.md` ที่ root + `docs/adr/` (สร้าง lazily). See `docs/agents/domain.md`.

## Vercel Access

นอกจาก Vercel CLI (`vercel env pull`, `vercel deploy` — ต้องลง binary + `vercel link`) ยังเข้า Vercel ได้ผ่าน **Vercel MCP plugin** (ทีม `konglife's projects`) สำหรับอ่าน projects/deployments/env/logs และ deploy โดยไม่ต้องลง CLI
