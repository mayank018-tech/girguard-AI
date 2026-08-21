import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Lock, Mail } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'DEPARTMENT' || user.role === 'ADMIN') navigate('/dashboard');
            else navigate('/public');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDemoLogin = async (roleEmail) => {
        try {
            const user = await login(roleEmail, 'password123'); // Assuming standard mock password
            if (user.role === 'DEPARTMENT' || user.role === 'ADMIN') navigate('/dashboard');
            else navigate('/public');
        } catch (err) {
            setError('Demo login failed: ' + err.message + '. Please ensure database is seeded.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-green-500 p-3 rounded-full">
                        <Leaf className="h-10 w-10 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-50">Sign in to GirGuard AI</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                        <div>
                            <label className="block text-sm font-medium text-gray-200">Email address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-200">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2" />
                            </div>
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Sign in
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <Link to="/signup" className="text-green-400 hover:text-green-300">Don't have an account? Sign up</Link>
                    </div>
                </div>

                {/* Developer Demo Accounts */}
                <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 text-center mb-3 font-semibold uppercase">Developer Quick Test</p>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleDemoLogin('public@example.com')} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 py-1.5 px-2 rounded">
                            Public
                        </button>
                        <button onClick={() => handleDemoLogin('officer@example.com')} className="text-xs bg-indigo-900 hover:bg-indigo-800 text-indigo-200 py-1.5 px-2 rounded">
                            Officer
                        </button>
                        <button onClick={() => handleDemoLogin('admin@example.com')} className="text-xs bg-red-900 hover:bg-red-800 text-red-200 py-1.5 px-2 rounded">
                            Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;
