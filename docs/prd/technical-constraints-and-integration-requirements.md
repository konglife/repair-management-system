# **Technical Constraints and Integration Requirements**

### **Existing Technology Stack**

| Category      | Technology           | Version       |
| :------------ | :------------------- | :------------ |
| **Language** | TypeScript           | ~5.4.5        |
| **Framework** | Next.js              | 14.2.3        |
| **API** | tRPC                 | 11.0.0-rc.354 |
| **Database** | Prisma ORM           | 5.15.0        |
| **UI** | React, Tailwind CSS, Shadcn UI | 18, 3.4.1     |
| **State** | React Query (via tRPC) | N/A           |

### **Integration Approach**

* **Database Integration Strategy:** Utilize the existing Prisma Client to query the `BusinessProfile` model. No schema changes.
* **API Integration Strategy:** Refactor the existing tRPC mutations in `sale.ts` and `customer.ts`. Modify the tRPC query in `reports.ts` to include business profile data.
* **Frontend Integration Strategy:**
    * Refactor the form submission logic in `(main)/sales/page.tsx` and `(main)/customers/page.tsx` to use the `useMutation` hook from tRPC and call `utils.invalidate()` on success, referencing `(main)/stock/page.tsx` as the implementation guide.
    * Modify the `RepairsTable.tsx` component to remove price rendering from the "Parts Used" column.
    * Modify the `ReportHeader.tsx` component to adjust the date format and render the company logo.
* **Testing Integration Strategy:** Add/update Playwright E2E tests to verify the new non-refreshing behavior and the updated report UI.

---
