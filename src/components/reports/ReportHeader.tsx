"use client";

import React from 'react';
import { formatReportDate } from "~/lib/utils";
import type { ReportHeaderProps } from './types';

const ReportHeader: React.FC<ReportHeaderProps> = ({ shopInfo, reportPeriod }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        รายงานสรุปข้อมูลรายเดือน
      </h1>
      <p className="text-gray-600 mb-4">
        Report Period: {formatReportDate(reportPeriod.startDate)} - {formatReportDate(reportPeriod.endDate)}
      </p>
      
      {/* Shop Information Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
        <div className="font-medium">{shopInfo.name}</div>
        <div className="text-sm text-gray-600 mt-1">
          {shopInfo.address} · {shopInfo.phone}
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;