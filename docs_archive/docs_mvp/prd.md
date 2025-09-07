# Repair Shop Back-Office System Product Requirements Document (PRD)

## 1. Goals and Background Context

### Goals

* Reduce the time spent on daily/monthly accounting and stock summarization by at least 90%.
* Increase the accuracy of stock and financial data to 100%.
* Users can view the correct remaining stock balance within 5 seconds.
* Users can record a new sale or repair job within 1 minute.
* Users can view the current month's income-expense summary instantly from the Dashboard.

### Background Context

This project aims to solve the operational problems of a small repair shop that relies on manual bookkeeping. Currently, processes ranging from sales, repairs, stock management, and financial summaries are all manual, which is time-consuming and carries a risk of errors.

This Back-Office system will be built to replace these processes. It will help reduce time spent on paperwork, increase data accuracy, and present summary data through an easy-to-understand Dashboard to improve business decision-making.

### Change Log

| Date          | Version | Description        | Author     |
| :------------ | :------ | :----------------- | :--------- |
| Aug 12, 2025  | 1.0     | Initial PRD creation | John (PM)  |
| Aug 19, 2025  | 1.1     | Updated with Story 4.3 implementation planning | Claude Code |

## 2. Requirements

### Functional Requirements

* **FR1:** The system must have a Dashboard page to summarize key business information (income, expenses, profit) and display a trend graph.
* **FR2:** The user must be able to Add, View, Edit, Delete (CRUD) product data, including stock quantity and average cost.
* **FR3:** The user must be able to Add, View, Edit, Delete (CRUD) data for product Categories and Units.
* **FR4:** The system must have a function for recording stock purchases (Purchase Records) to be used for updating stock.
* **FR5:** The system must automatically calculate and update the Average Cost of a product when a new purchase is recorded.
* **FR6:** The user must be able to Add, View, Edit, Delete (CRUD) sales data and the list of items in a sales invoice.
* **FR7:** The user must be able to Add, View, Edit, Delete (CRUD) repair job data and the list of spare parts used.
* **FR8:** The user must be able to Add, View, Edit, Delete (CRUD) customer data.
* **FR9:** The system must be able to calculate the gross profit for each sale and repair transaction.
* **FR10:** The Dashboard must display a trend graph of income versus expenses.

### Non-Functional Requirements

* **NFR1:** The system must be designed for a single user.
* **NFR2:** The User Interface (UI) must be simple, easy to understand, and convenient for users without technical expertise.
* **NFR3:** Displaying data, such as viewing stock, must take no more than 5 seconds.
* **NFR4:** Core workflows, such as creating a sales invoice or a repair job, must be completable within 1 minute.
* **NFR5:** The chosen architecture and technology must be easy to maintain and extend in the future for a single developer.
* **NFR6:** Infrastructure costs should be kept as low as possible, primarily by trying to use services within their Free-tier.

## 3. User Interface Design Goals

### Overall UX Vision

The user experience (UX) should be clean, straightforward, and efficient. The design will prioritize clarity over complex aesthetics to allow a single user to learn and use the system with minimal guidance. The goal is to make daily data entry a quick and non-tedious task.

### Key Interaction Paradigms

* Use standard CRUD forms for data entry (Create, Read, Update, Delete).
* Data will be displayed in sortable tables.
* The Dashboard will use simple cards and graphs to display summary information.
* Navigation will use a persistent main menu on the side (Sidebar).

### Core Screens and Views

As we've concluded, the main screen structure of the system will be as follows:
* Dashboard (Overview page)
* Stock Management
* Sales
* Repairs
* Customers

### Accessibility

* **Assumption:** For this first version (MVP), there will be no formal targeting of web accessibility standards (e.g., WCAG), but the design will adhere to best practices for readability and ease of use.

### Branding

* **Assumption:** No specific Brand Guideline has been defined yet. The design will use a clean, modern, and neutral color palette.

### Target Device and Platforms

The application will be a Responsive Web App, designed for optimal use on a Desktop Browser, but core functions will still be usable via Tablet or Mobile.

## 4. Technical Assumptions

### Repository Structure: Monorepo

* **Rationale:** For ease of managing Full Stack code, configuration, and code sharing between the Front-end and Back-end for a single developer.

### Service Architecture: Monolith

* **Rationale:** To reduce the complexity of development, testing, and deployment for the first version (MVP), making it easier to understand the entire system's overview.

### Testing Requirements: Unit + Integration Tests

