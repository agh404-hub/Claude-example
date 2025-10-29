import type {
  Patient,
  RiskLevel,
  GlucoseTrend,
  GlucoseReading,
  Alert,
  InsulinData,
  TimeInRangeData,
  AGPDataPoint,
  PatientDetailData,
} from '../types';

// Realistic patient names
const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Barbara', 'William', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
];

// Utility function to generate random number in range
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Utility function to generate random integer in range
const randomIntInRange = (min: number, max: number): number => {
  return Math.floor(randomInRange(min, max));
};

// Get random element from array
const randomElement = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Generate a random date within the last N days
const randomDateWithinDays = (days: number): Date => {
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
};

// Generate glucose trend based on value
const determineGlucoseTrend = (current: number, previous: number): GlucoseTrend => {
  const diff = current - previous;
  if (diff > 5) return 'rising';
  if (diff < -5) return 'falling';
  return 'steady';
};

// Generate realistic glucose value with some noise
const generateGlucoseValue = (baseValue: number, variance: number): number => {
  return Math.max(40, Math.min(400, baseValue + randomInRange(-variance, variance)));
};

// Generate 7 days of glucose readings (288 readings per day at 5-min intervals)
const generateGlucoseReadings = (): GlucoseReading[] => {
  const readings: GlucoseReading[] = [];
  const now = new Date();
  const minutesPerDay = 24 * 60;
  const intervalMinutes = 5;
  const daysToGenerate = 7;

  for (let day = daysToGenerate - 1; day >= 0; day--) {
    for (let minute = 0; minute < minutesPerDay; minute += intervalMinutes) {
      const timestamp = new Date(now.getTime() - day * 24 * 60 * 60 * 1000 - minute * 60 * 1000);

      // Create realistic patterns based on time of day
      const hourOfDay = Math.floor((minutesPerDay - minute) / 60);
      let baseValue = 120;

      // Dawn phenomenon (early morning rise)
      if (hourOfDay >= 4 && hourOfDay < 8) {
        baseValue = 140;
      }
      // Post-breakfast spike
      else if (hourOfDay >= 8 && hourOfDay < 10) {
        baseValue = 160;
      }
      // Post-lunch spike
      else if (hourOfDay >= 12 && hourOfDay < 14) {
        baseValue = 170;
      }
      // Post-dinner spike
      else if (hourOfDay >= 18 && hourOfDay < 20) {
        baseValue = 165;
      }
      // Overnight lows
      else if (hourOfDay >= 0 && hourOfDay < 4) {
        baseValue = 100;
      }

      const value = generateGlucoseValue(baseValue, 30);
      readings.push({ timestamp, value });
    }
  }

  return readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Calculate AGP data from glucose readings
const calculateAGPData = (readings: GlucoseReading[]): AGPDataPoint[] => {
  const agpData: AGPDataPoint[] = [];
  const intervalMinutes = 5;
  const minutesPerDay = 24 * 60;

  // Group readings by time of day
  const readingsByTimeOfDay: { [key: number]: number[] } = {};

  readings.forEach(reading => {
    const date = new Date(reading.timestamp);
    const minutesFromMidnight = date.getHours() * 60 + date.getMinutes();
    const timeSlot = Math.floor(minutesFromMidnight / intervalMinutes) * intervalMinutes;

    if (!readingsByTimeOfDay[timeSlot]) {
      readingsByTimeOfDay[timeSlot] = [];
    }
    readingsByTimeOfDay[timeSlot].push(reading.value);
  });

  // Calculate percentiles for each time slot
  for (let timeOfDay = 0; timeOfDay < minutesPerDay; timeOfDay += intervalMinutes) {
    const values = readingsByTimeOfDay[timeOfDay] || [];

    if (values.length > 0) {
      values.sort((a, b) => a - b);

      const getPercentile = (p: number) => {
        const index = Math.floor((p / 100) * values.length);
        return values[Math.min(index, values.length - 1)];
      };

      agpData.push({
        timeOfDay,
        median: getPercentile(50),
        p25: getPercentile(25),
        p75: getPercentile(75),
        p10: getPercentile(10),
        p90: getPercentile(90),
      });
    }
  }

  return agpData;
};

// Calculate time in range data
const calculateTimeInRange = (readings: GlucoseReading[]): TimeInRangeData => {
  let inRangeCount = 0;
  let aboveRangeCount = 0;
  let belowRangeCount = 0;

  readings.forEach(reading => {
    if (reading.value >= 70 && reading.value <= 180) {
      inRangeCount++;
    } else if (reading.value > 180) {
      aboveRangeCount++;
    } else {
      belowRangeCount++;
    }
  });

  const total = readings.length;
  const inRangePercent = (inRangeCount / total) * 100;
  const aboveRangePercent = (aboveRangeCount / total) * 100;
  const belowRangePercent = (belowRangeCount / total) * 100;

  // Calculate hours (readings are every 5 minutes)
  const minutesPerReading = 5;

  return {
    inRange: Math.round(inRangePercent * 10) / 10,
    aboveRange: Math.round(aboveRangePercent * 10) / 10,
    belowRange: Math.round(belowRangePercent * 10) / 10,
    inRangeHours: Math.round((inRangeCount * minutesPerReading) / 60 * 10) / 10,
    aboveRangeHours: Math.round((aboveRangeCount * minutesPerReading) / 60 * 10) / 10,
    belowRangeHours: Math.round((belowRangeCount * minutesPerReading) / 60 * 10) / 10,
  };
};

// Generate alerts based on glucose readings
const generateAlerts = (readings: GlucoseReading[]): Alert[] => {
  const alerts: Alert[] = [];

  // Find low and high glucose events
  readings.forEach((reading, index) => {
    if (reading.value < 70 && Math.random() > 0.7) {
      alerts.push({
        id: `alert-${index}-low`,
        type: 'low_glucose',
        severity: reading.value < 54 ? 'critical' : 'warning',
        timestamp: reading.timestamp,
        glucoseValue: reading.value,
        message: `Low glucose detected: ${reading.value} mg/dL`,
      });
    } else if (reading.value > 250 && Math.random() > 0.8) {
      alerts.push({
        id: `alert-${index}-high`,
        type: 'high_glucose',
        severity: reading.value > 300 ? 'critical' : 'warning',
        timestamp: reading.timestamp,
        glucoseValue: reading.value,
        message: `High glucose detected: ${reading.value} mg/dL`,
      });
    }
  });

  // Add some sensor issue alerts
  if (Math.random() > 0.5) {
    const randomReading = randomElement(readings);
    alerts.push({
      id: `alert-sensor-${Date.now()}`,
      type: 'sensor_issue',
      severity: 'info',
      timestamp: randomReading.timestamp,
      message: 'Sensor calibration recommended',
    });
  }

  // Sort by timestamp (most recent first) and limit to 10
  return alerts
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);
};

