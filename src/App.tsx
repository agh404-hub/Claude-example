import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/patients" replace />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="*" element={<Navigate to="/patients" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
