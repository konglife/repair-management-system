# 10. Epic 5: Dashboard & Business Intelligence

**Epic Goal:** This final Epic will bring everything together by creating the main Dashboard as designed. The goal is to give you an immediate overview of your business's health, reducing the time needed for manual data summarization to zero. By the end of this Epic, the application's core value—saving time and providing clear insights—will be fully delivered.

### Story 5.1: Create Dashboard Data API

**As a** Developer,
**I want** a single, efficient API endpoint that provides all the summary data required for the Dashboard,
**so that** the front-end can load all its data with one request.

#### Acceptance Criteria

1.  A new API endpoint is created (e.g., `GET /api/dashboard-summary`).
2.  The endpoint can accept a time range parameter (e.g., "today", "last7days", "thismonth").
3.  The endpoint returns a JSON object with complete summary data:
    * Total expenses from purchases
    * Total income from repairs
    * Total income from sales
    * Gross profit from sales
    * Gross profit from repairs (labor cost)
4.  The endpoint returns data for the trend graph (e.g., total daily income/expenses over the last 30 days).
5.  This endpoint must be protected and can only be called by a logged-in user.

### Story 5.2: Display Summary Cards on Dashboard

**As a** User,
**I want** to see key business metrics in summary cards on the Dashboard,
**so that** I can quickly understand the current state of my business.

#### Acceptance Criteria

1.  The Dashboard is the first page displayed after the user logs in.
2.  This page calls the Dashboard Data API to fetch data for display.
3.  There is an option (e.g., Dropdown) to change the time range for the summary ("Today", "Last 7 Days", "This Month").
4.  Five summary cards clearly display data from the API (Expenses, Repair Income, Sales Income, Sales Profit, Repair Profit).
5.  When the user changes the time range, all data on the cards must be updated accordingly.

### Story 5.3: Display Trend Graph on Dashboard

**As a** User,
**I want** to see a line graph showing the trend of my income versus expenses,
**so that** I can visually track the financial health of my business over time.

#### Acceptance Criteria

1.  A line graph component is added to the Dashboard page.
2.  The graph uses data from the Dashboard Data API.
3.  The graph displays 2 lines: 1) Total daily income (sales + repairs) and 2) Total daily expenses (purchases).
4.  The X-axis of the graph shows the last 30 days.
5.  The graph must be easy to read and have a clear legend.

---
