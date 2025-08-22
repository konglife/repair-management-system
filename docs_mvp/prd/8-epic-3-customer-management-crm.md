# 8. Epic 3: Customer Management (CRM)

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
