import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BuilderPage from "./pages/BuilderPage.jsx";
import FillPage from "./pages/FillPage.jsx"; // Fixed to reflect pages directory

// Admin layouts and panels
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; // Fixed to reflect pages directory
import ManageForms from "./components/admin/ManageForms.jsx";
import ExtractionLogs from "./components/admin/ExtractionLogs.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* User Space Routes */}
        <Route path="/" element={<Navigate to="/user/builder" replace />} />
        <Route path="/user/builder" element={<BuilderPage />} />
        <Route path="/user/fill" element={<FillPage />} />

        {/* Admin Shell Dashboard Layout
 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="forms" element={<ManageForms />} />
          <Route path="logs" element={<ExtractionLogs />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;