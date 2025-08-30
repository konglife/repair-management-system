"use client";

import React from 'react';
import ReportHeader from './ReportHeader';
import OverviewMetricsComponent from './OverviewMetrics';
import SalesTable from './SalesTable';
import RepairsTable from './RepairsTable';
import PurchasesTable from './PurchasesTable';
import type { ReportViewProps, SummaryData, PurchaseRecordDetail } from './types';

// Mock data for development with enhanced structure
const mockData: SummaryData = {
  reportPeriod: {
    startDate: '2025-08-01',
    endDate: '2025-08-31'
  },
  shopInfo: {
    name: 'ชื่อร้าน (ข้อมูลจากตั้งค่าของระบบ)',
    address: '27/14 หมู่ 1 ต.บางทอง อ.ท้ายเหมือง จ.พังงา 82120',
    phone: '089-973-2275'
  },
  overview: {
    expenses: 835000,
    totalRepairs: 42,
    totalSales: 18,
    salesProfit: 854000,
    repairIncome: 126000,
    salesIncome: 89000,
    repairProfit: 91000,
    grossProfit: 145000
  },
  salesData: [
    {
      date: '2025-08-01',
      totalCost: 2500,
      netTotal: 5000,
      totalAmount: 10,
      grossProfit: 2500,
      saleItems: [{ name: 'สายชาร์จ iPhone' }, { name: 'ฟิล์มกันรอย' }]
    },
    {
      date: '2025-08-08',
      totalCost: 7800,
      netTotal: 12500,
      totalAmount: 5,
      grossProfit: 4700,
      saleItems: [{ name: 'เคสโทรศัพท์' }, { name: 'หูฟัง Bluetooth' }]
    },
    {
      date: '2025-08-12',
      totalCost: 15000,
      netTotal: 25000,
      totalAmount: 8,
      grossProfit: 10000,
      saleItems: [{ name: 'แบตเตอรี่โทรศัพท์' }, { name: 'ลำโพงพกพา' }, { name: 'ที่ชาร์จไร้สาย' }]
    }
  ],
  repairsData: [
    {
      date: '2025-08-02',
      description: 'เปลี่ยนแบตเตอรี่รถมอเตอร์ไซค์',
      partsCost: 1200,
      laborCost: 500,
      totalCost: 1700,
      usedParts: [{ name: 'แบตเตอรี่ 12V', costAtTime: 1200 }]
    },
    {
      date: '2025-08-05',
      description: 'ซ่อมแผงวงจรทีวี',
      partsCost: 800,
      laborCost: 1500,
      totalCost: 2300,
      usedParts: [{ name: 'คาปาซิเตอร์', costAtTime: 400 }, { name: 'ไอซี', costAtTime: 400 }]
    },
    {
      date: '2025-08-11',
      description: 'ล้างและปรับแต่งคาร์บูเรเตอร์',
      partsCost: 400,
      laborCost: 1000,
      totalCost: 1400,
      usedParts: [{ name: 'ยางซีลคาร์บู', costAtTime: 200 }, { name: 'น้ำมันหล่อลื่น', costAtTime: 200 }]
    }
  ],
  purchaseData: [
    {
      id: 'p1',
      quantity: 10,
      costPerUnit: 250,
      purchaseDate: '2025-08-01',
      product: { name: 'สายชาร์จ iPhone' }
    },
    {
      id: 'p2',
      quantity: 5,
      costPerUnit: 1500,
      purchaseDate: '2025-08-03',
      product: { name: 'แบตเตอรี่ 12V' }
    },
    {
      id: 'p3',
      quantity: 20,
      costPerUnit: 150,
      purchaseDate: '2025-08-05',
      product: { name: 'ฟิล์มกันรอย' }
    }
  ]
};

const ReportView: React.FC<ReportViewProps> = ({ data = mockData }) => {
  // Handle API response structure differences
  // API returns 'purchaseRecordsData' but component expects 'purchaseData'
  const purchaseData: PurchaseRecordDetail[] = data.purchaseRecordsData || data.purchaseData || [];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header Section */}
      <ReportHeader 
        shopInfo={data.shopInfo} 
        reportPeriod={data.reportPeriod} 
      />

      {/* Overview Section */}
      <OverviewMetricsComponent overview={data.overview} />

      {/* Divider */}
      <div className="h-px bg-gray-200 my-6"></div>

      {/* Sales Table */}
      <SalesTable salesData={data.salesData || []} />

      {/* Divider */}
      <div className="h-px bg-gray-200 my-6"></div>

      {/* Repairs Table */}
      <RepairsTable repairsData={data.repairsData || []} />

      {/* Divider */}
      <div className="h-px bg-gray-200 my-6"></div>

      {/* Purchase Records Table */}
      <PurchasesTable purchaseData={purchaseData} />

      {/* Notes */}
      <div className="text-sm text-gray-600 mt-4">
        * ค่าเงินแสดงเป็นบาท (฿)
      </div>
    </div>
  );
};

export default ReportView;