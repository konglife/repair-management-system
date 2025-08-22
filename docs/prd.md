# Repair Management System - Brownfield Enhancement PRD v2.0

## 1. Intro Project Analysis and Context

### 1.1 Existing Project Overview
- **Analysis Source**: IDE-based fresh analysis of the MVP project code.
- **Current Project State**: The project is a Minimum Viable Product (MVP) of a Repair Management System built with Next.js 14, TypeScript, PostgreSQL (via Prisma), and Tailwind CSS. It features a basic dashboard, user/repair management tables, and authentication via NextAuth.js with Admin and User roles.

### 1.2 Available Documentation Analysis
- This enhancement builds upon the initial MVP. All original planning documents (`project-brief.md`, `prd.md`, `ui-ux-specification.md`, `architecture.md`) are archived in the **`docs_mvp`** folder for reference.

### 1.3 Enhancement Scope Definition
- **Enhancement Type**: Major Feature Modification & New Feature Addition.
- **Enhancement Description**: To upgrade the system to Version 2.0 by enhancing user experience (UI/UX), adding comprehensive search and filtering capabilities, improving financial data handling (currency, input methods), and introducing a monthly PDF reporting system.
- **Impact Assessment**: Significant Impact. The changes affect multiple core modules but do not require a complete architectural overhaul.

### 1.4 Goals and Background Context
- **Goals**:
    - Improve user efficiency with new search functionalities.
    - Increase accuracy and ease of financial data entry.
    - Provide more insightful business analytics through enhanced dashboards and new reports.
    - Modernize the UI/UX for better usability.
    - Introduce PDF reporting for business analysis.
- **Background Context**: This enhancement builds upon the successful MVP launch. Based on initial usage, several areas for improvement were identified to make the system more robust, user-friendly, and capable of providing deeper business insights for day-to-day operations. This version (2.0) aims to address these key areas.

---

## 2. Requirements

### Module: Stock Management
- **FR1**: Implement a search bar in the data tables for: `Categories`, `Units`, `Products`, and `Record Purchase`.
- **FR2**: Change all currency symbols and values from USD ($) to Thai Baht (฿).
- **FR3**: Enhance numeric input fields for currency:
    - **3.1**: Implement input masking for automatic thousand-separator commas.
    - **3.2**: Set the input mode to display a numeric keypad (numpad) on mobile devices.
- **FR4**: Remove the "Quick Actions" section from the UI.
- **FR5**: Ensure the "Total Value" card accurately calculates and displays the total value of all products in stock.
- **FR6**: The "Products" column in the `Categories` table must display the count of products within that category.
- **FR7**: The "Products" column in the `Units` table must display the count of products using that unit.
- **FR8**: Add descriptive labels to all fields in the "Create New Product" form, consistent with the "Record Purchase" form.

### Module: Sales
- **FR9**: Implement a search bar in the `Sales` data table.
- **FR10**: Change all currency symbols and values from USD ($) to Thai Baht (฿).
- **FR11**: Add a date range filter (`Today`, `Last 7 Days`, `Last 1 Month`) to the sales analytics cards.
- **FR12**: Convert the "Product" field in the "Create New Sale" form into an autocomplete search input.
- **FR13**: Add three new analytics cards: "Average Sale Value", "Top Selling Product", and "Total Transactions".

### Module: Repairs
- **FR14**: Implement a search bar in the `Repairs` data table.
- **FR15**: Change all currency symbols and values from USD ($) to Thai Baht (฿).
- **FR16**: Enhance numeric input fields for currency (implementing Input Masking and Numpad).
- **FR17**: Add a date range filter (`Today`, `Last 7 Days`, `Last 1 Month`) to the repair analytics cards.
- **FR18**: Convert the "Add Parts Used" field in the "Create New Repair Job" form into an autocomplete search input.
- **FR19**: Add one new analytics card: "Total Parts Cost".

### Module: Customers
- **FR20**: Implement a search bar in the `Customers` data table (search by name or phone).
- **FR21**: Add two new analytics cards: "Total Customers" and "New Customers (This Month)".

### Module: Dashboard
- **FR22**: Change all currency symbols and values from USD ($) to Thai Baht (฿).
- **FR23**: Add/update analytics cards: "Total Stock Value" and "Gross Profit" (with date range filter).
- **FR24**: Replace the "Income vs Expenses Trend" table with an interactive Line Chart.
- **FR25**: Add a "Recent Activities" table/widget.
- **FR26**: Add a "Top 5 Selling Products" Bar Chart (with date range filter).
- **FR27**: Add a "Low Stock Alerts" widget.

### Module: Core UI/UX
- **FR28**: On large screens (desktop), add an icon button to the main navigation bar to collapse and expand the sidebar.

### Module: Reporting & Settings
- **FR29**: Add a new "Reports" menu item to the sidebar.
- **FR30**: The "Reports" page will allow users to generate two types of monthly PDF reports:
    - **30.1**: Monthly Sales Report.
    - **30.2**: Monthly Repairs Report (summarizing total revenue, parts cost, and gross profit).
- **FR31**: Users must be able to select the month and year for the report.
- **FR32**: The generated PDF must be well-formatted.
- **FR33**: Add a new "Settings" menu item to the sidebar.
- **FR34**: The "Settings" page will allow admins to manage the following business information:
    - **34.1**: Shop Name
    - **34.2**: Address
    - **34.3**: Phone Number
    - **34.4**: Contact Email
    - **34.5**: Company Logo URL
