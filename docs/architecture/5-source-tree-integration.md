# 5\. Source Tree Integration

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
