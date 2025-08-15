# 9\. Database Schema

In this section, we will convert all the Data Models we designed in Section 4 into code that **Prisma** can understand to generate our PostgreSQL database. This file is typically named `schema.prisma`.

### Prisma Schema Definition

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// 1. Define the database provider
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Pulled from the .env file
}

// 2. Define the Prisma Client to be generated
generator client {
  provider = "prisma-client-js"
}

// =================================================================
// Data Models
// =================================================================

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  products Product[] // Relation: One Category can have many Products
}

model Unit {
  id       String    @id @default(cuid())
  name     String    @unique
  products Product[] // Relation: One Unit can have many Products
}

model Product {
  id            String    @id @default(cuid())
  name          String
  salePrice     Float
  quantity      Int       @default(0)
  averageCost   Float     @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  category      Category   @relation(fields: [categoryId], references: [id])
  categoryId    String
  unit          Unit       @relation(fields: [unitId], references: [id])
  unitId        String
  
  purchaseRecords PurchaseRecord[]
  saleItems       SaleItem[]
  usedParts       UsedPart[]
}

model PurchaseRecord {
  id           String   @id @default(cuid())
  quantity     Int
  costPerUnit  Float
  purchaseDate DateTime @default(now())

  // Relation
  product      Product @relation(fields: [productId], references: [id])
  productId    String
}

model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String? // ? means optional field
  address   String?
  createdAt DateTime @default(now())

  // Relations
  sales     Sale[]
  repairs   Repair[]
}

model Sale {
  id          String     @id @default(cuid())
  totalAmount Float
  totalCost   Float
  createdAt   DateTime   @default(now())

  // Relations
  customer    Customer   @relation(fields: [customerId], references: [id])
  customerId  String
  saleItems   SaleItem[]
}

model SaleItem {
  id          String @id @default(cuid())
  quantity    Int
  priceAtTime Float
  costAtTime  Float

  // Relations
  sale        Sale    @relation(fields: [saleId], references: [id])
  saleId      String
  product     Product @relation(fields: [productId], references: [id])
  productId   String
}

model Repair {
  id          String     @id @default(cuid())
  description String
  totalCost   Float
  partsCost   Float
  laborCost   Float
  createdAt   DateTime   @default(now())

  // Relations
  customer    Customer   @relation(fields: [customerId], references: [id])
  customerId  String
  usedParts   UsedPart[]
}

model UsedPart {
  id         String @id @default(cuid())
  costAtTime Float

  // Relations
  repair     Repair  @relation(fields: [repairId], references: [id])
  repairId   String
  product    Product @relation(fields: [productId], references: [id])
  productId  String
}
```
