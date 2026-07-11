# Database

> **Snapshot วันที่ 2026-07-04** — generate จาก `prisma/schema.prisma`
> หากแก้ schema → อัปเดตไฟล์นี้ด้วย (หรือ regenerate)
> คำศัพท์ domain ดู `CONTEXT.md` · โครงสร้างสถาปัตยกรรมดู `docs/ARCHITECTURE.md`

## Provider

- **PostgreSQL** ผ่าน Prisma ORM 6.14
- Hosting: **Prisma Postgres (Vercel)** — แยก instance ระหว่าง prod (`main`) กับ dev (`develop`)
- Connection: `DATABASE_URL` + `DIRECT_URL` (direct สำหรับ migration)

## ER Overview

```
  Category                Unit
     │ 1                     │ 1
     │                       │
     ▼ *                     ▼ *
   ┌────────────────────────────┐         *┌────────────────┐
   │          Product           │───────────│ PurchaseRecord │  (ซื้อเข้า)
   │  name, salePrice,          │ 1       * └────────────────┘
   │  quantity, averageCost     │
   └────────────┬───────────────┘
          1     │     *
     ┌──────────┴──────────┐
     ▼ *                   ▼ *
┌──────────┐          ┌──────────┐
│ SaleItem │          │ UsedPart │
└────┬─────┘          └────┬─────┘
   * │                    * │
     ▼ 1                    ▼ 1
   ┌──────┐               ┌────────┐
   │ Sale │               │ Repair │
   └──┬───┘               └───┬────┘
      │ *                     │ *
      ▼ 1                     ▼ 1
        ┌──────────┐
        │ Customer │
        └──────────┘

  BusinessProfile  (singleton — ข้อมูลร้าน/ตั้งค่า)
```

## Models

### Category — หมวดหมู่สินค้า
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `name` | String | **@unique** |
| `products` | Product[] | relation (1-to-many) |

> ลบไม่ได้ถ้ามี Product อ้างอยู่ (ตรวจใน `categories.delete`)

### Unit — หน่วยนับ
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `name` | String | **@unique** |
| `products` | Product[] | relation (1-to-many) |

> ลบไม่ได้ถ้ามี Product อ้างอยู่

### Product — สินค้า (อะไหล่/ของในสต็อก)
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `name` | String | |
| `salePrice` | **Float** | ราคาขาย ⚠️ Float |
| `quantity` | Int | คงคลัง (default 0) |
| `averageCost` | **Float** | ต้นทุนเฉลี่ย (default 0) ⚠️ Float |
| `categoryId` | String | FK → Category |
| `unitId` | String | FK → Unit |
| `createdAt` / `updatedAt` | DateTime | auto |
| `purchaseRecords` | PurchaseRecord[] | ประวัติซื้อเข้า |
| `saleItems` | SaleItem[] | ปรากฏในงานขาย |
| `usedParts` | UsedPart[] | ปรากฏในงานซ่อม |

### PurchaseRecord — ประวัติรับสินค้าเข้า
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `quantity` | Int | จำนวนที่รับเข้า |
| `costPerUnit` | **Float** | ต้นทุนต่อหน่วย ⚠️ Float |
| `purchaseDate` | DateTime | default now |
| `productId` | String | FK → Product |

> ใช้คำนวณ `Product.averageCost` ด้วยวิธีถ่วงน้ำหนัก (ดู `docs/API-DOCS.md` → `purchases.create`)

### Customer — ลูกค้า
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `name` | String | |
| `phone` | String? | optional |
| `address` | String? | optional |
| `createdAt` | DateTime | auto |
| `sales` | Sale[] | |
| `repairs` | Repair[] | |

### Sale — งานขาย (header)
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `totalAmount` | **Float** | ยอดรวมที่ขาย ⚠️ Float |
| `totalCost` | **Float** | ต้นทุนรวม ⚠️ Float |
| `createdAt` | DateTime | auto |
| `customerId` | String | FK → Customer |
| `saleItems` | SaleItem[] | line items |

### SaleItem — รายการในงานขาย (line item)
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `quantity` | Int | |
| `priceAtTime` | **Float** | snapshot ราคาขายตอนขาย ⚠️ Float |
| `costAtTime` | **Float** | snapshot ต้นทุนตอนขาย ⚠️ Float |
| `saleId` | String | FK → Sale |
| `productId` | String | FK → Product |

### Repair — งานซ่อม (header)
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `description` | String | รายละเอียดงาน |
| `totalCost` | **Float** | **รวมค่าที่ลูกค้าจ่าย** (input) ⚠️ Float |
| `partsCost` | **Float** | ต้นทุนอะไหล่ (cost ไม่ใช่ราคาขาย) ⚠️ Float |
| `laborCost` | **Float** | = `totalCost − partsCost` (คำนวณย้อน) ⚠️ Float |
| `createdAt` | DateTime | auto |
| `customerId` | String | FK → Customer |
| `usedParts` | UsedPart[] | line items |

> ⚠️ `laborCost` เป็นยอดคงเหลือ ไม่ใช่ค่าแรงจริง → ติดลบได้ถ้า `totalCost < partsCost`

### UsedPart — อะไหล่ที่ใช้ในงานซ่อม (line item)
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `quantity` | Int | |
| `costAtTime` | **Float** | snapshot ต้นทุนเฉลี่ย ⚠️ Float (ไม่มี priceAtTime) |
| `repairId` | String | FK → Repair |
| `productId` | String | FK → Product |

### BusinessProfile — ข้อมูลร้าน (singleton)
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | String | PK, cuid |
| `shopName` | String | |
| `address` | String? | |
| `phoneNumber` | String? | |
| `contactEmail` | String? | |
| `logoUrl` | String? | ใช้ในหัวรายงาน |
| `lowStockThreshold` | Int | default 5 |

> เก็บเป็น record เดียว (logic `findFirst` ใน `settings`) ใช้สำหรับใส่หัวรายงาน + เกณฑ์สต็อกต่ำ

## ⚠️ ข้อควรทราบเรื่องการเก็บเงิน

- เก็บเงินทุกฟิลด์เป็น **`Float`** — มีความเสี่ยงเรื่อง rounding (ควรพิจารณาเป็น Decimal/Int-cents)
- ดูปัญหาโมเดลราคางานซ่อมใน `docs/API-DOCS.md` → section "ปัญหาที่ทราบ"

## Migration

- Schema source: `prisma/schema.prisma`
- dev: `npx prisma migrate dev` / `npx prisma db push`
- ห้าม migration บน prod โดยไม่ได้รับอนุญาต (ดู `CLAUDE.md` กฎเหล็ก)
