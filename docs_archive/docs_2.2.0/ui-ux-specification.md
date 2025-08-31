แน่นอนครับ Sally ยืนยันการรับทราบและจะดำเนินการตามแนวทางที่คุณยืนยันมาครับ

และถูกต้องอีกครั้งครับ **ลำดับชั้นของ Heading (h1, h2, h3) มีความสำคัญอย่างยิ่ง** สำหรับกระบวนการ `shard-doc` เพราะเป็นตัวกำหนดการแบ่งไฟล์ ผมจะจัดรูปแบบเอกสารให้ถูกต้องตามมาตรฐานครับ

นี่คือเอกสาร **UI/UX Specification: Report Page Enhancement (V2.2.0)** ฉบับสมบูรณ์ (ภาษาอังกฤษ) ที่แก้ไขตามแนวทาง "เอกสารสำหรับพิมพ์" ที่คุณต้องการแล้วครับ คุณสามารถคัดลอกไปใช้งานใน IDE ของคุณได้เลย

***

# **UI/UX Specification: Report Page Enhancement (V2.2.0)**

## **Introduction**

### **Document Purpose**
This document defines the user experience (UX) and user interface (UI) specifications for the enhancement of the `/reports/summary` page in the Repair Management System, version 2.2.0. It translates the requirements from the PRD into a tangible design direction for architects and developers.

### **Overall UX Goals & Principles**
- **Clarity and Professionalism**: The primary goal is to transform the report page into a professional, document-style report. The design should feel clean, organized, and authoritative, aligning with the aesthetic of a printed document.
- **Data Accessibility**: Users must be able to quickly scan and understand key metrics in the overview, and dive into the details in the tables without feeling overwhelmed.
- **Consistency**: The new design elements must remain consistent with the existing visual identity of the application, primarily leveraging the `shadcn/ui` component library and Tailwind CSS utility classes.

### **Change Log**

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-08-30 | 1.1 | Revised Overview section to a "printed document" style based on user feedback. | Sally (UX Expert) |
| 2025-08-29 | 1.0 | Initial draft for v2.2.0 enhancements. | Sally (UX Expert) |

---

## **Key Screen Layouts: `/reports/summary`**

This enhancement focuses exclusively on the report summary page.

### **Overview Section Redesign (Revised to "Printed Document" Style)**
To maintain a consistent "printed document" style that aligns with the existing data tables, the Overview section will be redesigned from a dashboard/card layout to a formal report header format.

- **Report Header**: A header section will be added to the top of the page, containing:
    - **Shop Name**: Sourced from `shopInfo.name`.
    - **Address**: Sourced from `shopInfo.address`.
    - **Report Title**: Static text, e.g., "Summary Report".
    - **Date Period**: Dynamic text, e.g., "For the period of [startDate] to [endDate]".
- **Metrics Overview Layout**:
    - The 8 key metrics will be arranged in a clean, two-column list format below the header.
    - Each item will consist of a text label followed by a bolded value (e.g., `Sales Income: **฿15,000.00**`).
    - This layout will avoid using `Card` components, borders, background colors, or shadows to maintain a minimalist, paper-like aesthetic.
- **Separators**: Horizontal rules (`<hr>`) will be used to cleanly divide the Header, the Overview metrics, and the main data tables.

### **Data Table Enhancements**
All tables will be updated to include more contextual data and financial summaries.

- **Sales Table**:
    - **New Column**: Add a column titled **"Sale Items"**. The cell will list the `name` of each product sold. For multiple items, names should be listed clearly (e.g., separated by commas).
    - **New Footer Row**: Add a **"Total"** row at the bottom of the table (`<TableFooter>`) to provide the sum for the following columns: `Total Cost`, `Net Total`, `Gross Profit`.
- **Repairs Table**:
    - **New Column**: Add a column titled **"Parts Used"**. The cell will list the `name` and `costAtTime` for each part used.
    - **New Footer Row**: Add a **"Total"** row at the bottom to provide the sum for `Parts Cost`, `Labor Cost`, and `Total Cost`.
- **New! Purchase Records Table**:
    - **Purpose**: To display a clear record of all stock purchases.
    - **Columns**: `Date`, `Product Name`, `Quantity`, `Cost Per Unit`, `Total Cost`.
    - **New Footer Row**: Add a **"Total"** row at the bottom to provide a sum for the `Total Cost` column.

---

## **Component Library & Style Guide**

### **Component Usage**
- **Existing Library**: Continue to exclusively use components from the `shadcn/ui` library.
- **Primary Components for Implementation**:
    - Standard HTML tags (`div`, `h2`, `p`, `hr`) and Tailwind CSS for the Report Header and Overview section layout.
    - `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`, `TableFooter` for all data tables.

### **Typography and Color**
- **Font**: Continue using the "Prompt" Google Font as defined in the application's global styles.
- **Color Palette**: Adhere to the existing minimalist, black-and-white, document-like style. Use bold text (`font-bold`) for emphasis on metric values and totals, rather than color.

---

## **Responsiveness Strategy**

- **Desktop-First Design**: The design is designed with PC devices in mind.
Two-column overview items will be stacked in a single column on small screens. Tables will need to scroll horizontally to remain readable.


- **Breakpoints**: Utilize the default Tailwind CSS breakpoints (`sm`, `md`, `lg`, `xl`) to adjust layouts as needed.

---