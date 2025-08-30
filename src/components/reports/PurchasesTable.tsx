"use client";

import React from 'react';
import { formatCurrency, formatReportDate } from "~/lib/utils";
import type { PurchasesTableProps } from './types';

const PurchasesTable: React.FC<PurchasesTableProps> = ({ purchaseData }) => {
  // Ensure purchaseData is an array and handle undefined/null cases
  const safePurchaseData = Array.isArray(purchaseData) ? purchaseData : [];
  
  // Calculate totals for monetary columns
  const totals = safePurchaseData.reduce(
    (acc, purchase) => ({
      quantity: acc.quantity + (purchase.quantity || 0),
      costPerUnit: 0, // Average doesn't make sense for cost per unit
      totalCost: acc.totalCost + ((purchase.quantity || 0) * (purchase.costPerUnit || 0)),
    }),
    { quantity: 0, costPerUnit: 0, totalCost: 0 }
  );

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">ตารางรายละเอียดจากการซื้อสินค้า</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-2 text-left font-bold whitespace-nowrap">Date</th>
              <th className="border border-gray-200 px-3 py-2 text-left font-bold">Product Name</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Quantity</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Cost Per Unit</th>
              <th className="border border-gray-200 px-3 py-2 text-right font-bold">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {safePurchaseData.map((purchase, index) => {
              // Handle date formatting for both string and Date objects
              const purchaseDate = purchase.purchaseDate instanceof Date 
                ? purchase.purchaseDate.toISOString().split('T')[0] 
                : purchase.purchaseDate;
              
              return (
                <tr key={index}>
                  <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                    {formatReportDate(purchaseDate)}
                  </td>
                  <td className="border border-gray-200 px-3 py-2">
                    {purchase.product?.name || 'Unknown Product'}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-right">
                    {purchase.quantity || 0} ชิ้น
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-right">
                    {formatCurrency(purchase.costPerUnit || 0)}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-right">
                    {formatCurrency((purchase.quantity || 0) * (purchase.costPerUnit || 0))}
                  </td>
                </tr>
              );
            })}
            {/* Totals Row */}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">Total</td>
              <td className="border border-gray-200 px-3 py-2">-</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{totals.quantity} ชิ้น</td>
              <td className="border border-gray-200 px-3 py-2 text-right">-</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(totals.totalCost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchasesTable;