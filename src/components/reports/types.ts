// TypeScript interfaces for Report components

export interface ShopInformation {
  name: string;
  address: string;
  phone: string;
}

export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

export interface OverviewMetrics {
  expenses: number;
  totalRepairs: number;
  totalSales: number;
  salesProfit: number;
  repairIncome: number;
  salesIncome: number;
  repairProfit: number;
  grossProfit: number;
}

// Enhanced interface with saleItems array
export interface SalesData {
  date: string;
  totalCost: number;
  netTotal: number;
  totalAmount: number;
  grossProfit: number;
  saleItems: { name: string }[];
}

// Enhanced interface with usedParts array
export interface RepairsData {
  date: string;
  description: string;
  partsCost: number;
  laborCost: number;
  totalCost: number;
  usedParts: { name: string; costAtTime: number; quantity: number }[];
}

// New interface for purchase records data
// API returns Date objects for purchaseDate, but components handle both string and Date
export interface PurchaseRecordDetail {
  id: string;
  quantity: number;
  costPerUnit: number;
  purchaseDate: string | Date;
  product: { name: string };
}

// Enhanced interface with purchaseData array
export interface SummaryData {
  reportPeriod: ReportPeriod;
  shopInfo: ShopInformation;
  overview: OverviewMetrics;
  salesData: SalesData[];
  repairsData: RepairsData[];
  purchaseData?: PurchaseRecordDetail[];
  purchaseRecordsData?: PurchaseRecordDetail[];
}

// Component Props interfaces
export interface ReportHeaderProps {
  shopInfo: ShopInformation;
  reportPeriod: ReportPeriod;
}

export interface OverviewMetricsProps {
  overview: OverviewMetrics;
}

export interface SalesTableProps {
  salesData: SalesData[];
}

export interface RepairsTableProps {
  repairsData: RepairsData[];
}

export interface PurchasesTableProps {
  purchaseData: PurchaseRecordDetail[];
}

export interface ReportViewProps {
  data?: SummaryData;
}