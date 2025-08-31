# **Requirements**

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
