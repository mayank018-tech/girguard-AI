import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Shield, ShieldOff, Search, MoreVertical } from 'lucide-react';

const UserManagement = () => {
    const { apiCall } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Fetch users from the backend
        const fetchUsers = async () => {
            try {
                // Assuming we build a GET /api/v1/users endpoint for Admins
                const res = await apiCall('/users');
                setUsers(res.data || []);
            } catch (err) {
                console.error('Failed to fetch users', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [apiCall]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await apiCall(/users/ + userId + /role, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole })
            });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert(User role updated to !);
        } catch (err) {
            alert('Failed to update role: ' + err.message);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">User Management & Whitelist</h1>
            <p className="text-gray-400 mb-8">Manage access levels and approve Department Officers for the platform.</p>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-64">
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading user database...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                                    <th className="pb-3 font-medium">Name</th>
                                    <th className="pb-3 font-medium">Email</th>
                                    <th className="pb-3 font-medium">Current Role</th>
                                    <th className="pb-3 font-medium">Joined</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-700/20">
                                        <td className="py-4 font-medium">{u.name}</td>
                                        <td className="py-4 text-gray-400">{u.email}</td>
                                        <td className="py-4">
                                            <span className={px-2.5 py-1 rounded-full text-xs font-bold border }>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-400 text-sm">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 text-right">
                                            {u.role !== 'ADMIN' && (
                                                <select 
                                                    className="bg-gray-900 border border-gray-600 rounded text-sm px-2 py-1 mr-2"
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                >
                                                    <option value="PUBLIC">Make Public</option>
                                                    <option value="DEPARTMENT">Make Officer</option>
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default UserManagement;
