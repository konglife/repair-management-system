# **3. Epic 2: Reporting System Overhaul**

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
