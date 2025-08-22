# 9. Epic 4: Core Transaction Engine: Sales & Repairs

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
