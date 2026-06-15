# Repair Management System (ระบบจัดการงานซ่อม) By Konlife

ระบบจัดการงานซ่อมสำหรับร้านค้า ช่วยบริหารจัดการสต็อกสินค้า, การขาย, การซ่อม, และข้อมูลลูกค้า พร้อมสรุปรายงานเพื่อการวิเคราะห์

## ✨ Features (คุณสมบัติหลัก)

-   **Dashboard:** ภาพรวมธุรกิจ, สินค้าใกล้หมด, และกิจกรรมล่าสุด
-   **Stock Management:** จัดการข้อมูลสินค้า, หมวดหมู่, และหน่วยนับ
-   **Sales & Repairs:** บันทึกรายการขายและงานซ่อม
-   **Customer Management:** จัดการข้อมูลลูกค้าและประวัติการใช้บริการ
-   **Reports:** สรุปยอดขาย, ต้นทุน, และกำไรรายวัน/เดือน
-   **User Authentication:** ระบบล็อคอินที่ปลอดภัยด้วย Clerk

## 🛠️ Tech Stack (เทคโนโลยีที่ใช้)

-   **Framework:** Next.js
-   **Language:** TypeScript
-   **API:** tRPC
-   **Database:** Prisma Postgres (Vercel)
-   **Authentication:** Clerk
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui

## 🚀 Getting Started (การติดตั้งโปรเจกต์)

### Prerequisites (สิ่งที่ต้องมี)

-   Node.js (v22 or later)
-   npm or yarn
-   PostgreSQL Database

### Installation (ขั้นตอนการติดตั้ง)

1.  Clone a copy of the repository:
    ```bash
    git clone https://github.com/konglife/repair-management-system.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd repair-management-system
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Setup your environment variables by creating a `.env` file and adding the following variables. See `.env.example` for a template.
    ```env
    # Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
    CLERK_SECRET_KEY=...

    # Database URL
    DATABASE_URL="postgresql://..."
    ```
5.  Apply database migrations:
    ```bash
    npx prisma migrate dev
    ```
6.  Run the development server:
    ```bash
    npm run dev
    ```

## 📜 Available Scripts (คำสั่งที่ใช้งานได้)

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the code.

## 🔗 Live Demo

-   [Link to your deployed application]