* **Rationale:** To build a strong testing foundation and ensure code quality without creating an excessive workload for a first project.

### Additional Technical Assumptions and Requests

* The chosen technology stack should be:
    * Beginner-friendly
    * Have a free tier for deployment
    * Easy to manage and maintain
* Modern tools should be considered as options in the architecture design, such as:
    * **Authentication:** Clerk
    * **ORM:** Prisma
    * **Database:** vercel DB (Postgres) or an equivalent database.

## 5. Epic List

**Epic 1: Project Setup & User Authentication**
* **Goal:** Create the project and set up all necessary tools, along with installing a robust Authentication system (e.g., Clerk) to manage logins, which is an excellent foundation for modern web app development.

**Epic 2: Product & Stock Management**
* **Goal:** Develop a comprehensive product stock management system, including management of Products, Categories, Units, and a system for recording stock purchases (Purchase Records) to calculate average cost.

**Epic 3: Customer Management (CRM)**
* **Goal:** Create a complete customer data management system (CRUD) to serve as a central hub for all customer information, which will be linked to sales and repairs.

**Epic 4: Core Transaction Engine: Sales & Repairs**
* **Goal:** Develop the core business functions: creating and managing Sales invoices and Repair jobs, correctly linking them to customers and stock items.

**Epic 5: Dashboard & Business Intelligence**
* **Goal:** Bring all the data generated in the system (from Epics 2, 3, 4) together and display it on the Dashboard to provide a business overview, summarize key figures, and show data analysis graphs.

## 6. Epic 1: Project Setup & User Authentication

**Epic Goal:** The main goal of this Epic is to build a strong and scalable foundation for the entire application. This includes setting up a Monorepo project structure, installing basic tools, and implementing a secure user authentication system. By the end of this Epic, we will have a project that can actually run, with a complete login/logout system, which is the necessary first step before starting to build other business functions.

### Story 1.1: Initial Project Scaffolding

**As a** Developer,
**I want** to set up the Monorepo project structure with a basic Front-end and Back-end application,
**so that** I have a clean foundation to start building features.

#### Acceptance Criteria

1.  The Monorepo is created and configured.
2.  A basic Front-end application (Placeholder) exists within the Monorepo.
3.  A basic Back-end application (Placeholder) exists within the Monorepo.
4.  Basic development tools (e.g., Linter, Formatter) are installed.
5.  The project can be run in development mode without errors.

### Story 1.2: User Authentication Setup

**As a** User,
**I want** to be able to sign up, log in, and log out of the application,
**so that** my data is secure and I have a personal session.

#### Acceptance Criteria

1.  A user can create a new account.
2.  A registered user can log in with their credentials.
3.  A logged-in user can log out.
4.  Unauthenticated users cannot access pages that require a login.
5.  The authentication system is connected to an external service, such as Clerk, as specified in the Technical Assumptions.

### Story 1.3: Protected Navigation & User Profile Display

**As a** logged-in User,
**I want** to see a main navigation menu (sidebar) and my user information,
**so that** I can access different parts of the application and confirm I am logged in.

#### Acceptance Criteria

1.  When a user logs in, the main menu (Sidebar) must be displayed.
2.  The main menu contains placeholder items for the planned pages (Dashboard, Stock, etc.).
3.  The name or email of the currently logged-in user is displayed on the screen.
4.  There is a functional button for logging out.
5.  When the user logs out, the main menu is hidden, and the system navigates back to the login page.

## 7. Epic 2: Product & Stock Management

**Epic Goal:** This Epic focuses on creating a complete Inventory Management system. We will build functionality to manage the entire lifecycle of a product, from adding it to the system with its category and unit, to recording stock purchases which will automatically calculate the average cost. By the end of this Epic, you will have a fully functional system to track all products and their costs, which is the necessary foundation for the subsequent Sales and Repairs Epics.

### Story 2.1: Manage Product Categories

**As a** User,
**I want** to be able to add, view, edit, and delete product categories,
**so that** I can organize my products effectively.

#### Acceptance Criteria

1.  The user can create a new Category with a name.
2.  The user can view a list of all existing Categories.
3.  The user can edit the name of an existing Category.
4.  The user can delete an existing Category (with a confirmation dialog).
5.  All these functions are located within the "Stock Management" page.

### Story 2.2: Manage Product Units

**As a** User,
**I want** to be able to add, view, edit, and delete product units,
**so that** I can specify how my products are measured.

#### Acceptance Criteria

