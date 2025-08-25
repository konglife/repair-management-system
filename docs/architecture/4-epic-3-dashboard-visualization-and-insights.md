# **4. Epic 3: Dashboard Visualization and Insights**

### **4.1. Technical Approach**

#### **Graph Improvement (FR8.1, FR8.3, FR9.2)**
* **Recommendation:**
    * **Income vs Expenses:** Change the chart type in `recharts` to a **Grouped Bar Chart**.
    * **Top 5 Products/Customers:** Create new dedicated API routes (e.g., `/api/dashboard/top-products`) that perform the aggregation on the server for the current month.
* **Implementation:** Update the dashboard page components to use the new chart types and fetch data from these new API routes.

#### **Filter Scoping (FR8.2)**
* **Recommendation:** Decouple the date range state from the data fetching logic for the graphs.
* **Implementation:**
    1.  The date range state will be passed *only* to the data-fetching hooks for the Stat Cards.
    2.  The data-fetching hooks for the graphs will be called without date parameters.

#### **New Components & API (FR9.1)**
* **Recommendation:** Create a new API route and a corresponding frontend component for the activity feed.
* **API Endpoint:** `/api/dashboard/recent-activity`: Fetches the last 5-10 sale or repair records.
* **Frontend Component:** Create a new "Recent Activity Feed" React component and integrate it into the dashboard page.