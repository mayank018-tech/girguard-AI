import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import AlertsPage from '../pages/AlertsPage.jsx';
import ReportSightingPage from '../pages/ReportSightingPage.jsx';
import LivestockLossPage from '../pages/LivestockLossPage.jsx';
import TouristSafetyPage from '../pages/TouristSafetyPage.jsx';
import ForestCommandPage from '../pages/ForestCommandPage.jsx';
import IncidentsPage from '../pages/IncidentsPage.jsx';
import HotspotsPage from '../pages/HotspotsPage.jsx';
import AIAssistantPage from '../pages/AIAssistantPage.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/"                 element={<LandingPage />} />
          <Route path="/dashboard"        element={<DashboardPage />} />
          <Route path="/alerts"           element={<AlertsPage />} />
          <Route path="/report-sighting"  element={<ReportSightingPage />} />
          <Route path="/livestock-loss"   element={<LivestockLossPage />} />
          <Route path="/tourist"          element={<TouristSafetyPage />} />
          <Route path="/forest-command"   element={<ForestCommandPage />} />
          <Route path="/incidents"        element={<IncidentsPage />} />
          <Route path="/hotspots"         element={<HotspotsPage />} />
          <Route path="/ai-assistant"     element={<AIAssistantPage />} />
          <Route path="*"                 element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
