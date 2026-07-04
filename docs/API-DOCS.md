# API Docs (tRPC)

> **Snapshot วันที่ 2026-07-04** — generate จาก `src/server/api/routers/`
> ทุก procedure เป็น tRPC (endpoint เดียว `/api/trpc/[...trpc]`)
> โครงสร้าง domain ดู `CONTEXT.md` · โมเดลข้อมูลดู `docs/DATABASE.md`

## ภาพรวม

- **Endpoint เดียว** ทั้งระบบ: `/api/trpc/[...trpc]`
- **10 routers** ลงทะเบียนใน `src/server/api/root.ts`:
  `categories` · `units` · `products` · `purchases` · `customers` · `sales` · `repairs` · `dashboard` · `settings` · `reports`
- **สองประเภท procedure** (`src/server/api/trpc.ts`):
  - `publicProcedure` — ไม่ตรวจ auth
  - `protectedProcedure` — ตรวจ `ctx.auth.userId` โยน `UNAUTHORIZED` ถ้าไม่ล็อกอิน

> คอนเวนชัน: ทุก procedure ในตารางด้านล่างเป็น `protectedProcedure` **ยกเว้น**ที่ระบุ `public` ไว้

---

## categories
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `getAll` | query | — | พร้อม `_count.products` |
| `create` | mutation | `{ name }` | โยน CONFLICT ถ้าชื่อซ้ำ |
| `update` | mutation | `{ id, name }` | |
| `delete` | mutation | `{ id }` | บล็อกถ้ามี product อ้างอยู่ |

## units
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `getAll` | query | — | พร้อม `_count.products` |
| `create` | mutation | `{ name }` | โยน CONFLICT ถ้าชื่อซ้ำ |
| `update` | mutation | `{ id, name }` | |
| `delete` | mutation | `{ id }` | บล็อกถ้ามี product อ้างอยู่ |

## products
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `getAll` | query | — | include category + unit, sort by name |
| `getTotalValue` | query | — | ผลรวม `quantity × averageCost` ทุกสินค้า |
| `create` | mutation | `{ name, salePrice, categoryId, unitId }` | quantity/averageCost default 0; ตรวจ category+unit มีอยู่ |
| `update` | mutation | `{ id, name, salePrice, categoryId, unitId }` | |

> `create`/`update` ไม่รับ quantity/averageCost โดยตรง — เปลี่ยนได้ผ่าน `purchases` (เข้า) หรือ `sales`/`repairs` (ออก)

## purchases — ซื้อสินค้าเข้า
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `create` | mutation | `{ productId, quantity, costPerUnit, purchaseDate? }` | **transaction**: สร้าง record + อัปเดต `quantity` & `averageCost` |
| `getByProduct` | query | `{ productId }` | ประวัติซื้อของสินค้านั้น |
| `getAll` | query | — | ทั้งหมด |

### Logic: ต้นทุนเฉลี่ยถ่วงน้ำหนัก (`purchases.create`)
```
ถ้า quantity เดิม == 0:
  newAverageCost = costPerUnit (ซื้อใหม่)
ไม่งั้น:
  newAverageCost = (qtyเดิม × avgCostเดิม + qtyใหม่ × costPerUnit) / (qtyเดิม + qtyใหม่)
```

## customers
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `getAll` | query | — | sort createdAt desc |
| `getTotalCount` | query | — | นับรวม |
| `getNewCustomersThisMonth` | query | — | นับเดือนปัจจุบัน |
| `create` | mutation | `{ name, phone?, address? }` | |
| `update` | mutation | `{ id, name, phone?, address? }` | |
| `getTransactionHistory` | query | `{ customerId }` | include sales + repairs |

## sales — งานขาย
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `getAll` | query | `{ dateRange?: "today"\|"7days"\|"1month" }` | include customer + saleItems |
| `getById` | query | `{ id }` | พร้อมคำนวณ `grossProfit = totalAmount − totalCost` |
| `create` | mutation | `{ customerId, items[], saleDate? }` | **transaction**: ตรวจสต็อก → สร้าง sale+items → หักสต็อก |
| `getAnalytics` | query | `{ dateRange? }` | totalSales, totalRevenue, averageSaleValue, topSellingProduct |

