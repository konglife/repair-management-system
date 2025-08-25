# Repair Management System - Brownfield Enhancement Architecture v2.0

## 1. Introduction

### 1.1 Existing Project Analysis & Integration Strategy
This document outlines the architectural enhancements required to implement Version 2.0 of the Repair Management System. The design prioritizes seamless integration with the existing MVP architecture (documented in `docs_mvp/architecture.md`), ensuring that all new features align with established patterns while introducing modern, scalable solutions.

The core of the existing system is a well-structured Next.js application using Prisma for data access and Tailwind CSS for styling. The V2.0 architecture will extend this foundation, introducing new database models, API endpoints, and frontend components in a minimally disruptive manner.

**Key Integration Strategy**:
- **Database**: A new `BusinessProfile` model will be added via a new Prisma migration file.
- **Backend**: New API routes will be created within the existing `src/app/api/` structure to handle new functionalities like settings and reporting.
- **Frontend**: New components for charts, search, and pages will be created within the existing `src/components/` and `src/app/` structure, reusing existing UI elements where possible to maintain consistency.

### 1.2 Change Log
| Date       | Version | Description                               | Author   |
|------------|---------|-------------------------------------------|----------|
| 2025-08-20 | 1.0     | Initial draft for V2.0 enhancements       | Winston  |

---

## 2. Tech Stack Alignment

The existing technology stack from the MVP remains the foundation. The following libraries will be added to support V2.0 features.

| Category          | Technology    | Version | Purpose & Rationale                                       |
|-------------------|---------------|---------|-----------------------------------------------------------|
| **UI Charting** | Recharts      | ^2.12.7 | To render interactive charts (Line, Bar) on the Dashboard. Chosen for its simplicity and good integration with React. |
| **PDF Generation**| `pdf-lib`     | ^1.17.1 | To generate PDF reports on the server-side. Chosen for its lightweight nature and minimal dependencies compared to Puppeteer. |
| **UI Input Mask** | `react-number-format` | ^5.3.4  | To provide user-friendly, masked input fields for currency, improving UX and data accuracy. |

---

## 3. Data Models and Schema Changes

A new model is required to support the new Settings and Reporting features. This will be implemented via a new Prisma migration.

### 3.1 New Model: `BusinessProfile`

This model will store centralized business information.

```prisma
// In prisma/schema.prisma

model BusinessProfile {
  id                String  @id @default(cuid())
  shopName          String
  address           String?
  phoneNumber       String?
  contactEmail      String?
  logoUrl           String?
  lowStockThreshold Int     @default(5)

  @@map("business_profiles")
}
````

### 3.2 Schema Integration Strategy

  - A new Prisma migration file will be generated (`prisma migrate dev --name add_business_profile`).
  - The system must handle the case where no business profile exists yet, providing default values or prompting the admin to complete the setup.

-----

## 4\. Component & API Architecture

### 4.1 New Backend Components (API Routes)

New API endpoints will be created to support the new features.

  - **`POST /api/settings`**: To create or update the business profile. (Admin only)
  - **`GET /api/settings`**: To retrieve the current business profile.
  - **`POST /api/reports/sales`**: To generate a monthly sales PDF report. Requires `month` and `year` in the request body. (Admin only)
  - **`POST /api/reports/repairs`**: To generate a monthly repairs PDF report. (Admin only)

### 4.2 New Frontend Components

  - **`/app/(dashboard)/settings/page.tsx`**: A new page and form for managing business settings (FR33, FR34, FR36).
  - **`/app/(dashboard)/reports/page.tsx`**: A new page with controls to select and generate PDF reports (FR29, FR31).
  - **`/components/charts/IncomeExpenseChart.tsx`**: A client component using Recharts to display the income vs. expenses line chart (FR24).
  - **`/components/charts/TopProductsChart.tsx`**: A client component using Recharts to display the top 5 selling products bar chart (FR26).
  - **`/components/dashboard/RecentActivities.tsx`**: A component to fetch and display the latest system activities (FR25).
  - **`/components/dashboard/LowStockAlerts.tsx`**: A component to fetch and display products below the low stock threshold (FR27).
  - **`/components/ui/SearchInput.tsx`**: A reusable search bar component to be implemented on various data tables (FR1, FR9, FR14, FR20).
  - **`/components/ui/CurrencyInput.tsx`**: A reusable input component using `react-number-format` for currency fields (FR3, FR16).

-----

## 5\. Source Tree Integration

New files will be integrated into the existing project structure as follows:

```
repair-management-system/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Modified to include new charts/widgets
│   │   │   ├── reports/                # NEW FOLDER
│   │   │   │   └── page.tsx            # NEW FILE (FR29)
│   │   │   └── settings/               # NEW FOLDER
│   │   │       └── page.tsx            # NEW FILE (FR33)
│   │   └── api/
│   │       ├── reports/                # NEW FOLDER
│   │       │   ├── sales/route.ts      # NEW FILE (FR30.1)
│   │       │   └── repairs/route.ts    # NEW FILE (FR30.2)
│   │       └── settings/               # NEW FOLDER
│   │           └── route.ts            # NEW FILE
│   ├── components/
│   │   ├── charts/                     # NEW FOLDER
│   │   │   ├── IncomeExpenseChart.tsx  # NEW FILE (FR24)
│   │   │   └── TopProductsChart.tsx    # NEW FILE (FR26)
│   │   ├── dashboard/
│   │   │   ├── RecentActivities.tsx    # NEW FILE (FR25)
│   │   │   └── LowStockAlerts.tsx      # NEW FILE (FR27)
│   │   └── ui/
│   │       ├── SearchInput.tsx         # NEW FILE
│   │       └── CurrencyInput.tsx       # NEW FILE
├── prisma/
│   ├── migrations/
│   │   └── ..._add_business_profile/   # NEW MIGRATION
│   └── schema.prisma                   # Modified to add BusinessProfile model
```

-----

## 6\. Testing Strategy

  - **Unit Tests**: New UI components (Charts, SearchInput, etc.) and new API utility functions (e.g., PDF generation logic) should have unit tests using Jest and React Testing Library.
  - **Integration Tests**: End-to-end tests using a tool like Playwright or Cypress should be created for the new critical user flows:
    1.  Admin successfully updates settings.
    2.  Admin successfully generates a Sales PDF report for a given month.
  - **Manual Testing**: A full regression test must be performed to ensure that adding search bars, currency inputs, and other enhancements does not break existing CRUD functionalities in Stock, Sales, and Repairs modules.