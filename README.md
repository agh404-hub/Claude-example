# Healthcare Provider Dashboard

A modern, professional dashboard for healthcare providers to monitor patients' glucose and insulin data. This is a frontend-only mockup with mock data and no backend implementation.

![Healthcare Dashboard](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue) ![D3.js](https://img.shields.io/badge/D3.js-7-orange)

## Features

### Patient List Page (`/patients`)
- **Search**: Real-time search by patient name
- **Filter**: Filter patients by risk level (Low, Medium, High)
- **Sort**: Sort by last upload time, patient name, or risk level
- **Responsive Table**: Color-coded risk indicators and status badges
- **Summary Stats**: Total patient count and active filters display

### Patient Detail Page (`/patients/:id`)
- **Current Glucose Card**:
  - Large display of current glucose value with color-coded status
  - Trend indicators (rising, steady, falling)
  - Target range visualization bar

- **Ambulatory Glucose Profile (AGP) Chart**:
  - Interactive D3.js visualization showing 7-day glucose patterns
  - Displays median, 25th-75th percentile, and 10th-90th percentile ranges
  - Hover tooltips with detailed values
  - Target range indicator (70-180 mg/dL)

- **Time in Range Summary**:
  - Visual breakdown with horizontal bar chart
  - Detailed statistics for in-range, above-range, and below-range values
  - Both percentage and hours displayed
  - Clinical target guidelines

- **Insulin Delivery Summary**:
  - Total daily insulin with basal/bolus breakdown
  - Average doses per day
  - Basal-bolus ratio with clinical targets

- **Recent Alerts List**:
  - Last 10 alerts with color-coded severity
  - Alert types: Low Glucose, High Glucose, Sensor Issues
  - Timestamps and glucose values at time of alert

- **Summary Statistics**:
  - Average glucose over 7 days
  - Total number of readings
  - Glucose variability (standard deviation)
  - Critical alerts count

- **Real-time Updates**: Glucose values update every 8 seconds (simulated)

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **D3.js** for data visualization (AGP Chart)
- **React Router** for navigation
- **date-fns** for date formatting
- **Vite** for build tooling

## Design

- **Color Palette**:
  - Primary: Slate blue (#475569) and Teal (#0D9488)
  - Status colors: Green (safe), Amber (warning), Red (critical)
  - Clean white backgrounds with subtle gray borders

- **Typography**: Inter font family for modern, professional look

- **Layout**: Responsive, desktop-first design with spacious layout and clear visual hierarchy

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Claude-example
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── AGPChart.tsx          # D3.js Ambulatory Glucose Profile chart
│   ├── AlertsList.tsx        # Recent alerts component
│   ├── GlucoseCard.tsx       # Current glucose display card
│   ├── InsulinSummary.tsx    # Insulin delivery summary
│   ├── TimeInRange.tsx       # Time in range visualization
│   └── Skeleton.tsx          # Loading skeleton components
├── pages/
│   ├── PatientList.tsx       # Patient list page with search/filter/sort
│   └── PatientDetail.tsx     # Individual patient detail page
├── utils/
│   └── mockData.ts           # Mock data generation utilities
├── types/
│   └── index.ts              # TypeScript type definitions
├── App.tsx                   # Main app with routing
├── main.tsx                  # App entry point
└── index.css                 # Global styles with Tailwind
```

## Mock Data

The application generates realistic mock data including:
- 20 patients with varied characteristics
- 7 days of glucose readings (288 readings per day at 5-minute intervals)
- Realistic patterns: dawn phenomenon, post-meal spikes, overnight lows
- 5-10 alerts per patient based on glucose thresholds
- Insulin delivery data (basal, bolus, daily totals)

## Key Features Implementation

### Real-time Updates
Glucose values are updated every 8 seconds using `setInterval` with state updates (simulating real-time data without WebSocket).

### Loading States
Skeleton loaders are displayed while data is being "fetched" (500ms simulated delay).

### Interactive Charts
The AGP chart uses D3.js for smooth, interactive visualizations with hover tooltips.

### Responsive Design
The application is fully responsive with Tailwind CSS, optimized for desktop and tablet viewing.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is a mockup/demo project for educational purposes.

## Acknowledgments

Built with modern web technologies and best practices for healthcare data visualization.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
