# 2. Requirements
*(ส่วนนี้คือข้อกำหนด FR1-FR36 ทั้งหมดที่เรารวบรวมกันมา)*

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
