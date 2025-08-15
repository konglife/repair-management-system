# Repair Shop Back-Office System UI/UX Specification

## 1\. Introduction

### Overall UX Goals & Principles

#### Target User Personas

  * **Primary User:** A repair shop owner/novice developer who needs an easy-to-manage system, wants to reduce time spent on paperwork, and requires accurate summary data for decision-making.

#### Usability Goals

  * **Efficiency:** Able to record a new sale or repair job within 1 minute.
  * **Clarity:** Able to view stock levels and financial summaries instantly and with ease of understanding.
  * **Ease of Learning:** The interface and workflows must be simple and straightforward for users without technical expertise.

#### Design Principles

1.  **Clarity over Cleverness:** Prioritize clarity and ease of understanding above all else.
2.  **Efficiency First:** Design workflows to have the minimum number of clicks for frequently performed tasks.
3.  **Consistency:** The user interface patterns, buttons, and data displays must be consistent across all pages.

## 2\. Information Architecture (IA)

### Site Map / Screen Inventory

Here is the complete sitemap for the system as we defined it in the PRD.

```mermaid
graph TD
    A[Login Page] --> B(Dashboard);
    B --> C[Stock Management];
    B --> D[Sales];
    B --> E[Repairs];
    B --> F[Customers];
    B --> G[User Profile / Logout];
```

### Navigation Structure

  * **Primary Navigation:** Will be a vertical sidebar menu that is persistently displayed after the user logs in. The menu will consist of links to the 5 main pages: Dashboard, Stock Management, Sales, Repairs, and Customers.
  * **Secondary Navigation:** Will be located within each main page. For example, on the "Stock Management" page, there will be sub-menus or Tabs to choose between "Products", "Categories", and "Units".
  * **Breadcrumb Strategy:** A breadcrumb trail will be displayed at the top of the content area to show the user's current location (e.g., Home \> Stock Management \> Products), helping to prevent users from getting lost.

## 3\. User Flows

### User Flow: Create a New Sale

  * **User Goal:** To accurately and quickly record a new sales transaction by selecting a customer, adding products, and summarizing the sale.
  * **Entry Points:** Click the "Create New Sale" button from the "Sales" page.
  * **Success Criteria:** A new sales invoice is created successfully, product stock is correctly deducted, and the user is navigated back to the sales list page where the latest invoice is visible.

#### Flow Diagram

```mermaid
graph TD
    A[Sales Page] -->|Click 'Create New Sale'| B(Create Sale Form);
    B --> C{Select Customer};
    C -->|Existing Customer| D[Select from list];
    C -->|New Customer| E[Open 'Add Customer' dialog];
    E --> F[Save new customer info];
    F --> D;
    D --> G[Search and add product];
    G --> H[Specify quantity];
    H --> I{Add more products?};
    I -->|Yes| G;
    I -->|No| J[Review total amount];
    J --> K[Click 'Save Sale'];
    K --> L[System: Save data & deduct stock];
    L --> M[Return to Sales History page];
    M --> N[Display "Save successful" message];

```

#### Edge Cases & Error Handling:

  * What happens if the selected product has insufficient stock?
  * What happens if the user tries to save a sales invoice with no items?
  * What happens if the database connection fails during saving?

## 4\. Wireframes & Mockups

**Primary Design Files:** Will be created by an AI UI tool based on the outlines defined below.

### Key Screen Layouts

#### 1\. Dashboard Page

  * **Purpose:** To provide a quick overview of the business's health on a single page.
  * **Key Elements:**
      * Header: "Dashboard"
      * Time Range Selector: (Dropdown: Today, Last 7 Days, This Month)
      * Row of Summary Cards: (5 cards for Expenses, Repair Income, Sales Income, Sales Profit, Repair Profit)
      * Main Content Area: (For displaying the line trend graph)

#### 2\. Stock Management Page

  * **Purpose:** To view the list of all products and manage stock-related information.
  * **Key Elements:**
      * Header: "Stock Management"
      * Primary Action Buttons: "+ Add New Product", "+ Record Purchase"
      * Sub-menu (Tabs): "Products", "Categories", "Units"
      * Product Data Table: With columns (Name, Category, Quantity, Selling Price, etc.)
      * Action buttons in each table row: (Edit, Delete)

## 5\. Component Library / Design System

### Design System Approach

We will use a **pre-built UI Component Library** to give the application a beautiful and consistent look without building everything from scratch. It is recommended to use **Shadcn/ui**, which is a modern and highly flexible option.

### Core Components

Here is a list of the basic components that will be needed from the chosen library:

  * **Button:** For all actions.
  * **Table:** For displaying lists of data.
  * **Card:** For displaying summary information on the Dashboard.
  * **Input:** For all forms.
  * **Select/Dropdown:** For selecting data from a list.
  * **Dialog/Modal:** For displaying confirmation messages or sub-forms.
  * **Tabs:** For switching views on the same page.

## 6\. Branding & Style Guide

### Color Palette

| Color Type | Hex Code | Usage |
| :--- | :--- | :--- |
| Primary | `#3B82F6` | For primary buttons, links |
| Success | `#22C55E` | For success states |
| Error | `#EF4444` | For error messages |
| Neutral | `#111827` - `#F9FAFB`| For backgrounds, text |

### Typography

  * **Font Families:**
      * **Primary:** **"Prompt"** (Supports Thai, easy to read on screens)
  * **Type Scale:**
      * **H1:** 30px Bold
      * **Body:** 16px Regular

### Iconography

  * **Icon Library:** Recommended to use **"Lucide Icons"** (lucide.dev)

## 7\. Accessibility Requirements

  * **Standard:** Adhere to **Best Practices**, such as using colors with sufficient contrast, enabling keyboard navigation, and using Semantic HTML.

## 8\. Responsiveness Strategy

We will use a **"Mobile-First"** approach, using standard breakpoints to adjust the layout to fit mobile, tablet, and desktop screen sizes.

## 9\. Animation & Micro-interactions

Animations will be **simple and purposeful**, such as changing color on button hover or a fade-in effect for pop-up dialogs to make the user experience feel smooth.

## 10\. Performance Considerations

  * **Goals:** Fast page load times (under 2.5 seconds) and immediate responsiveness to user actions.
  * **Strategies:** Image compression, loading only necessary components (Lazy Loading).

## 11\. Next Steps

### Immediate Actions

1.  **Handoff to Architect:** Hand this document over to the **Architect** to design the architecture and select the Technology Stack.
2.  **Prepare for AI UI Generation:** After the Architect's work is complete, I can return to help create prompts for the AI UI Generation tool.

-----