### Logic: สร้างงานขาย (`sales.create`)
- ตรวจทุก product มีอยู่ + สต็อกพอ (โยน BAD_REQUEST ถ้าไม่พอ)
- `totalAmount = Σ(salePrice × qty)`, `totalCost = Σ(averageCost × qty)`
- snapshot `priceAtTime` + `costAtTime` ใน SaleItem
- หัก `Product.quantity` ทุกตัว ภายใน `$transaction`

## repairs — งานซ่อม
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `getAll` | query | `{ dateRange? }` | include customer + usedParts |
| `getById` | query | `{ id }` | |
| `create` | mutation | `{ customerId, description, totalCost, repairDate?, usedParts[] }` | **transaction** (ดูล่าง) |
| `getAnalytics` | query | `{ dateRange? }` | totalRepairs, totalRevenue, averageRepairCost, totalLaborRevenue, totalPartsCost |

### Logic: สร้างงานซ่อม (`repairs.create`)
- ตรวจสต็อกอะไหล่พอ (เหมือน sales)
- `partsCost = Σ(averageCost × qty)` — ใช้ **ต้นทุน** ไม่ใช่ราคาขาย
- **`laborCost = input.totalCost − partsCost`** ← คำนวณย้อนจากยอดรวม
- snapshot `costAtTime = averageCost` ใน UsedPart (ไม่มี priceAtTime)
- หักสต็อก

## dashboard
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `getSummary` | query | `{ period: "today"\|"last7days"\|"thismonth" }` | รายได้/ต้นทุน/กำไร/มูลค่าสต็อก |
| `getTrendData` | query | `{ period: "last30days" }` | รายได้ vs ค่าใช้จ่ายรายวัน 30 วัน |
| `getTopProducts` | query | `{ period }` | ขายดี 5 อันดับ |
| `getRecentActivities` | query | — | 10 กิจกรรมล่าสุด (sale/repair/purchase) |
| `getLowStockAlerts` | query | — | สินค้าต่ำกว่า threshold (จาก BusinessProfile) |

## settings
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `getBusinessProfile` | query | — | `findFirst` (singleton) |
| `createOrUpdateBusinessProfile` | mutation | `{ shopName, address?, phoneNumber?, contactEmail?, logoUrl?, lowStockThreshold? }` | upsert (มี→update, ไม่มี→create) |

## reports
| Procedure | Type | Input | หมายเหตุ |
|---|---|---|---|
| `getMonthlySummary` | query ⚠️ **public** | `{ startDate, endDate }` (YYYY-MM-DD) | สรุปเดือน พร้อมข้อมูลร้าน + logo |

> ⚠️ `getMonthlySummary` เป็น `publicProcedure` — เรียกได้โดยไม่ล็อกอิน (router เดียวในระบบที่ public) รอแก้เป็น `protectedProcedure`

---

## ปัญหาที่ทราบ (Known Issues)

รวบรวมจากการอ่านโค้ด ณ วันที่ snapshot:

1. **`reports.getMonthlySummary` = publicProcedure** — auth รั่ว
2. **โมเดลราคางานซ่อมสับสน** — `laborCost = totalCost − partsCost` เป็นยอดคงเหลือ:
   - `partsCost` = ต้นทุนอะไหล่ของร้าน (cost)
   - markup อะไหล่ถูกกองรวมเข้า laborCost → แยกไม่ออกว่าลูกค้าจ่ายค่าอะไหล่ vs ค่าแรงเท่าไหร่
   - `UsedPart` ไม่มี `priceAtTime` (เก็บแค่ `costAtTime`) ต่างจาก `SaleItem`
3. **`laborCost` ติดลบได้** — ถ้า owner ป้อน `totalCost < partsCost`
4. **เงินเก็บเป็น `Float`** ทุกฟิลด์ — ควรเป็น Decimal/Int-cents (ดู `docs/DATABASE.md`)
