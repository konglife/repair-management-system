# 4\. Data Models

### 1\. Category (Product Category)

  * **Purpose:** Used for grouping products to facilitate easy management and searching.
  * **Key Attributes:**
      * `id`: `String` - Unique ID
      * `name`: `String` - Category name (e.g., "Screen Parts", "Batteries")
  * **Relationships:**
      * One Category can have many Products (One-to-Many).

#### TypeScript Interface

```typescript
interface Category {
  id: string;
  name: string;
}
```

### 2\. Unit (Unit of Measure)

  * **Purpose:** Used for defining the unit for each product item.
  * **Key Attributes:**
      * `id`: `String` - Unique ID
      * `name`: `String` - Unit name (e.g., "piece", "strip", "box")
  * **Relationships:**
      * One Unit can be used for many Products (One-to-Many).

#### TypeScript Interface

```typescript
interface Unit {
  id: string;
  name: string;
}
```

### 3\. Product (Product)

  * **Purpose:** The main model for storing information about all products and parts in stock.
  * **Key Attributes:**
      * `id`: `String` - Unique ID
      * `name`: `String` - Product name
      * `salePrice`: `Float` - Selling price per unit
      * `quantity`: `Int` - Quantity remaining in stock (will start at 0)
      * `averageCost`: `Float` - Average cost per unit (will start at 0)
      * `createdAt`: `DateTime` - Data creation date
      * `updatedAt`: `DateTime` - Last data update date
  * **Relationships:**
      * One Product belongs to only one **Category** (Many-to-One).
      * One Product has only one **Unit** of measure (Many-to-One).
      * One Product can have many **Purchase Records**.
      * One Product can be in many **Sale Items**.
      * One Product can be a **Used Part** in multiple repair jobs.

#### TypeScript Interface

```typescript
interface Product {
  id: string;
  name: string;
  salePrice: number;
  quantity: number;
  averageCost: number;
  categoryId: string;
  unitId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4\. Purchase Record (Purchase Record)

  * **Purpose:** Used to record the history of each stock purchase, which is necessary for calculating the average cost and updating inventory quantities.
  * **Key Attributes:**
      * `id`: `String` - Unique ID
      * `quantity`: `Int` - Quantity purchased in that transaction
      * `costPerUnit`: `Float` - Cost per unit for that purchase
      * `purchaseDate`: `DateTime` - Date of purchase
  * **Relationships:**
      * One Purchase Record must always be linked to one **Product** (Many-to-One).

#### TypeScript Interface

```typescript
interface PurchaseRecord {
  id: string;
  productId: string;
  quantity: number;
  costPerUnit: number;
  purchaseDate: Date;
}
```

### 5\. Customer (Customer)

  * **Purpose:** A model for storing all customer information, used for reference when creating sales or repair jobs.
  * **Key Attributes:**
      * `id`: `String` - Unique ID
      * `name`: `String` - Customer name
      * `phone`: `String` - Phone number (Optional)
      * `address`: `String` - Address (Optional)
      * `createdAt`: `DateTime` - Data creation date
  * **Relationships:**
      * One Customer can have many **Sales** (One-to-Many).
      * One Customer can have many **Repairs** (One-to-Many).

#### TypeScript Interface

```typescript
interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}
```

### 6\. Sale (Sale Transaction)

  * **Purpose:** Used to store information for each sale, including a summary and the list of items sold.
  * **Key Attributes:**
      * `id`: `String` - Unique ID
      * `totalAmount`: `Float` - Net total of the sales invoice
      * `totalCost`: `Float` - Total cost of goods sold on this invoice
      * `createdAt`: `DateTime` - Date and time the sale was created
  * **Relationships:**
      * One Sale must be linked to one **Customer** (Many-to-One).
      * One Sale can have many **Sale Items** (One-to-Many).

#### TypeScript Interface

```typescript
interface Sale {
  id: string;
  customerId: string;
  totalAmount: number;
  totalCost: number;
  createdAt: Date;
}
```

### 7\. Sale Item (Sale Item)

  * **Purpose:** A "child table" of Sale, used to store the details of each individual item sold in that transaction.
  * **Key Attributes:**
      * `id`: `String` - Unique ID
      * `quantity`: `Int` - Quantity sold
      * `priceAtTime`: `Float` - Selling price at the time of sale (copied from the Product's `salePrice`)
      * `costAtTime`: `Float` - Cost at the time of sale (copied from the Product's `averageCost`)
  * **Relationships:**
      * One Sale Item must belong to only one **Sale** (Many-to-One).
      * One Sale Item must be linked to one **Product** (Many-to-One).

#### TypeScript Interface

```typescript
interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
  costAtTime: number;
}
```

### 8\. Repair (Repair Job)

  * **Purpose:** Used to store information for each repair job, including costs and parts used.
  * **Key Attributes:**
      * `id`: `String` - Unique ID
      * `description`: `String` - Description of the repair job
      * `totalCost`: `Float` - Total repair price charged to the customer
      * `partsCost`: `Float` - Total cost of all parts used
      * `laborCost`: `Float` - Labor cost (calculated from `totalCost` - `partsCost`)
      * `createdAt`: `DateTime` - Date and time the repair job was created
  * **Relationships:**
      * One Repair must be linked to one **Customer** (Many-to-One).
      * One Repair can have many **Used Parts** (One-to-Many).

#### TypeScript Interface

```typescript
interface Repair {
  id: string;
  customerId: string;
  description: string;
  totalCost: number;
  partsCost: number;
  laborCost: number;
  createdAt: Date;
}
```

### 9\. Used Part (Part Used in Repair)

  * **Purpose:** A "child table" of Repair, used to record which parts (Products) were used in that specific repair job.
  * **Key Attributes:**
      * `id`: `String` - Unique ID
      * `costAtTime`: `Float` - Cost of the part at the time it was used (copied from the Product's `averageCost`)
  * **Relationships:**
      * One Used Part must belong to only one **Repair** (Many-to-One).
      * One Used Part must be linked to one **Product** (Many-to-One).

#### TypeScript Interface

```typescript
interface UsedPart {
  id: string;
  repairId: string;
  productId: string;
  costAtTime: number;
}
```

Understood\! Now that we have a solid data structure, the next step is to design the "gateway" that will allow the Frontend to securely and systematically access the Backend's data and functions.

-----
