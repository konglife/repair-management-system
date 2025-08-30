# Date and Time Handling Guide

## Overview
This document outlines the standardized approach for handling dates and times throughout the Repair Management System to ensure consistency and prevent timezone-related issues.

## Problem Statement
Previously, the system experienced timezone shift issues where dates selected by users would appear differently in the database and reports due to JavaScript's automatic UTC conversion when sending Date objects to the server.

## Solution Implementation

### 1. Date Input Normalization
When sending date data to the server, all dates are normalized to noon (12:00 PM) in the local timezone to prevent timezone shift issues:

```typescript
// ✅ Correct approach - Set time to noon
const normalizedDate = new Date(
  selectedDate.getFullYear(), 
  selectedDate.getMonth(), 
  selectedDate.getDate(), 
  12, 0, 0
);

// ❌ Incorrect approach - Direct date object
const directDate = selectedDate; // May cause timezone issues
```

### 2. Date Display Formatting
For consistent date display across the application, use the `formatDisplayDate()` utility function:

```typescript
import { formatDisplayDate } from "~/lib/utils";

// ✅ Correct approach
const displayDate = formatDisplayDate(dateFromDatabase);

// ❌ Incorrect approach
const displayDate = new Date(dateFromDatabase).toLocaleDateString();
```

### 3. Utility Functions

#### `formatDisplayDate(date: Date | string): string`
Formats dates consistently for display in the UI.

#### `getLocalDateString(date: Date): string`
Converts a Date object to a local date string in YYYY-MM-DD format for server-side processing.

## Implementation Status

### ✅ Fixed Components

#### Stock/Purchase Management (`src/app/(main)/stock/page.tsx`)
- **Form Submission**: Purchase dates are normalized to noon before sending to server
- **Display**: Uses `formatDisplayDate()` for consistent date display in tables
- **Search**: Date search functionality uses normalized date formatting

```typescript
// Purchase form submission
createPurchaseMutation.mutate({
  productId: selectedProductForPurchase,
  quantity,
  costPerUnit,
  purchaseDate: new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate(), 12, 0, 0)
});

// Table display
<TableCell>{formatDisplayDate(purchase.purchaseDate)}</TableCell>
```

#### Sales Management (`src/app/(main)/sales/page.tsx`)
- **Form Submission**: Sale dates are normalized to noon before sending to server
- **Display**: Uses `formatDisplayDate()` for consistent date display in tables

```typescript
// Sale form submission
createSaleMutation.mutate({
  customerId: selectedCustomerId,
  items: saleItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
  })),
  saleDate: saleDate ? new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate(), 12, 0, 0) : undefined,
});

// Table display
<TableCell>{formatDisplayDate(sale.createdAt)}</TableCell>
```

#### Repairs Management (`src/app/(main)/repairs/page.tsx`)
- **Form Submission**: Repair dates are normalized to noon before sending to server
- **Display**: Uses consistent date formatting throughout

#### Reports System (`src/server/api/routers/reports.ts`)
- **Data Processing**: Uses `getLocalDateString()` for consistent date formatting in report data
- **Output**: All date fields in reports use standardized formatting

```typescript
// Report data transformation
const salesData: SalesData[] = sales.map(sale => ({
  date: getLocalDateString(sale.createdAt),
  // ... other fields
}));

const repairsData: RepairsData[] = repairs.map(repair => ({
  date: getLocalDateString(repair.createdAt),
  // ... other fields
}));
```

## Best Practices

### 1. Form Date Handling
Always normalize dates to noon when sending to the server:

```typescript
const handleSubmit = () => {
  const normalizedDate = selectedDate ? 
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0) : 
    undefined;
  
  mutation.mutate({
    // ... other fields
    date: normalizedDate
  });
};
```

### 2. Display Formatting
Use utility functions for consistent display:

```typescript
import { formatDisplayDate } from "~/lib/utils";

// In components
<span>{formatDisplayDate(item.createdAt)}</span>
```

### 3. Search Functionality
Use formatted dates for search consistency:

```typescript
const searchByDate = (items: Item[], searchTerm: string) => {
  return items.filter(item => {
    const dateString = formatDisplayDate(item.createdAt).toLowerCase();
    return dateString.includes(searchTerm.toLowerCase());
  });
};
```

## Testing Considerations

### Date Consistency Tests
- Verify that dates selected in forms match dates displayed in tables
- Test across different timezones to ensure consistency
- Validate that search functionality works with formatted dates

### Edge Cases
- Handle undefined/null dates gracefully
- Test with dates at timezone boundaries (midnight, etc.)
- Verify report generation with various date ranges

## Migration Notes

### Changes Made
1. **Form Submissions**: All date inputs now normalize to noon before server submission
2. **Display Logic**: Replaced `toLocaleDateString()` with `formatDisplayDate()` utility
3. **Search Logic**: Updated to use consistent date formatting
4. **Reports**: Server-side date formatting uses `getLocalDateString()` utility

### Breaking Changes
None - all changes are backward compatible and improve data consistency.

## Future Considerations

### Timezone Support
If the application needs to support multiple timezones in the future:
1. Store timezone information with dates
2. Implement timezone-aware display functions
3. Add timezone selection in user preferences

### Date Range Queries
For complex date range queries, consider:
1. Using date-only comparisons on the server side
2. Implementing date range validation utilities
3. Adding date range picker components with built-in normalization

---

**Last Updated**: February 2025  
**Version**: 2.1.0  
**Status**: ✅ All timezone issues resolved