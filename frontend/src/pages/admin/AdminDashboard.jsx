import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout, apiCall } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-50 flex flex-col">
            <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">GirGuard System Admin</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400">Admin: <span className="text-white font-bold">{user?.name}</span></span>
                    <button onClick={logout} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">System Overview</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <Users className="h-8 w-8 text-indigo-400 mb-2" />
                            <div className="text-3xl font-bold">124</div>
                            <div className="text-gray-400 text-sm">Total Registered Users</div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <ShieldCheck className="h-8 w-8 text-green-400 mb-2" />
                            <div className="text-3xl font-bold">18</div>
                            <div className="text-gray-400 text-sm">Active Dept Officers</div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <AlertTriangle className="h-8 w-8 text-yellow-400 mb-2" />
                            <div className="text-3xl font-bold">42</div>
                            <div className="text-gray-400 text-sm">Total Incidents Handled</div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <Activity className="h-8 w-8 text-red-400 mb-2" />
                            <div className="text-3xl font-bold">3</div>
                            <div className="text-gray-400 text-sm">Critical Hotspots Active</div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">User Management (Coming Soon)</h2>
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                        <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-300">User Whitelist & Controls</h3>
                        <p className="text-gray-500 max-w-md mx-auto mt-2">
                            This section will allow admins to revoke officer privileges, suspend toxic public accounts, and audit all system activities.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;
