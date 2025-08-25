# **2. Epic 1: Core Modules UI/UX and Functionality Enhancement**

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
