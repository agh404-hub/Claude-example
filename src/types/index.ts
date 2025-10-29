// Risk levels for patients
export type RiskLevel = 'low' | 'medium' | 'high';

// Glucose trend indicators
export type GlucoseTrend = 'rising' | 'steady' | 'falling';

// Alert types
export type AlertType = 'low_glucose' | 'high_glucose' | 'sensor_issue';

// Alert severity
export type AlertSeverity = 'info' | 'warning' | 'critical';

// Patient interface
export interface Patient {
  id: string;
  name: string;
  age: number;
  riskLevel: RiskLevel;
  lastGlucoseReading: number;
  lastGlucoseTime: Date;
  lastUploadTime: Date;
  isActive: boolean;
  trend: GlucoseTrend;
}

// Glucose reading
export interface GlucoseReading {
  timestamp: Date;
  value: number; // mg/dL
}

// Alert
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  timestamp: Date;
  glucoseValue?: number;
  message: string;
}

// Insulin data
export interface InsulinData {
  totalDaily: number;
  basalAverage: number;
  bolusAverage: number;
  bolusesPerDay: number;
}

// Time in range data
export interface TimeInRangeData {
  inRange: number; // percentage
  aboveRange: number; // percentage
  belowRange: number; // percentage
  inRangeHours: number;
  aboveRangeHours: number;
  belowRangeHours: number;
}

// AGP (Ambulatory Glucose Profile) data point
export interface AGPDataPoint {
  timeOfDay: number; // minutes from midnight (0-1439)
  median: number;
  p25: number; // 25th percentile
  p75: number; // 75th percentile
  p10: number; // 10th percentile
  p90: number; // 90th percentile
}

// Patient detail data
export interface PatientDetailData {
  patient: Patient;
  currentGlucose: {
    value: number;
    timestamp: Date;
    trend: GlucoseTrend;
  };
  glucoseReadings: GlucoseReading[]; // Last 7 days
  agpData: AGPDataPoint[];
  timeInRange: TimeInRangeData;
  insulinData: InsulinData;
  alerts: Alert[];
}

// Filter and sort options
export interface FilterOptions {
  riskLevel: RiskLevel | 'all';
  searchQuery: string;
}

export type SortField = 'lastUpload' | 'name' | 'riskLevel';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}
