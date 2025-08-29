"use client";

import React from 'react';
import { formatCurrency as utilsFormatCurrency, formatReportDate } from "~/lib/utils";

// TypeScript interfaces for component props
interface ShopInformation {
  name: string;
  address: string;
  phone: string;
}

interface OverviewMetrics {
  expenses: number;
  totalRepairs: number;
  totalSales: number;
  salesProfit: number;
  repairIncome: number;
  salesIncome: number;
  repairProfit: number;
  grossProfit: number;
}

interface SalesData {
  date: string;
  totalCost: number;
  netTotal: number;
  totalAmount: number;
  grossProfit: number;
}

interface RepairsData {
  date: string;
  description: string;
  partsCost: number;
  laborCost: number;
  totalCost: number;
}

interface SummaryData {
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  shopInfo: ShopInformation;
  overview: OverviewMetrics;
  salesData: SalesData[];
  repairsData: RepairsData[];
}

interface ReportViewProps {
  data?: SummaryData;
}

// Mock data for development
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
      grossProfit: 2500
    },
    {
      date: '2025-08-08',
      totalCost: 7800,
      netTotal: 12500,
      totalAmount: 5,
      grossProfit: 4700
    },
    {
      date: '2025-08-12',
      totalCost: 15000,
      netTotal: 25000,
      totalAmount: 8,
      grossProfit: 10000
    }
  ],
  repairsData: [
    {
      date: '2025-08-02',
      description: 'เปลี่ยนแบตเตอรี่รถมอเตอร์ไซค์',
      partsCost: 1200,
      laborCost: 500,
      totalCost: 1700
    },
    {
      date: '2025-08-05',
      description: 'ซ่อมแผงวงจรทีวี',
      partsCost: 800,
      laborCost: 1500,
      totalCost: 2300
    },
    {
      date: '2025-08-11',
      description: 'ล้างและปรับแต่งคาร์บูเรเตอร์',
      partsCost: 400,
      laborCost: 1000,
      totalCost: 1400
    }
  ]
};

const ReportView: React.FC<ReportViewProps> = ({ data = mockData }) => {
  // Use consistent formatting utilities
  const formatCurrency = utilsFormatCurrency;
  const formatDate = formatReportDate;



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          รายงานสรุปข้อมูลรายเดือน
        </h1>
        <p className="text-gray-600 mb-4">
          Report Period: {formatDate(data.reportPeriod.startDate)} - {formatDate(data.reportPeriod.endDate)}
        </p>
        
        {/* Shop Information Panel */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
          <div className="font-medium">{data.shopInfo.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {data.shopInfo.address} · {data.shopInfo.phone}
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">ภาพรวม</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
              <span className="font-medium">Expenses (ค่าใช้จ่าย):</span>
              <span className="font-bold">{formatCurrency(data.overview.expenses)}</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
              <span className="font-medium">Total Repairs (จำนวนงานซ่อม):</span>
              <span className="font-bold">{data.overview.totalRepairs} งาน</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
              <span className="font-medium">Total Sales (จำนวนงานขาย):</span>
              <span className="font-bold">{data.overview.totalSales} งาน</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
              <span className="font-medium">Sales Profit (กำไรงานขาย):</span>
              <span className="font-bold">{formatCurrency(data.overview.salesProfit)}</span>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
              <span className="font-medium">Repair Income (รายได้จากงานซ่อม):</span>
              <span className="font-bold">{formatCurrency(data.overview.repairIncome)}</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
              <span className="font-medium">Sales Income (รายได้จากงานขาย):</span>
              <span className="font-bold">{formatCurrency(data.overview.salesIncome)}</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
              <span className="font-medium">Repair Profit (กำไรงานซ่อม):</span>
              <span className="font-bold">{formatCurrency(data.overview.repairProfit)}</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
              <span className="font-medium">Gross Profit (กำไรขั้นต้น):</span>
              <span className="font-bold">{formatCurrency(data.overview.grossProfit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-6"></div>

      {/* Sales Table */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">ตารางรายละเอียดจากงานขาย</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-left font-bold whitespace-nowrap">Date</th>
                <th className="border border-gray-200 px-3 py-2 text-right font-bold">Total Cost</th>
                <th className="border border-gray-200 px-3 py-2 text-right font-bold">Net Total</th>
                <th className="border border-gray-200 px-3 py-2 text-right font-bold">Total Amount</th>
                <th className="border border-gray-200 px-3 py-2 text-right font-bold">Gross Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.salesData.map((sale, index) => (
                <tr key={index}>
                  <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">{formatDate(sale.date)}</td>
                  <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(sale.totalCost)}</td>
                  <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(sale.netTotal)}</td>
                  <td className="border border-gray-200 px-3 py-2 text-right">{sale.totalAmount} ชิ้น</td>
                  <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(sale.grossProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-6"></div>

      {/* Repairs Table */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">ตารางรายละเอียดจากงานซ่อม</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-left font-bold whitespace-nowrap">Date</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-bold">Description</th>
                <th className="border border-gray-200 px-3 py-2 text-right font-bold">Parts Cost</th>
                <th className="border border-gray-200 px-3 py-2 text-right font-bold">Labor Cost</th>
                <th className="border border-gray-200 px-3 py-2 text-right font-bold">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.repairsData.map((repair, index) => (
                <tr key={index}>
                  <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">{formatDate(repair.date)}</td>
                  <td className="border border-gray-200 px-3 py-2">{repair.description}</td>
                  <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(repair.partsCost)}</td>
                  <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(repair.laborCost)}</td>
                  <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(repair.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      <div className="text-sm text-gray-600 mt-4">
        * ค่าเงินแสดงเป็นบาท (฿)
      </div>
    </div>
  );
};

export default ReportView;