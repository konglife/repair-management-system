# 8\. Core Workflows

### 1\. User Login & Session Verification Workflow

**Goal:** To show the sequence of operations when a user logs into the system and makes a call to a protected API.

```mermaid
sequenceDiagram
    actor User
    participant Browser (Frontend)
    participant Clerk
    participant Backend (tRPC API)

    User->>Browser (Frontend): Visits the website
    Browser (Frontend)->>Backend (tRPC API): Tries to fetch protected data
    Backend (tRPC API)->>Browser (Frontend): Responds with "Unauthorized"
    Browser (Frontend)->>User: Displays Clerk's Login page
    User->>Clerk: Enters Username/Password
    Clerk-->>Browser (Frontend): Authentication successful, sends Session Token
    Browser (Frontend)->>Backend (tRPC API): Fetches data again with Session Token
    Backend (tRPC API)->>Clerk: Verifies the token's validity
    Clerk-->>Backend (tRPC API): Token is valid
    Backend (tRPC API)-->>Browser (Frontend): Sends the requested data
    Browser (Frontend)-->>User: Displays the Dashboard page
```

-----

### 2\. Create New Sale Workflow

**Goal:** To show the sequence of operations from when a user clicks to create a new sales invoice to the point of saving the data and deducting product stock, which is a core business workflow.

```mermaid
sequenceDiagram
    actor User
    participant SalesView (Frontend)
    participant TransactionService (tRPC)
    participant StockService (tRPC)
    participant Prisma Client
    participant NeonDB

    User->>SalesView (Frontend): Fills out the sales form (selects customer, products, quantity)
    User->>SalesView (Frontend): Clicks the "Save Sale" button
    SalesView (Frontend)->>TransactionService (tRPC): Calls .mutate('sales.create', { ...sales data })

    activate TransactionService (tRPC)
    TransactionService (tRPC)->>Prisma Client: Starts a Transaction (to ensure all operations succeed or fail together)
    TransactionService (tRPC)->>StockService (tRPC): Calls .mutate('stock.updateQuantities', [ ...list of items ])
    
    activate StockService (tRPC)
    StockService (tRPC)->>Prisma Client: Loops to decrease the quantity of each product item
    deactivate StockService (tRPC)

    TransactionService (tRPC)->>Prisma Client: Creates `Sale` and `SaleItem` records
    TransactionService (tRPC)->>Prisma Client: Ends the Transaction (Commit changes)
    Prisma Client->>NeonDB: Saves all data to the database
    deactivate TransactionService (tRPC)

    TransactionService (tRPC)-->>SalesView (Frontend): Responds with "Sale created successfully"
    SalesView (Frontend)-->>User: Displays "Saved successfully" message and navigates back to history page
```
