# Requirements

### Functional Requirements
- **FR1**: When a user clicks the "Generate Report" button on the `/reports` page, the application must navigate them to a new report summary page.
- **FR2**: The new report page must accept `startDate` and `endDate` parameters (e.g., via URL query params) to fetch the correct data.
- **FR3**: The report summary page must display sales and repair data corresponding to the selected date range.
- **FR4**: The layout of the report page must adhere to the format specified in the `monthly_report_html_starter_prompt.html` reference file.
- **FR5**: The page must correctly render all text, including Thai characters and vowels.

### Non-Functional Requirements
- **NFR1**: The report page should load the summary data efficiently, displaying a loading state while data is being fetched.
- **NFR2**: The page must be responsive and display correctly on various screen sizes (desktop, tablet, mobile).
- **NFR3**: The "Prompt" font from Google Fonts must be used for rendering text on the page.

### Compatibility Requirements
- **CR1**: The feature must fetch data from the existing `reports.getMonthlySummary` tRPC router without altering its core logic.
- **CR2**: The changes should not negatively impact the functionality of any other part of the application.

---