- **FR35**: The Shop Name and Logo from settings must appear in the header of all generated PDF reports.
- **FR36**: Add a "Stock Settings" section on the "Settings" page to allow users to configure the "Low Stock Threshold" value.

---

## 3. User Interface Design Goals
The UI/UX for Version 2.0 will build upon the existing design documented in `docs_mvp/ui-ux-specification.md`. The primary goals are to enhance usability and data visualization. All new components, such as charts, search bars, and date filters, must integrate seamlessly with the existing Tailwind CSS theme and maintain a consistent, clean, and modern aesthetic. The new Settings and Reports pages should follow the established layout patterns of the existing application.

---

## 4. Technical Assumptions
The technical foundation will remain consistent with the MVP's architecture, as documented in `docs_mvp/architecture.md`. Key new assumptions for V2.0 include:
- **Database**: The Prisma schema will be extended to include a new `BusinessProfile` table to support the Settings feature. This migration must be non-destructive.
- **PDF Generation**: A suitable server-side library (e.g., `pdf-lib` or `Puppeteer`) will be integrated to handle the creation of PDF reports. This process will be an API endpoint.
- **UI Components**: A charting library compatible with React/Next.js (e.g., `Recharts` or `Chart.js`) will be added to render the new graphs on the dashboard.
- **State Management**: Existing state management patterns will be sufficient to handle the new UI interactivity (filters, search).

---

## 5. Epic List

The requirements for Version 2.0 will be organized into three logical Epics to ensure a structured development process.

- **Epic 1: Foundational UI/UX & System-Wide Enhancements**
    - **Goal**: To improve the core user experience across the entire application by implementing consistent UI patterns, currency localization, and universal search functionality.
- **Epic 2: Core Module Upgrades & Data Handling**
    - **Goal**: To enhance the functionality and data presentation within the core business modules (Stock, Sales, Repairs, Customers), making data entry easier and analytics more insightful.
- **Epic 3: Business Intelligence & Administration Module**
    - **Goal**: To introduce new high-level business management capabilities through a dedicated reporting system and a centralized application settings panel.

---

## 6. Epic Details

### Epic 1: Foundational UI/UX & System-Wide Enhancements

- **Description**: This Epic focuses on quality-of-life improvements that affect the entire system. Implementing these changes first ensures a consistent user experience as we build out more specific features.
- **Stories**:
    - **Story 1.1: Implement Sidebar Toggle**: As a desktop user, I want a button to collapse and expand the sidebar so that I can maximize my content viewing area. (FR28)
    - **Story 1.2: Localize Currency**: As a user, I want to see all monetary values displayed in Thai Baht (฿) so that the financial information is relevant to my region. (FR2, FR10, FR15, FR22)
    - **Story 1.3: Implement Universal Search**: As a user, I want a search bar on all main data tables (Stock, Sales, Repairs, Customers) so that I can quickly find the information I need. (FR1, FR9, FR14, FR20)
    - **Story 1.4: Enhance Numeric Inputs**: As a user, I want numeric input fields for currency to be user-friendly, with automatic formatting and a mobile-friendly keypad, to reduce errors and save time. (FR3, FR16)
    - **Story 1.5: Standardize Form Labels**: As a user, I want all form fields to have clear labels, like in the Record Purchase form, so I know exactly what information to enter. (FR8)

### Epic 2: Core Module Upgrades & Data Handling

- **Description**: This Epic focuses on enhancing the core features of the application, improving data visualization on the dashboard, and making data entry more intelligent.
- **Stories**:
    - **Story 2.1: Upgrade Dashboard Analytics**: As an admin, I want to see more insightful analytics cards and charts on my dashboard (Gross Profit, Stock Value, Trends, Top Products, Low Stock) so I can get a better overview of my business performance at a glance. (FR23, FR24, FR26, FR27)
    - **Story 2.2: Enhance Sales Module**: As a user, I want the Sales module to have better analytics (date filters, new cards) and an autocomplete product search in the sales form so I can process sales more efficiently. (FR11, FR12, FR13)
    - **Story 2.3: Enhance Repairs Module**: As a user, I want the Repairs module to have better analytics (date filters, cost card) and an autocomplete parts search in the repair form so I can manage repair jobs more effectively. (FR17, FR18, FR19)
    - **Story 2.4: Enhance Stock & Customer Modules**: As an admin, I want the Stock and Customer modules to provide more context (product counts) and better analytics so I can manage my inventory and customer data more efficiently. (FR5, FR6, FR7, FR21, FR4)
    - **Story 2.5: Implement Recent Activities Feed**: As an admin, I want a "Recent Activities" feed on the dashboard so I can stay updated on the latest events in the system. (FR25)

### Epic 3: Business Intelligence & Administration Module

- **Description**: This Epic introduces two new, distinct modules to the system: a PDF reporting engine and a system settings panel, providing powerful new tools for business administration.
- **Stories**:
    - **Story 3.1: Create Settings Page Foundation**: As an admin, I want a new "Settings" page where I can manage my business profile information. This includes creating the new database table and the UI form. (FR33, FR34)
    - **Story 3.2: Implement Stock Threshold Setting**: As an admin, I want to be able to set a custom "Low Stock Threshold" in the Settings page so that the dashboard alert is tailored to my business needs. (FR36)
    - **Story 3.3: Create Reporting Page**: As an admin, I want a new "Reports" page where I can select the type of report (Sales, Repairs) and the desired month. (FR29, FR31)
    - **Story 3.4: Implement PDF Generation Logic**: As an admin, I want the system to generate a well-formatted PDF report based on my selection, incorporating my business name and logo from the settings. (FR30, FR32, FR35)