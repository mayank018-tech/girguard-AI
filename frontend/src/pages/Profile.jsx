import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6 text-white">My Profile</h1>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-8 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-green-900 rounded-full flex items-center justify-center border-4 border-gray-800 text-3xl font-bold text-green-400">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{user.name || 'Unknown User'}</h2>
                            <div className="flex items-center gap-2 text-gray-400 mb-3">
                                <Mail size={16} />
                                <span>{user.email || 'No email provided'}</span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-400 border border-green-800/50">
                                <Shield size={14} />
                                {user.role || 'PUBLIC'} ACCOUNT
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 bg-gray-900">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account Settings</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-950 rounded-lg border border-gray-800">
                            <div>
                                <div className="text-gray-200 font-medium">Account Status</div>
                                <div className="text-sm text-gray-500">Your account is currently active and in good standing.</div>
                            </div>
                            <div className="text-green-400 text-sm font-semibold bg-green-400/10 px-3 py-1 rounded-full">Active</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-950 rounded-lg border border-gray-800">
                            <div>
                                <div className="text-gray-200 font-medium">Password</div>
                                <div className="text-sm text-gray-500">Change your password to keep your account secure.</div>
                            </div>
                            <button disabled className="text-sm px-4 py-2 bg-gray-800 text-gray-400 rounded-md cursor-not-allowed">
                                Change
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors"
                        >
                            <LogOut size={18} />
                            Sign Out of GirGuard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
