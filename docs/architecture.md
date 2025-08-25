# Repair Management System -  Enhancement Architecture v2.1.0

## **1. Introduction and Analysis**

### **1.1. Architectural Goals**
* **Seamless Integration:** Design all enhancements to align with the existing architecture and code patterns of the project.
* **Component Reusability:** Emphasize the creation and modification of UI Components that can be reused across the application.
* **State Management Consistency:** Establish a clear and consistent pattern for frontend state management to ensure efficient and predictable data updates.
* **Maintainability:** Structure the new code in a way that is easy to understand, maintain, and extend in the future.

### **1.2. Existing Project Analysis Summary**
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI.
* **Backend:** Next.js API Routes.
* **Database ORM:** Prisma.
* **UI Patterns:** Primarily utilizes components from Shadcn UI (e.g., `<Card>`, `<Table>`, `<Dialog>`).
* **State Management:** Mostly component-level state (`useState`) with some evidence of prop drilling.

---

## **2. Epic 1: Core Modules UI/UX and Functionality Enhancement**

### **2.1. Technical Approach**

#### **State Management for Real-time Updates (FR2.3, FR3.3, FR4.1)**
* **Recommendation:** To address the need for real-time updates on Stat Cards and to create a more scalable state management solution, adopt a client-side data fetching library such as **SWR** or **React Query (TanStack Query)**.
* **Rationale:** These libraries automatically handle data `fetching`, `caching`, and `revalidation`. After a mutation (POST, PUT), a revalidation of the relevant queries can be triggered, causing the UI to update automatically. This is a robust and efficient pattern.
* **Implementation:**
    1.  Create custom hooks for fetching statistics (e.g., `useSalesStats`, `useRepairsStats`).
    2.  Utilize these hooks in the respective pages to display data in the cards.
    3.  After a successful form submission, call the `mutate` or `revalidate` function from the hook to refresh the data.

#### **Searchable Dropdown (FR1.3)**
* **Recommendation:** Implement using the `<Combobox>` component from **Shadcn UI**.
* **Implementation:**
    1.  Create a new API route (e.g., `/api/products/search?q=...`) that searches for products by name.
    2.  The frontend Combobox component will call this API as the user types, populating the dropdown with results.

#### **Date Picker with Custom Date (FR1.4, FR2.2, FR3.2)**
* **Recommendation:** Utilize the `<DatePicker>` component built from **Shadcn UI's** `<Calendar>` and `<Popover>` components.
* **Implementation:** Replace existing date inputs in relevant forms with this component.

#### **Inline Form for Sales (FR2.1)**
* **Recommendation:** Refactor the UI to embed the "Create New Sale" form directly onto the sales page, removing the dialog popup.
* **Implementation:** Move the form's JSX and state logic from the `<Dialog>` component into the main sales page component.

#### **Popup Resizing (FR3.1)**
* **Recommendation:** Modify the CSS class on the `<DialogContent>` for the "Create New Repair Job" form using Tailwind CSS utility classes to set a wider `maxWidth` (e.g., `sm:max-w-xl`).

---

## **3. Epic 2: Reporting System Overhaul**

### **3.1. Technical Approach**

#### **PDF Generation Enhancement (FR5.1 - FR7.3)**
* **Recommendation:** Centralize PDF generation logic in a dedicated backend API route for each report.
* **Implementation:**
    1.  Create a new API route, e.g., `/api/reports/sales`, accepting `startDate` and `endDate`.
    2.  The route will fetch all necessary data (business details from `Settings`, sales records within the date range).
    3.  Use a library like `react-pdf/renderer` or `jspdf` on the **backend** to construct the PDF with the new layout.
    4.  Format all currency values using `Intl.NumberFormat` for the 'th-TH' locale.
    5.  The API will respond with the generated PDF as a file stream for the frontend to download.

---

## **4. Epic 3: Dashboard Visualization and Insights**

### **4.1. Technical Approach**

#### **Graph Improvement (FR8.1, FR8.3, FR9.2)**
* **Recommendation:**
    * **Income vs Expenses:** Change the chart type in `recharts` to a **Grouped Bar Chart**.
    * **Top 5 Products/Customers:** Create new dedicated API routes (e.g., `/api/dashboard/top-products`) that perform the aggregation on the server for the current month.
* **Implementation:** Update the dashboard page components to use the new chart types and fetch data from these new API routes.

#### **Filter Scoping (FR8.2)**
* **Recommendation:** Decouple the date range state from the data fetching logic for the graphs.
* **Implementation:**
    1.  The date range state will be passed *only* to the data-fetching hooks for the Stat Cards.
    2.  The data-fetching hooks for the graphs will be called without date parameters.

#### **New Components & API (FR9.1)**
* **Recommendation:** Create a new API route and a corresponding frontend component for the activity feed.
* **API Endpoint:** `/api/dashboard/recent-activity`: Fetches the last 5-10 sale or repair records.
* **Frontend Component:** Create a new "Recent Activity Feed" React component and integrate it into the dashboard page.