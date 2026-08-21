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
import UserManagement from '../pages/admin/UserManagement';
import ReportSightingPublic from '../pages/public/ReportSighting';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    
    // If the user's role does not match the required role for this page, bounce them to their specific home
    if (requiredRole && user.role !== requiredRole) {
        if (user.role === 'DEPARTMENT') return <Navigate to="/dashboard" />;
        if (user.role === 'ADMIN') return <Navigate to="/admin" />;
        return <Navigate to="/public" />;
    }
    return children;
};

const AppRouter = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to={user.role === 'DEPARTMENT' ? '/dashboard' : user.role === 'ADMIN' ? '/admin' : '/public'} /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to={user.role === 'DEPARTMENT' ? '/dashboard' : user.role === 'ADMIN' ? '/admin' : '/public'} /> : <Signup />} />
            
            <Route path="/" element={<AppLayout />}>
                <Route index element={<LandingPage />} />
                
                {/* ADMIN ROUTES */}
                <Route path="admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
                <Route path="admin/users" element={<ProtectedRoute requiredRole="ADMIN"><UserManagement /></ProtectedRoute>} />
                
                {/* PUBLIC ROUTES */}
                <Route path="public" element={<ProtectedRoute requiredRole="PUBLIC"><PublicDashboard /></ProtectedRoute>} />
                <Route path="report-sighting" element={<ProtectedRoute requiredRole="PUBLIC"><ReportSightingPublic /></ProtectedRoute>} />
                <Route path="livestock-loss" element={<ProtectedRoute requiredRole="PUBLIC"><LivestockLossPage /></ProtectedRoute>} />
                <Route path="tourist" element={<ProtectedRoute requiredRole="PUBLIC"><TouristSafetyPage /></ProtectedRoute>} />
                
                {/* DEPARTMENT ROUTES */}
                <Route path="dashboard" element={<ProtectedRoute requiredRole="DEPARTMENT"><DashboardPage /></ProtectedRoute>} />
                <Route path="dashboard/verification" element={<ProtectedRoute requiredRole="DEPARTMENT"><VerificationDesk /></ProtectedRoute>} />
                <Route path="alerts" element={<ProtectedRoute requiredRole="DEPARTMENT"><AlertsPage /></ProtectedRoute>} />
                <Route path="incidents" element={<ProtectedRoute requiredRole="DEPARTMENT"><IncidentsPage /></ProtectedRoute>} />
                <Route path="hotspots" element={<ProtectedRoute requiredRole="DEPARTMENT"><HotspotsPage /></ProtectedRoute>} />
                <Route path="forest-command" element={<ProtectedRoute requiredRole="DEPARTMENT"><ForestCommandPage /></ProtectedRoute>} />
                <Route path="ai-assistant" element={<ProtectedRoute requiredRole="DEPARTMENT"><AIAssistantPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};
export default AppRouter;

