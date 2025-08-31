"use client";

import React from 'react';
import { formatReportDate } from "~/lib/utils";
import type { ReportHeaderProps } from './types';

const ReportHeader: React.FC<ReportHeaderProps> = ({ shopInfo, reportPeriod }) => {
  return (
    <div className="mb-6">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold mb-1">{shopInfo.name}</h1>
        <p className="text-sm">{shopInfo.address}</p>
        <h2 className="text-lg font-bold mt-3">
          Summary Report {formatReportDate(reportPeriod.startDate)} - {formatReportDate(reportPeriod.endDate)}
        </h2>
      </div>
    </div>
  );
};

export default ReportHeader;