// Generate insulin data
const generateInsulinData = (): InsulinData => {
  const basalAverage = randomInRange(20, 35);
  const bolusAverage = randomInRange(15, 30);
  const bolusesPerDay = randomIntInRange(4, 8);

  return {
    totalDaily: Math.round((basalAverage + bolusAverage) * 10) / 10,
    basalAverage: Math.round(basalAverage * 10) / 10,
    bolusAverage: Math.round(bolusAverage * 10) / 10,
    bolusesPerDay,
  };
};

// Generate a single patient
export const generatePatient = (id: string): Patient => {
  const name = `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`;
  const age = randomIntInRange(25, 75);
  const riskLevel: RiskLevel = randomElement(['low', 'medium', 'high']);
  const lastGlucoseReading = randomIntInRange(60, 250);
  const lastGlucoseTime = randomDateWithinDays(1);
  const lastUploadTime = randomDateWithinDays(7);
  const isActive = Math.random() > 0.2; // 80% active
  const trend: GlucoseTrend = randomElement(['rising', 'steady', 'falling']);

  return {
    id,
    name,
    age,
    riskLevel,
    lastGlucoseReading,
    lastGlucoseTime,
    lastUploadTime,
    isActive,
    trend,
  };
};

// Generate multiple patients
export const generatePatients = (count: number = 20): Patient[] => {
  return Array.from({ length: count }, (_, i) => generatePatient(`patient-${i + 1}`));
};

// Generate patient detail data
export const generatePatientDetailData = (patient: Patient): PatientDetailData => {
  const glucoseReadings = generateGlucoseReadings();
  const agpData = calculateAGPData(glucoseReadings);
  const timeInRange = calculateTimeInRange(glucoseReadings);
  const insulinData = generateInsulinData();
  const alerts = generateAlerts(glucoseReadings);

  // Get the most recent reading
  const mostRecentReading = glucoseReadings[glucoseReadings.length - 1];
  const secondMostRecentReading = glucoseReadings[glucoseReadings.length - 2];

  return {
    patient,
    currentGlucose: {
      value: mostRecentReading.value,
      timestamp: mostRecentReading.timestamp,
      trend: determineGlucoseTrend(mostRecentReading.value, secondMostRecentReading.value),
    },
    glucoseReadings,
    agpData,
    timeInRange,
    insulinData,
    alerts,
  };
};

// Store for generated patients (simulating a database)
let cachedPatients: Patient[] = [];

// Get all patients
export const getPatients = async (): Promise<Patient[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (cachedPatients.length === 0) {
    cachedPatients = generatePatients(20);
  }

  return cachedPatients;
};

// Get a single patient by ID
export const getPatientById = async (id: string): Promise<PatientDetailData | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (cachedPatients.length === 0) {
    cachedPatients = generatePatients(20);
  }

  const patient = cachedPatients.find(p => p.id === id);

  if (!patient) {
    return null;
  }

  return generatePatientDetailData(patient);
};

// Update a patient's current glucose (for simulated real-time updates)
export const updatePatientGlucose = (patientData: PatientDetailData): PatientDetailData => {
  const lastReading = patientData.currentGlucose.value;
  const newValue = generateGlucoseValue(lastReading, 15);
  const trend = determineGlucoseTrend(newValue, lastReading);

  return {
    ...patientData,
    currentGlucose: {
      value: newValue,
      timestamp: new Date(),
      trend,
    },
  };
};