1.  The user can create a new Unit with a name (e.g., "piece", "box", "meter").
2.  The user can view a list of all existing Units.
3.  The user can edit the name of an existing Unit.
4.  The user can delete an existing Unit (with a confirmation dialog).
5.  All these functions are located within the "Stock Management" page.

### Story 2.3: Manage Products

**As a** User,
**I want** to be able to add, view, and edit products in my catalog,
**so that** I have a central record of all my inventory items.

#### Acceptance Criteria

1.  The user can create a new Product with the following information: name, selling price, Category, and Unit.
2.  When a new Product is created, the quantity and average_cost are initialized to 0.
3.  The user can view a list of all Products with all their related information.
4.  The user can edit the details (name, selling price, Category, Unit) of an existing Product.
5.  Deleting a Product will not be implemented in this version to prevent data corruption (but may have an 'inactive' status in the future).

### Story 2.4: Record Stock Purchases

**As a** User,
**I want** to record a new stock purchase for a product,
**so that** the stock quantity and average cost are updated correctly.

#### Acceptance Criteria

1.  The user can initiate a "Record Purchase" from the "Stock Management" page.
2.  The user selects an existing Product, enters the quantity purchased, and the cost per unit for that purchase.
3.  Upon saving, the system creates a new `Purchase_Record`.
4.  The `quantity` of the selected Product is increased by the amount purchased.
5.  The `average_cost` of the selected Product is recalculated based on the weighted average principle.
6.  The user can view the purchase history for each Product.

## 8. Epic 3: Customer Management (CRM)

**Epic Goal:** This Epic aims to build a simple yet effective Customer Relationship Management (CRM) system to serve as a central hub for all customer data, making it easy to track and serve them. By the end of this Epic, you will be able to manage a customer list and view the purchase/repair history of each individual, which is essential for linking data in the next Epic.

### Story 3.1: Add and View Customers

**As a** User,
**I want** to be able to add new customers and view a list of all my existing customers,
**so that** I can maintain a central record of everyone I do business with.

#### Acceptance Criteria

1.  The user can access the "Customers" page from the main menu.
2.  The "Customers" page displays a list of all existing customers, showing at least their name and phone number.
3.  There is an "Add New Customer" button.
4.  When the button is pressed, a form for entering new customer information (name, phone number, address) is displayed.
5.  Upon saving, the new customer appears in the customer list.

### Story 3.2: Edit Customer Details

**As a** User,
**I want** to be able to edit the details of an existing customer,
**so that** I can keep their information up to date.

#### Acceptance Criteria

1.  From the customer list page, the user can choose to "edit" the information of each customer.
2.  The edit form must display the customer's current information (name, phone number, address).
3.  The user can update the information and save the changes.
4.  The updated information is correctly displayed on the customer list page.

### Story 3.3: View Customer Transaction History

**As a** User,
**I want** to view a specific customer's history of sales and repairs,
**so that** I can understand their past interactions with my shop.

#### Acceptance Criteria

1.  From the customer list page, the user can click to view a "Customer Details Page".
2.  The details page displays the customer's information (name, phone number, address).
3.  The details page displays all **Sales** history associated with this customer.
4.  The details page displays all **Repairs** history associated with this customer.
5.  (Optional) Items in the history can be clicked to view the details of that specific sale/repair invoice.

## 9. Epic 4: Core Transaction Engine: Sales & Repairs

**Epic Goal:** This Epic is the heart of the system, focusing on developing the primary daily workflows: creating and managing sales invoices and repair jobs. We will link customer data (from Epic 3) with product data (from Epic 2) to accurately record transactions, deduct stock, and precisely calculate cost-profit. By the end of this Epic, the application will be able to fully support the shop's main daily operations.

### Story 4.1: Create a New Sale Record

**As a** User,
**I want** to create a new sale transaction by selecting a customer and adding products,
**so that** I can accurately record sales as they happen.

#### Acceptance Criteria

1.  The user can start "Create New Sale" from the "Sales" page.
2.  The user must select a "Customer" from the existing customer list (from Epic 3).
3.  The user can search for and add multiple "Products" (from Epic 2) to the sales invoice.
4.  For each product item, the user can specify the quantity sold.
5.  The system will automatically pull the `price_at_time` from the product's current selling price.
6.  The system will calculate the subtotal for each item and the net `total_amount` for the entire invoice.
7.  When the sales invoice is saved, the `quantity` of each sold product is deducted from the stock.
8.  The system will record the `cost_at_time` for each product item from its current `average_cost`.
9.  The new sales invoice appears in the sales history list.

