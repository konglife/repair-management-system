"use client";

import React from 'react';
import { formatCurrency } from "~/lib/utils";
import type { OverviewMetricsProps } from './types';

const OverviewMetricsComponent: React.FC<OverviewMetricsProps> = ({ overview }) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">ภาพรวม</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
            <span className="font-medium">Expenses (ค่าใช้จ่าย):</span>
            <span className="font-bold">{formatCurrency(overview.expenses)}</span>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
            <span className="font-medium">Total Repairs (จำนวนงานซ่อม):</span>
            <span className="font-bold">{overview.totalRepairs} งาน</span>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
            <span className="font-medium">Total Sales (จำนวนงานขาย):</span>
            <span className="font-bold">{overview.totalSales} งาน</span>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
            <span className="font-medium">Sales Profit (กำไรงานขาย):</span>
            <span className="font-bold">{formatCurrency(overview.salesProfit)}</span>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
            <span className="font-medium">Repair Income (รายได้จากงานซ่อม):</span>
            <span className="font-bold">{formatCurrency(overview.repairIncome)}</span>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
            <span className="font-medium">Sales Income (รายได้จากงานขาย):</span>
            <span className="font-bold">{formatCurrency(overview.salesIncome)}</span>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
            <span className="font-medium">Repair Profit (กำไรงานซ่อม):</span>
            <span className="font-bold">{formatCurrency(overview.repairProfit)}</span>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
            <span className="font-medium">Gross Profit (กำไรขั้นต้น):</span>
            <span className="font-bold">{formatCurrency(overview.grossProfit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewMetricsComponent;