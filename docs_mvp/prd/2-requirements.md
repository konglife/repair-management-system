# 2. Requirements

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
