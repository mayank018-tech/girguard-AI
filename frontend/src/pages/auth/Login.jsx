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
            if (user.role === 'DEPARTMENT') navigate('/dashboard');
            else navigate('/public');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-earth-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-forest-500 p-3 rounded-full">
                        <Leaf className="h-10 w-10 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-earth-50">Sign in to GirGuard AI</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-earth-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-earth-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                        <div>
                            <label className="block text-sm font-medium text-earth-200">Email address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-earth-400" />
                                </div>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-forest-500 focus:border-forest-500 block w-full pl-10 sm:text-sm border-earth-600 bg-earth-700 text-earth-50 rounded-md py-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-earth-200">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-earth-400" />
                                </div>
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-forest-500 focus:border-forest-500 block w-full pl-10 sm:text-sm border-earth-600 bg-earth-700 text-earth-50 rounded-md py-2" />
                            </div>
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-forest-600 hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500">
                                Sign in
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <Link to="/signup" className="text-forest-400 hover:text-forest-300">Don't have an account? Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;
