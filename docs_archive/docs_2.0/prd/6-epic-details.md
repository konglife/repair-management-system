# 6. Epic Details

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