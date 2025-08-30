# 7. Epic 2: Product & Stock Management

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
