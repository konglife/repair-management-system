# Repair Management System - System Enhancement PRD v2.1.0

## **1. Goals and Background Context**

### **1.1. Goals**
* To improve the User Experience (UX) and User Interface (UI) across five core modules (Stock, Sales, Repairs, Customers, Dashboard), making them more modern, intuitive, and consistent.
* To increase user efficiency by streamlining workflows and reducing unnecessary steps.
* To add the ability to backdate entries, accommodating real-world operational needs.
* To enhance data visualization in summaries (Stat Cards) and reports, making them real-time and more useful for rapid, accurate decision-making.

### **1.2. Background Context**
This document defines the scope and requirements for enhancing the existing Repair Management System (v2.0). This initiative focuses on addressing user-identified pain points from daily operations. The core logic of the existing system will be preserved, with enhancements targeted specifically at the UI/UX, reporting system, and dashboard to create a more complete and business-responsive application.

*Assumption: Development will occur on the existing codebase, which was built using the bmad method and claude code, with no changes to the core technology stack.*

---

## **Epic 1: Core Modules UI/UX and Functionality Enhancement**

**Epic Goal:** To refine the user experience and functionality of the core management modules (Stock, Sales, Repairs, Customers) to be more intuitive, faster, and consistent.

### **Functional Requirements (FR)**

#### **Stock Management:**
* **FR1.1:** The submenu in the "Stock Management" section must be reordered to: Products, Record Purchase, Categories, Units.
* **FR1.2:** The "Products" page must be the default view when a user navigates to "Stock Management".
* **FR1.3:** In the "Record New Purchase" form, the "Product" field must be a searchable dropdown instead of a standard input.
* **FR1.4:** The "Record New Purchase" form must include a "Date" field that allows users to select a past date.

#### **Sales:**
* **FR2.1:** The "Create New Sale" form must be converted to an inline form UI.
* **FR2.2:** The "Create New Sale" form must include a "Date" field that allows users to select a past date.
* **FR2.3:** The summary statistic cards on the "Sales" page must update automatically after a new sale is successfully added.

#### **Repairs:**
* **FR3.1:** The "Create New Repair Job" form popup must be larger, and its internal UI must be reorganized for better usability.
* **FR3.2:** The "Create New Repair Job" form must include a "Date" field that allows users to select a past date.
* **FR3.3:** The summary statistic cards on the "Repairs" page must update automatically after a new repair job is successfully added.

#### **Customers:**
* **FR4.1:** The summary statistic cards on the "Customers" page must update automatically after a new customer is successfully added.

---

## **Epic 2: Reporting System Overhaul**

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

## **Epic 3: Dashboard Visualization and Insights**

**Epic Goal:** To improve the Dashboard to provide clearer insights, enhance usability, and introduce new key metrics.

### **Functional Requirements (FR)**

#### **Existing Component Adjustments:**
* **FR8.1:** **Graph Improvement:** The "Income vs Expenses Trend" graph must be changed to a more easily interpretable chart type.
* **FR8.2:** **Filter Scoping:** The date range filter must only apply to the summary statistic cards.
* **FR8.3:** **Graph Data Timeframe:** The "Top 5 Selling Products" graph must display data for the **current month** only.

#### **New Dashboard Component Suggestions:**
* **FR9.1:** **New "Recent Activity" Feed:** Add a feed that displays the last 5-10 recent activities.
* **FR9.2:** **New "Customer Insights" Graph:** Add a "Top 5 Customers (by Revenue)" graph.

---

## **4. General Non-Functional Requirements (NFR)**
* **NFR1:** None of the enhancements shall negatively impact the existing core functionality of the system.
* **NFR2:** The performance of the application must not degrade after the implementation of these enhancements.
* **NFR3:** The new UI must be consistent with the project's existing Design System.
* **NFR4:** The new PDF layouts must render correctly in common PDF viewers.
* **NFR5:** The Dashboard must load all data and visualizations quickly.