### Story 4.2: View Sale Details

**As a** User,
**I want** to view the details of a past sale, including all the items sold,
**so that** I can review historical transactions.

#### Acceptance Criteria

1.  From the sales history list page, the user can click to view the details of each sales invoice.
2.  The details page must display the customer's name, sale date, and net total.
3.  The details page must display a list of all `Sale_Item`s in that invoice, along with quantity and price.
4.  (Optional) The details page can display the calculated gross profit for that sales invoice.

### Story 4.3: Create a New Repair Job

**As a** User,
**I want** to create a new repair job by selecting a customer, describing the job, adding parts used, and setting a total price,
**so that** I can manage my repair services.

#### Acceptance Criteria

1.  The user can start "Create New Repair Job" from the "Repairs" page.
2.  The user must select a "Customer".
3.  The user must enter a "Job Title" or description.
4.  The user can search for and add multiple "Products (spare parts)" from stock to the repair job.
5.  For each spare part, the system records the `cost_at_time` from the product's current `average_cost`.
6.  The user must enter the `total_cost` (the total repair price agreed upon with the customer).
7.  When the repair job is saved, the `quantity` of each spare part used is deducted from the stock.
8.  The new repair job appears in the repair job history list.

**Technical Design:** Architecture and UI workflows have been designed. Implementation will include repair job creation form, parts selection, automatic stock deduction, and cost calculations (parts cost + labor cost). The repair model uses `description` field for job title as defined in the database schema.

### Story 4.4: View Repair Job Details

**As a** User,
**I want** to view the details of a past repair job, including all the parts used and cost breakdown,
**so that** I can review my work and profitability.

#### Acceptance Criteria

1.  From the repair job history list page, the user can click to view the details of each repair job.
2.  The details page must display the customer's name, job title, date, and `total_cost`.
3.  The details page must display a list of all `Used_Part`s in that job, along with their costs.
4.  The details page must display the `parts_cost` (total cost of all parts), calculated by summing the costs of the parts.
5.  The details page must display the `labor_cost` (labor/profit), calculated from `total_cost` - `parts_cost`.

## 10. Epic 5: Dashboard & Business Intelligence

**Epic Goal:** This final Epic will bring everything together by creating the main Dashboard as designed. The goal is to give you an immediate overview of your business's health, reducing the time needed for manual data summarization to zero. By the end of this Epic, the application's core value—saving time and providing clear insights—will be fully delivered.

### Story 5.1: Create Dashboard Data API

**As a** Developer,
**I want** a single, efficient API endpoint that provides all the summary data required for the Dashboard,
**so that** the front-end can load all its data with one request.

#### Acceptance Criteria

1.  A new API endpoint is created (e.g., `GET /api/dashboard-summary`).
2.  The endpoint can accept a time range parameter (e.g., "today", "last7days", "thismonth").
3.  The endpoint returns a JSON object with complete summary data:
    * Total expenses from purchases
    * Total income from repairs
    * Total income from sales
    * Gross profit from sales
    * Gross profit from repairs (labor cost)
4.  The endpoint returns data for the trend graph (e.g., total daily income/expenses over the last 30 days).
5.  This endpoint must be protected and can only be called by a logged-in user.

### Story 5.2: Display Summary Cards on Dashboard

**As a** User,
**I want** to see key business metrics in summary cards on the Dashboard,
**so that** I can quickly understand the current state of my business.

#### Acceptance Criteria

1.  The Dashboard is the first page displayed after the user logs in.
2.  This page calls the Dashboard Data API to fetch data for display.
3.  There is an option (e.g., Dropdown) to change the time range for the summary ("Today", "Last 7 Days", "This Month").
4.  Five summary cards clearly display data from the API (Expenses, Repair Income, Sales Income, Sales Profit, Repair Profit).
5.  When the user changes the time range, all data on the cards must be updated accordingly.

### Story 5.3: Display Trend Graph on Dashboard

**As a** User,
**I want** to see a line graph showing the trend of my income versus expenses,
**so that** I can visually track the financial health of my business over time.

#### Acceptance Criteria

1.  A line graph component is added to the Dashboard page.
2.  The graph uses data from the Dashboard Data API.
3.  The graph displays 2 lines: 1) Total daily income (sales + repairs) and 2) Total daily expenses (purchases).
4.  The X-axis of the graph shows the last 30 days.
5.  The graph must be easy to read and have a clear legend.

---
