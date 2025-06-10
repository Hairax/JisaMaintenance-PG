// Business Intelligence Types

export interface BiDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface BiTimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface BiSummaryMetric {
  title: string;
  value: string | number;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
}

export interface BiChartConfig {
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
}

export interface BiDashboardData {
  summary: {
    totalOTs: number;
    completedOTs: number;
    pendingOTs: number;
    avgCompletionTime: number;
    efficiency: number;
  };
  charts: {
    otsByMonth: BiDataPoint[];
    otsByDepartment: BiDataPoint[];
    otsByType: BiDataPoint[];
    completionTrend: BiTimeSeriesPoint[];
    costAnalysis: BiDataPoint[];
  };
  filters: {
    dateRange: {
      start: string;
      end: string;
    };
    departments: string[];
    types: string[];
  };
}

export interface BiFilterOptions {
  departments: Array<{
    id: string;
    name: string;
  }>;
  maintenanceTypes: Array<{
    id: string;
    name: string;
  }>;
  dateRanges: Array<{
    id: string;
    label: string;
    start: string;
    end: string;
  }>;
}

export interface BiApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface BiExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}
