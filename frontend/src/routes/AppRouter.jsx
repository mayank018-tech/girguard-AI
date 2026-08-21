import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout.jsx';

import LandingPage from '../pages/LandingPage.jsx';
import VerificationDesk from '../pages/department/VerificationDesk.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import AlertsPage from '../pages/AlertsPage.jsx';
import ReportSightingPage from '../pages/ReportSightingPage.jsx';
import LivestockLossPage from '../pages/LivestockLossPage.jsx';
import TouristSafetyPage from '../pages/TouristSafetyPage.jsx';
import ForestCommandPage from '../pages/ForestCommandPage.jsx';
import IncidentsPage from '../pages/IncidentsPage.jsx';
import HotspotsPage from '../pages/HotspotsPage.jsx';
import AIAssistantPage from '../pages/AIAssistantPage.jsx';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import PublicDashboard from '../pages/public/PublicDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ReportSightingPublic from '../pages/public/ReportSighting';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to={user.role === 'DEPARTMENT' ? '/dashboard' : '/public'} />;
    }
    return children;
};

const AppRouter = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <Routes>
            {/* Public/Auth Routes */}
            <Route path="/login" element={user ? <Navigate to={user.role === 'DEPARTMENT' ? '/dashboard' : user.role === 'ADMIN' ? '/admin' : '/public'} /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to={user.role === 'DEPARTMENT' ? '/dashboard' : user.role === 'ADMIN' ? '/admin' : '/public'} /> : <Signup />} />
            
            {/* Public Portal */}
            <Route path="/public" element={
                <ProtectedRoute requiredRole="PUBLIC">
                    <PublicDashboard />
                </ProtectedRoute>
            } />
            <Route path="/public/report-sighting" element={
                <ProtectedRoute requiredRole="PUBLIC">
                    <PublicDashboard />
                </ProtectedRoute>
            } />

            {/* Existing App wrapped in Department Role */}
            <Route path="/" element={
                <ProtectedRoute requiredRole="DEPARTMENT">
                    <AppLayout />
                </ProtectedRoute>
            }>
                <Route index element={<LandingPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="dashboard/verification" element={<VerificationDesk />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="report-sighting" element={<ReportSightingPage />} />
                <Route path="livestock-loss" element={<LivestockLossPage />} />
                <Route path="tourist" element={<TouristSafetyPage />} />
                <Route path="forest-command" element={<ForestCommandPage />} />
                <Route path="incidents" element={<IncidentsPage />} />
                <Route path="hotspots" element={<HotspotsPage />} />
                <Route path="ai-assistant" element={<AIAssistantPage />} />
            </Route>

            <Route path="/admin" element={
                <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};
export default AppRouter;



