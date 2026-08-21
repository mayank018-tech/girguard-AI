import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Lock, Mail, User, Shield, Briefcase } from 'lucide-react';

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('PUBLIC');
    const [roleCode, setRoleCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await signup(name, email, password, roleCode);
            if (user.role === 'DEPARTMENT' || user.role === 'ADMIN') navigate('/admin');
            else navigate('/public');
        } catch (err) {
            setError(err.message);
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
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-50">Create an account</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-200">Select Role</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-gray-400" />
                                </div>
                                <select 
                                    value={selectedRole} 
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2"
                                >
                                    <option value="PUBLIC">Public User (Citizen / Tourist)</option>
                                    <option value="DEPARTMENT">Forest Department Officer</option>
                                    <option value="ADMIN">System Administrator</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200">Full Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2" />
                            </div>
                        </div>

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

                        {selectedRole !== 'PUBLIC' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-200">
                                    {selectedRole === 'ADMIN' ? 'Admin Access Code' : 'Department Access Code'}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Shield className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="password" required placeholder="Enter Secret Code" value={roleCode} onChange={(e) => setRoleCode(e.target.value)}
                                        className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2" />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">You must have authorization to register for this role.</p>
                            </div>
                        )}

                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Sign up
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <Link to="/login" className="text-green-400 hover:text-green-300">Already have an account? Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Signup;

