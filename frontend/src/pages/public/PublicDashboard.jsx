import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, Camera, AlertTriangle } from 'lucide-react';

const PublicDashboard = () => {
    const { user, logout, apiCall } = useAuth();
    const [alerts, setAlerts] = useState([]);
    
    useEffect(() => {
        apiCall('/alerts').then(res => {
            setAlerts(res.data || []);
        }).catch(err => console.error(err));
    }, [apiCall]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <ShieldAlert className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">GirGuard Public Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Welcome, {user?.name}</span>
                        <button onClick={logout} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500 cursor-pointer transition-colors" onClick={() => navigate('/public/report-sighting')}>
                        <Camera className="h-10 w-10 text-green-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Report Sighting</h3>
                        <p className="text-gray-400">Did you spot a lion or leopard? Let the department know safely.</p>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-red-500 cursor-pointer transition-colors" onClick={() => alert('Report Incident flow coming soon!')}>
                        <AlertTriangle className="h-10 w-10 text-red-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Report Incident</h3>
                        <p className="text-gray-400">Report an emergency, livestock loss, or wildlife conflict immediately.</p>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4">Active Alerts in Your Area</h2>
                <div className="space-y-4">
                    {alerts.length === 0 ? (
                        <div className="bg-gray-800 p-6 rounded-xl text-center text-gray-400">No active alerts right now. Stay safe!</div>
                    ) : (
                        alerts.map(a => (
                            <div key={a.id} className="bg-gray-800 border-l-4 border-red-500 p-4 rounded-r-xl flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-lg">{a.species} Alert</h4>
                                    <p className="text-gray-300">{a.message}</p>
                                </div>
                                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">{a.risk_level} Risk</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
export default PublicDashboard;

