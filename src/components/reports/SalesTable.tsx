"use client";

import React from 'react';
import { formatCurrency, formatReportDate } from "~/lib/utils";
import type { SalesTableProps } from './types';

const SalesTable: React.FC<SalesTableProps> = ({ salesData }) => {
  // Ensure salesData is an array and handle undefined/null cases
  const safeSalesData = Array.isArray(salesData) ? salesData : [];
  
  // Calculate totals for monetary columns
  const totals = safeSalesData.reduce(
    (acc, sale) => ({
      totalCost: acc.totalCost + (sale.totalCost || 0),
      netTotal: acc.netTotal + (sale.netTotal || 0),
      totalAmount: acc.totalAmount + (sale.totalAmount || 0),
      grossProfit: acc.grossProfit + (sale.grossProfit || 0),
    }),
    { totalCost: 0, netTotal: 0, totalAmount: 0, grossProfit: 0 }
  );

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">ตารางรายละเอียดจากงานขาย</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-2 text-left font-bold whitespace-nowrap">Date</th>
              <th className="border border-gray-200 px-3 py-2 text-left font-bold">Sale Items</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Total Cost</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Net Total</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Total Amount</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Gross Profit</th>
            </tr>
          </thead>
          <tbody>
            {safeSalesData.map((sale, index) => (
              <tr key={index}>
                <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                  {formatReportDate(sale.date || '')}
                </td>
                <td className="border border-gray-200 px-3 py-2">
                  {sale.saleItems && Array.isArray(sale.saleItems) && sale.saleItems.length > 0 
                    ? sale.saleItems.map(item => item.name).join(', ') 
                    : '-'}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right">
                  {formatCurrency(sale.totalCost || 0)}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right">
                  {formatCurrency(sale.netTotal || 0)}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right">
                  {sale.totalAmount || 0} ชิ้น
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right">
                  {formatCurrency(sale.grossProfit || 0)}
                </td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">Total</td>
              <td className="border border-gray-200 px-3 py-2">-</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(totals.totalCost)}</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(totals.netTotal)}</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{totals.totalAmount} ชิ้น</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(totals.grossProfit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;