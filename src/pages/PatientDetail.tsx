import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { PatientDetailData, RiskLevel } from '../types';
import { getPatientById, updatePatientGlucose } from '../utils/mockData';
import GlucoseCard from '../components/GlucoseCard';
import AGPChart from '../components/AGPChart';
import TimeInRange from '../components/TimeInRange';
import InsulinSummary from '../components/InsulinSummary';
import AlertsList from '../components/AlertsList';
import { CardSkeleton } from '../components/Skeleton';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;

      setLoading(true);
      const data = await getPatientById(id);

      if (!data) {
        // Patient not found, redirect to patient list
        navigate('/patients');
        return;
      }

      setPatientData(data);
      setLoading(false);
    };

    fetchPatientData();
  }, [id, navigate]);

  // Simulate real-time glucose updates
  useEffect(() => {
    if (!patientData) return;

    const interval = setInterval(() => {
      setPatientData((prevData) => {
        if (!prevData) return prevData;
        return updatePatientGlucose(prevData);
      });
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, [patientData]);

  const getRiskBadgeColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="space-y-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link
              to="/patients"
              className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Patients
            </Link>
          </nav>

          {/* Patient Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">
                  {patientData.patient.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {patientData.patient.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-gray-600">{patientData.patient.age} years old</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">ID: {patientData.patient.id}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${getRiskBadgeColor(
                  patientData.patient.riskLevel
                )}`}
              >
                {patientData.patient.riskLevel.toUpperCase()} RISK
              </span>
              <div className="mt-2 flex items-center justify-end gap-2">
                <span
                  className={`inline-flex items-center ${
                    patientData.patient.isActive ? 'text-safe' : 'text-gray-400'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full mr-2 ${
                      patientData.patient.isActive ? 'bg-safe' : 'bg-gray-400'
                    }`}
                  ></span>
                  {patientData.patient.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Glucose Card */}
            <GlucoseCard
              value={patientData.currentGlucose.value}
              timestamp={patientData.currentGlucose.timestamp}
              trend={patientData.currentGlucose.trend}
            />

            {/* AGP Chart */}
            <AGPChart data={patientData.agpData} />

            {/* Time in Range */}
            <TimeInRange data={patientData.timeInRange} />
          </div>

          {/* Right Column - Insulin and Alerts */}
          <div className="space-y-6">
            {/* Insulin Summary */}
            <InsulinSummary data={patientData.insulinData} />

            {/* Recent Alerts */}
            <AlertsList alerts={patientData.alerts} />
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium">Average Glucose</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {Math.round(
                    patientData.glucoseReadings.reduce((sum, r) => sum + r.value, 0) /
                      patientData.glucoseReadings.length
                  )}
                </p>
                <p className="text-xs text-gray-500">mg/dL</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium">Total Readings</p>
                <p className="text-2xl font-bold text-teal mt-1">
                  {patientData.glucoseReadings.length}
                </p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
              <div className="bg-teal/10 p-3 rounded-lg">
                <svg
                  className="h-6 w-6 text-teal"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium">Glucose Variability</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {Math.round(
                    Math.sqrt(
                      patientData.glucoseReadings.reduce(
                        (sum, r) =>
                          sum +
                          Math.pow(
                            r.value -
                              patientData.glucoseReadings.reduce((s, reading) => s + reading.value, 0) /
                                patientData.glucoseReadings.length,
                            2
                          ),
                        0
                      ) / patientData.glucoseReadings.length
                    )
                  )}
                </p>
                <p className="text-xs text-gray-500">SD mg/dL</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {patientData.alerts.filter((a) => a.severity === 'critical').length}
                </p>
                <p className="text-xs text-gray-500">Critical alerts</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
