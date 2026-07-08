# Test Debt Fix Plan — แก้ `npm test` ให้เขียว

> เริ่ม: 64 test แดง / 9 suite แดง (สำรวจเซสชัน 2026-07-05)
> เป้า: `npm test` + `npm run lint` + typecheck **เขียวทั้งหมด** เป็นพื้นฐานก่อน TDD ของ C1 และ `setup-pre-commit`

---

## ✅ แก้แล้ว (5 suite เขียว)

| Suite                                    | สาเหตุเดิม                                                                                                                                                                  | ที่แก้                                                                                                                                                                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(main)/layout.test.tsx`         | `usePathname is not a function` (mock `next/navigation` มีแค่ `useRouter`) + stale `"Repair Management"`/`John Doe`/email/User fallback                                     | เพิ่ม `usePathname: jest.fn(() => '/dashboard')` เข้า mock · title เปลี่ยนเป็น `"Repair Shop 2.3.0.DEV"` · ลบ assertion ที่ test user name/email (component ใช้ Clerk `UserButton` แล้ว ไม่โชว์เอง) → เช็ค `user-button` testid แทน |
| `src/components/layout/sidebar.test.tsx` | stale `getByText("Repair Shop")` (จริงคือ `"Repair Shop 2.3.0.DEV"`)                                                                                                        | เปลี่ยน 2 จุดเป็น `getByText(/Repair Shop/)` (substring)                                                                                                                                                                            |
| `src/app/(main)/settings/page.test.tsx`  | `useUtils is not a function` + ปุ่มเปลี่ยน + form ไม่ submit                                                                                                                | เพิ่ม `useUtils` mock · `"Save Business Profile"` → `"Save Settings"` · `fireEvent.click(submitButton)` → `fireEvent.submit(form)`                                                                                                  |
| `src/app/(main)/customers/page.test.tsx` | `getByLabelText(/phone/i)` ชน `SearchInput` (aria-label "Search by name, phone, or address...") + edit button `{ name: '' }` ชน `title="Edit Customer"` + loading state "0" | anchor regex `/^phone$/i`, `/^address$/i` · edit button `{ name: /edit customer/i }` · loading ใช้ spinner assertion · mock `getTotalCount` คู่กับ `getAll`                                                                         |
| `src/app/(main)/dashboard/page.test.tsx` | **HANG** (infinite loop) + stale ($→฿, 5→7 cards, grid `lg:grid-cols-5`→`7`)                                                                                                | ดูรายละเอียดด้านล่าง                                                                                                                                                                                                                |

### 🔍 root cause ของ dashboard hang

- **ตัวแฮงก์จริง = test เดียว:** `Summary Cards Tests › has responsive grid layout` — test เดิมไล่หา grid container ด้วย `while` ที่เรียก `parentElement.querySelector('[class*="grid"]')` (วิ่ง**ลง** ไม่ใช่ขึ้น) → querySelector คืนตัวแรกที่เจอ = ตัวเดิมซ้ำ → **infinite loop** (ไม่ใช่ waitFor/react-query เหมือนที่สงสัย)
- **วิธีหาที่ได้ผล:** รันทีละ describe block ด้วย `-t "<group>"` + `timeout` wrapper — กลุ่มอื่นออกหมด ติดที่ `Summary Cards Tests` → ซูม `-t` ทีละ test → ติดที่ grid layout ตัวเดียว
- **แก้:** แทน loop ทั้งก้อนด้วย `expensesCard.closest('[class*="lg:grid-cols-7"]')` (ไล่ขึ้น ancestor) + เปลี่ยน class คาดหวังเป็น `lg:grid-cols-7`
- **stale assertions อื่นที่แก้ตาม (component source of truth):**
  - `formatCurrency` ใช้ `฿` ไม่ใช่ `$` → แปลงทุก assertion `$x`→`฿x`
  - การ์ดเพิ่มเป็น 7 ใบ (+`Stock Value`, +`Gross Profit`) → skeleton/loading `$0.00` count `5`→`7`, mockSummaryData เติม `totalStockValue`+`grossProfit`
  - `'This Month'` ปรากฏซ้ำ (trigger value + dropdown option) → `getByText` ชน → เปลี่ยนเป็น `getByRole('option', {name})` (scope เฉพาะ dropdown portal)

### `src/app/(main)/stock/page.test.tsx` (14 fail)

ยังไม่สำรวจลึก น่าจะโดน pattern เดียวกัน (useUtils mock / stale UI / form submit) — ตรวจก่อนแก้

### `src/app/(main)/reports/page.test.tsx` (1 fail)

"shows loading state during form submission" → น่าจะ pattern form-submit-via-click (ใช้ `fireEvent.submit`)

### `src/app/(main)/reports/summary/page.test.tsx` (2 fail)

"render enhanced data" / "handle missing enhanced data arrays" → stale assertion (ดู `getMonthlySummary` shape ปัจจุบัน vs test)

### `src/app/(main)/repairs/[id]/page.test.tsx` — suite failed to run

อ่านไม่ได้เลย (อาจเป็น import/syntax error) — รันดู error ก่อน

### typecheck 1 จุด: `src/components/reports/SalesTable.test.tsx:104` (TS2352)

trivial cast — ดูและแก้

---

## ✅ ผลลัพธ์ (2026-07-06) — ทั้งหมดเขียว

| Suite                               | ผล                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `dashboard/page.test.tsx`           | 15/15 เขียว (แก้ hang + stale $→฿/5→7 cards/grid)                                            |
| `stock/page.test.tsx`               | 14/14 เขียว, **0 skip** (6 skips rewrite ขับ EntityPicker เสร็จ 2026-07-08 — ด้านล่าง)       |
| `reports/page.test.tsx`             | 8/8 เขียว (loading assertion เปลี่ยนเป็น navigation เพราะ isLoading ถูก batch หายไปก่อนเห็น) |
| `reports/summary/page.test.tsx`     | 8/8 เขียว (`Test Part (฿1,200)`→`Test Part x1`, `-` count เป็น `>=2`)                        |
| `repairs/[id]/page.test.tsx`        | 20/20 เขียว (root cause 2 ข้อ — ด้านล่าง)                                                    |
| typecheck `SalesTable.test.tsx:104` | `as SalesData[]` → `as unknown as SalesData[]`                                               |

**Gate รวม:** `npm test` 51 suite / 629 pass / 7 skip / 0 fail · `npm run lint` สะอาด · `npx tsc --noEmit` สะอาด

### 🔍 root cause `repairs/[id]` suite-failed-to-run

- `import { jest, ... } from "@jest/globals"` → **babel-jest ไม่ hoist `jest.mock`** (เพราะ `jest` เป็น module binding ไม่ใช่ global) → mock สมัครช้ากว่า `import RepairDetailPage` → โหลด `~/app/providers` จริง → superjson (ESM) → `SyntaxError: Cannot use import statement outside a module`
- **แก้:** ตัด `@jest/globals` import (ใช้ global jest ตามมาตรฐาน repo) + ทำ mock factory self-contained (เหมือน stock) + `mockReturnValue` ใน beforeEach. หลังจากนั้นเป็น stale-UI ธรรมดา ("Found multiple elements" → `getAllByText`)
- **Pattern ใหม่:** อย่า `import { jest } from "@jest/globals"` ใน repo นี้ (ทำ mock hoisting พัง) — เพิ่มเป็น pattern #9

### ✅ stock/page.test.tsx — 6 skips rewrite เสร็จ (2026-07-08)

เดิม component เปลี่ยน paradigm: native `<select>` → EntityPicker, form toggle-revealed ผ่าน "Add Purchase", `$`→`฿`. เคย defer 6 skips หลัง C1 — **ตอนนี้เขียนใหม่ขับ ProductPicker ครบ 0 skip** (pattern เก็บไว้ใน `docs/HANDOFF.md` section "rewrite stock skips").

---

## 🔑 Pattern ที่เจอ (สำคัญ — ใช้กับ suite ที่เหลือ)

1. **`usePathname is not a function`** → mock `next/navigation` ต้องมีทั้ง `useRouter` และ `usePathname`
2. **`useUtils is not a function`** → mock tRPC ต้องมี `useUtils: () => ({ <router>: { <query>: { invalidate: jest.fn() } } })`
3. **`fireEvent.click(submitButton)` ไม่ submit form ใน jsdom เวอร์ชันนี้** → ใช้ `fireEvent.submit(form)` (ดู memory `jsdom-submit-button-no-submit.md`)
4. **`getByLabelText(/phone/i)` ชน SearchInput** → anchor regex `/^phone$/i` (SearchInput มี `aria-label="Search ${placeholder}"`)
5. **icon-only button ที่มี `title`** → accessible name = title ไม่ใช่ `""` → query `{ name: /title/i }`
6. **ค่าเงิน/ตัวเลข stale** → `formatCurrency` ใช้ `฿` (ดู `src/lib/utils.ts`); component เปลี่ยน card count/grid class บ่อย → อ่าน component ก่อนเขียน assertion
7. **DOM traversal ใน test ต้อง `closest` (ไล่ขึ้น) ไม่ใช่ `parentElement.querySelector` (วิ่งลง)** → วิ่งลงทำ infinite loop ได้ (สาเหตุ dashboard hang จริง)
8. **Radix Select: option text ซ้ำกับ trigger value** → query ด้วย `getByRole('option', {name})` แทน `getByText` (dropdown render ใน portal แยกจาก trigger)
9. **ห้าม `import { jest } from "@jest/globals"` ใน repo นี้** → ทำให้ babel-jest ไม่ hoist `jest.mock` → mock สมัครช้า → โหลด module จริง (superjson ESM) → suite failed to run. ใช้ global `jest`/`describe`/`it`/`expect`/`beforeEach` แทน
10. **isLoading toggle รอบ router mock sync** → handler ทำ `setIsLoading(true)`→`router.push`(mock sync)→`finally setIsLoading(false)` ใน batch เดียวกัน → loading state ไม่ถูก render → เทส loading ต้อง assert ผลลัพธ์ (navigation) แทน
11. **"Found multiple elements"** → component render text ซ้ำ (เช่น "Total Cost" card+table+breakdown, ฿ amount cost+total) → ใช้ `getAllByText(...)` + `.length` แทน `getByText`

---

## 📋 ลำดับงานที่เหลือ (แนะนำ)

1. ~~แก้ dashboard hang~~ ✅ (15/15 เขียว)
2. ~~สำรวจ + แก้ stock~~ ✅ (8 เขียว, 6 skip defer หลัง C1)
3. ~~แก้ reports + reports/summary~~ ✅
4. ~~แก้ repairs/[id]~~ ✅ (20/20 — root cause: `@jest/globals` ทำลาย mock hoisting)
5. ~~แก้ typecheck SalesTable.test.tsx:104~~ ✅
6. ~~รัน `npm test` + `npm run lint` + `npx tsc --noEmit` เขียวหมด~~ ✅ (51 suite / 629 pass / 7 skip / 0 fail)
7. → **ถัดไป:** `setup-pre-commit` (Husky + lint-staged) → TDD C1
8. (ผู้ใช้สั่ง) เปิด GitHub Issue สำหรับ stock skips + rewrite หลัง C1

---

## 📌 ขอบเขต / กฎ

- ทำบน `develop` (ห้ามแตะ `main`/prod)
- ไฟล์เทสที่แก้แล้ว **ยังไม่ commit** (เซสชันนี้แก้ไฟล์เทส 4 ไฟล์ + dashboard ที่ค้าง)
- "test ผิดหรือ component ผิด" → ตัดสินใจทีละ test; ถ้า component ถูกแล้ว (deliberate design) ให้แก้ test ตาม component
