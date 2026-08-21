import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Shield, Briefcase, Mail, Phone, Lock, Hash } from 'lucide-react';

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    
    const [role, setRole] = useState('PUBLIC');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        department: '',
        designation: '',
        access_code: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const user = await signup({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: role,
                department: formData.department,
                designation: formData.designation,
                access_code: formData.access_code
            });
            
            if (user.role === 'DEPARTMENT' || user.role === 'ADMIN') navigate('/dashboard');
            else navigate('/public');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-green-500 p-3 rounded-full">
                        <ShieldCheck className="h-10 w-10 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-50">Create Account</h2>
            </div>
            
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
                    
                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-200 mb-3">Select Account Type:</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <label className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-colors `}>
                                <input type="radio" name="role" className="sr-only" checked={role === 'PUBLIC'} onChange={() => setRole('PUBLIC')} />
                                <User className="w-6 h-6" />
                                <span className="text-xs font-semibold uppercase">Public User</span>
                            </label>
                            <label className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-colors `}>
                                <input type="radio" name="role" className="sr-only" checked={role === 'DEPARTMENT'} onChange={() => setRole('DEPARTMENT')} />
                                <Briefcase className="w-6 h-6" />
                                <span className="text-xs font-semibold uppercase">Department</span>
                            </label>
                            <label className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-colors `}>
                                <input type="radio" name="role" className="sr-only" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} />
                                <Shield className="w-6 h-6" />
                                <span className="text-xs font-semibold uppercase">Admin</span>
                            </label>
                        </div>
                        
                        {role === 'DEPARTMENT' && (
                            <div className="mt-3 text-sm text-indigo-300 bg-indigo-900/30 p-3 rounded-md border border-indigo-800">
                                Department Member registration requires an access code provided by an Admin.
                            </div>
                        )}
                        {role === 'ADMIN' && (
                            <div className="mt-3 text-sm text-red-300 bg-red-900/30 p-3 rounded-md border border-red-800">
                                Admin registration requires an authorization code from an existing Admin.
                            </div>
                        )}
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 p-3 rounded text-center">{error}</div>}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-200">Full Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200">{role === 'PUBLIC' ? 'Email Address' : 'Official Email'}</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200">Phone</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="text" name="phone" required value={formData.phone} onChange={handleChange}
                                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2" />
                            </div>
                        </div>

                        {role === 'DEPARTMENT' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200">Department</label>
                                    <input type="text" name="department" required value={formData.department} onChange={handleChange}
                                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200">Designation</label>
                                    <input type="text" name="designation" required value={formData.designation} onChange={handleChange}
                                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2 px-3" />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200">Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange}
                                        className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200">Confirm Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="password" name="confirmPassword" required minLength={6} value={formData.confirmPassword} onChange={handleChange}
                                        className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2" />
                                </div>
                            </div>
                        </div>

                        {role !== 'PUBLIC' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-200">
                                    {role === 'ADMIN' ? 'Admin Access Code' : 'Department Access Code'}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Hash className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="text" name="access_code" required value={formData.access_code} onChange={handleChange} placeholder="e.g. GIR-DEPT-X72K"
                                        className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-600 bg-gray-700 text-gray-50 rounded-md py-2 font-mono uppercase" />
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                                {loading ? 'Registering...' : 'Register Account'}
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
