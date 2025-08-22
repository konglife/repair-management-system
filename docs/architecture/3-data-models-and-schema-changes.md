# 3. Data Models and Schema Changes

A new model is required to support the new Settings and Reporting features. This will be implemented via a new Prisma migration.

### 3.1 New Model: `BusinessProfile`

This model will store centralized business information.

```prisma
// In prisma/schema.prisma

model BusinessProfile {
  id                String  @id @default(cuid())
  shopName          String
  address           String?
  phoneNumber       String?
  contactEmail      String?
  logoUrl           String?
  lowStockThreshold Int     @default(5)

  @@map("business_profiles")
}
````

### 3.2 Schema Integration Strategy

  - A new Prisma migration file will be generated (`prisma migrate dev --name add_business_profile`).
  - The system must handle the case where no business profile exists yet, providing default values or prompting the admin to complete the setup.

-----
