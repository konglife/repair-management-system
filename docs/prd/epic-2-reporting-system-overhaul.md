# **Epic 2: Reporting System Overhaul**

**Epic Goal:** To redesign and overhaul the PDF reporting system for Sales and Repairs to be professional, legible, and provide useful summaries for immediate business use.

### **Functional Requirements (FR)**

#### **General Report Layout:**
* **FR5.1:** **Header Redesign:** The report header must be redesigned to dynamically pull business information (name, address, etc.) from the system's **Settings**.
* **FR5.2:** **Add Summary Section:** A summary section must be added at the top of each report.
* **FR5.3:** **Currency Correction:** The currency symbol must be changed from `$` to `฿`.

#### **Sales Report Specifics:**
* **FR6.1:** **Table Layout:** The details section must be formatted as a proper table.
* **FR6.2:** **Table Columns:** The table must include: **Date**, **Customer Name**, **Product/Service Description**, and **Total Amount (฿)**.
* **FR6.3:** **Remove Unnecessary Fields:** The `Sale ID` field must be removed.

#### **Repairs Report Specifics:**
* **FR7.1:** **Table Layout:** The details section must be formatted as a proper table.
* **FR7.2:** **Table Columns:** The table must include: **Date**, **Customer Name**, **Job Description**, **Parts Used**, and **Total Cost (฿)**.
* **FR7.3:** **Remove Unnecessary Fields:** The `Repair ID` field must be removed.

---
