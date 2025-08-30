"use client";

import React from 'react';
import { formatCurrency, formatReportDate } from "~/lib/utils";
import type { RepairsTableProps } from './types';

const RepairsTable: React.FC<RepairsTableProps> = ({ repairsData }) => {
  // Ensure repairsData is an array and handle undefined/null cases
  const safeRepairsData = Array.isArray(repairsData) ? repairsData : [];
  
  // Calculate totals for monetary columns
  const totals = safeRepairsData.reduce(
    (acc, repair) => ({
      partsCost: acc.partsCost + (repair.partsCost || 0),
      laborCost: acc.laborCost + (repair.laborCost || 0),
      totalCost: acc.totalCost + (repair.totalCost || 0),
    }),
    { partsCost: 0, laborCost: 0, totalCost: 0 }
  );

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">ตารางรายละเอียดจากงานซ่อม</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-2 text-left font-bold whitespace-nowrap">Date</th>
              <th className="border border-gray-200 px-3 py-2 text-left font-bold">Description</th>
              <th className="border border-gray-200 px-3 py-2 text-left font-bold">Parts Used</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Parts Cost</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Labor Cost</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {safeRepairsData.map((repair, index) => (
              <tr key={index}>
                <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                  {formatReportDate(repair.date || '')}
                </td>
                <td className="border border-gray-200 px-3 py-2">
                  {repair.description || 'No description'}
                </td>
                <td className="border border-gray-200 px-3 py-2">
                  {repair.usedParts && Array.isArray(repair.usedParts) && repair.usedParts.length > 0
                    ? repair.usedParts.map(part => 
                        `${part.name || 'Unknown Part'} (${formatCurrency(part.costAtTime || 0)})`
                      ).join(', ')
                    : '-'}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right">
                  {formatCurrency(repair.partsCost || 0)}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right">
                  {formatCurrency(repair.laborCost || 0)}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right">
                  {formatCurrency(repair.totalCost || 0)}
                </td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">Total</td>
              <td className="border border-gray-200 px-3 py-2">-</td>
              <td className="border border-gray-200 px-3 py-2">-</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(totals.partsCost)}</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(totals.laborCost)}</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(totals.totalCost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RepairsTable;