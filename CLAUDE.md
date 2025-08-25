# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a repair shop back-office management system built as a modern full-stack Next.js application using the T3 Stack. The system manages products, customers, sales, repairs, and provides business intelligence dashboards for a single-user repair shop environment.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code quality checks
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode

### Database Commands
- `npx prisma migrate dev` - Create and apply database migrations
- `npx prisma studio` - Open Prisma Studio database GUI
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma db push` - Push schema changes to database (dev only)

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.x with App Router
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (NeonDB for production)
- **ORM**: Prisma 6.14.x
- **API Layer**: tRPC 11.4.x for type-safe APIs
- **Authentication**: Clerk (to be implemented)
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
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
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

### Core Data Models (Planned)
Based on the architecture documentation, the system will manage:
- **Categories** - Product categorization
- **Units** - Measurement units (piece, box, etc.)
- **Products** - Inventory items with stock tracking
- **PurchaseRecords** - Stock purchase history for cost calculation
- **Customers** - Customer information and CRM
- **Sales** - Sales transactions with line items
- **Repairs** - Repair jobs with parts tracking
- **UsedParts** - Parts consumed in repair jobs

## API Architecture

### tRPC Router Structure
The API follows domain-driven router organization:
- `categories` - Category CRUD operations
- `units` - Unit management
- `products` - Product inventory management
- `purchases` - Stock purchase recording
- `customers` - Customer CRM operations
- `sales` - Sales transaction management
- `repairs` - Repair job management
- `dashboard` - Business intelligence summaries

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

## Business Context

This system replaces manual bookkeeping for a repair shop with goals to:
- Reduce daily accounting time by 90%
- Achieve 100% data accuracy
- Enable 5-second stock lookups
- Support 1-minute transaction entry
- Provide instant monthly summaries

The application supports the complete repair shop workflow from inventory management through customer service to financial reporting.

## Environment Setup

Ensure these environment variables are configured:
- `DATABASE_URL` - PostgreSQL connection string
- Authentication keys (Clerk - to be implemented)

## Testing Notes

- Run tests before committing changes
- Critical business logic must have unit test coverage
- Use `npm run test:watch` during development
- Mock external services (database, auth) in tests
- No need to run npm run dev because it is already running.
- Do not use hardcoded methods.

## Important information about each previous version of the document
- First version documents, doc_mvp folder
- Second version documents, doc_2.0 folder