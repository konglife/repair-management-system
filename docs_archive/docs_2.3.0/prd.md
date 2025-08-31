# **Repair Management System Brownfield Enhancement PRD (V2.3.0)**

## **Intro Project Analysis and Context**

This document provides the requirements for the v2.3.0 enhancement of the Repair Management System. The primary focus is on significant User Experience (UX) improvements and refinements to the reporting module to create a more consistent, modern, and professional application.

### **Existing Project Overview**

* **Analysis Source:** Analysis conducted from the provided project source code and existing documentation from version 2.2.0.
* **Current Project State:** A fully functional Repair Management System (v2.2.0) featuring modules for stock management, sales, repairs, customer relationship management (CRM), and basic reporting.
* **Reference Implementation:** The **Stock Management** module serves as the gold standard for this enhancement, specifically its use of optimistic UI updates via tRPC mutations and React Query's `utils.invalidate()` to avoid full-page reloads on data submission.

### **Available Documentation Analysis**

The project contains comprehensive documentation from its MVP stage up to v2.2.0, providing a solid foundation for understanding the existing architecture.
* **Available Docs:**
    * [✓] Tech Stack Documentation
    * [✓] Source Tree/Architecture Documentation
    * [✓] Coding Standards (Inferred from Eslint config and codebase)
    * [✓] API Documentation (tRPC Routers)
    * [ ] UX/UI Guidelines (No dedicated document, patterns exist in code)
    * [ ] Technical Debt Documentation

### **Enhancement Scope Definition**

* **Enhancement Type:**
    * [ ] New Feature Addition
    * [✓] **Major Feature Modification**
    * [ ] Integration with New Systems
    * [ ] Performance/Scalability Improvements
    * [✓] **UI/UX Overhaul**
* **Enhancement Description:** To refactor the data submission flow in the Sales and Customers modules to provide a non-refreshing, real-time update experience. Additionally, to enhance the UI and data presentation of the Summary Report.
* **Impact Assessment:**
    * [ ] Minimal Impact
    * [✓] **Moderate Impact** (Requires refactoring existing components and data-fetching logic)
    * [ ] Significant Impact
    * [ ] Major Impact

### **Goals and Background Context**

* **Goals:**
    * To improve the perceived performance and fluidity of the Sales and Customers modules.
    * To enhance the accuracy and professionalism of the Summary Report document.
    * To standardize the User Experience for data manipulation across all major modules.
* **Background Context:** User feedback and internal review have identified an inconsistent user experience. The Stock Management module provides a modern, seamless experience upon form submission, while the Sales and Customers modules still rely on full-page reloads. This enhancement aims to rectify this inconsistency and improve the overall quality of the application.

### **Change Log**

| Date       | Version | Description                              | Author                 |
| :----------- | :-------- | :--------------------------------------- | :--------------------- |
| 2025-08-31 | 2.3.0     | Initial draft for UX and Reports enhancement. | John (Product Manager) |

---

## **Requirements**

### **Functional Requirements**

* **FR1:** When a user saves a new Sale, the sales data table must update immediately without a full-page reload.
* **FR2:** When a user saves a new Customer, the customers data table must update immediately without a full-page reload.
* **FR3:** The data handling mechanism for FR1 and FR2 must replicate the tRPC mutation and `utils.invalidate()` pattern successfully implemented in the Stock Management module.
* **FR4:** In the "Summary Report", within the "Details from Repairs" table, the "Parts Used" column must not display the price of the parts.
* **FR5:** The date range header in the "Summary Report" must use a hyphen " - " as a separator (e.g., "01/08/2025 - 31/08/2025").
* **FR6:** The system must fetch the `companyLogoUrl` from the `BusinessProfile` table in the database.
* **FR7:** The fetched company logo must be displayed at the top of the "Summary Report", styled to an appropriate size and rendered in grayscale.

### **Non-Functional Requirements**

* **NFR1:** The client-side performance after form submission in Sales and Customers pages must be perceptibly as fast as the Stock Management page.
* **NFR2:** The enhancements must not introduce any significant increase in the initial page load time for the affected modules.

### **Compatibility Requirements**

* **CR1:** All changes must be compatible with the existing tRPC API structure; no breaking changes to existing API procedures are permitted.
* **CR2:** No database schema migrations are required for this enhancement.
* **CR3:** The UI and interaction patterns of the refactored forms must remain consistent with the project's existing Shadcn UI design system.
* **CR4:** The logic for fetching the company logo must not interfere with the existing functionality of the Settings page.

---

## **Technical Constraints and Integration Requirements**

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

## **Epic and Story Structure**

### **Epic Approach**

All related tasks are consolidated into a single, comprehensive epic to ensure a unified delivery of the v2.3.0 enhancements.

### **Epic 1: UX and Reports Enhancement (v2.3.0)**

**Epic Goal:** To elevate the application's user experience by standardizing data-handling patterns across core modules and to improve the professionalism and accuracy of the reporting feature.

#### **Story 2.3.1: Refactor Sales and Customers Forms for Non-Refreshing Updates**
**As a** user,
**I want** the data tables to update instantly after adding a new sale or customer,
**so that** my workflow is seamless and not interrupted by a page reload.

* **Acceptance Criteria:**
    1.  Upon successful creation of a new sale, the new record appears in the sales table immediately, and the page does not perform a full reload.
    2.  Upon successful creation of a new customer, the new record appears in the customers table immediately, and the page does not perform a full reload.
    3.  The implementation pattern must mirror the `useMutation` and `utils.invalidate()` logic found in the Stock Management module.
    4.  A success toast notification is displayed after each successful submission.

#### **Story 2.3.2: Refine UI of the Summary Report**
**As a** user,
**I want** the summary report to be clean and easy to read,
**so that** I can quickly understand the business performance data.

* **Acceptance Criteria:**
    1.  The "Parts Used" column in the "Details from Repairs" table displays only the part name and quantity (e.g., "Screen x1").
    2.  The date range in the report header is formatted with a hyphen (e.g., "Summary Report 01/08/2025 - 31/08/2025").

#### **Story 2.3.3: Add Company Branding to the Summary Report**
**As a** shop owner,
**I want** my company logo to appear on all reports,
**so that** the documents look official and are branded.

* **Acceptance Criteria:**
    1.  The company logo, as configured in the Settings page, is displayed at the top of the Summary Report.
    2.  The logo is rendered in grayscale.
    3.  The logo is scaled appropriately to fit the document header without causing layout issues.
    4.  If no logo URL is configured in the settings, no broken image or empty space is displayed.