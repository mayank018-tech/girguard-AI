import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Shield, Briefcase, Plus, Hash, Clock, Ban, CheckCircle } from "lucide-react";

const AccessManagement = () => {
    const { apiCall } = useAuth();
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("DEPARTMENT");

    const fetchCodes = async () => {
        setLoading(true);
        try {
            const data = await apiCall("/admin/access-codes");
            setCodes(data);
        } catch (err) {
            setError("Failed to load access codes: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await apiCall("/admin/access-codes", {
                method: "POST",
                body: JSON.stringify({ role_type: activeTab, expiry_days: 7 })
            });
            fetchCodes();
        } catch (err) {
            setError("Failed to generate code: " + err.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm("Are you sure you want to revoke this access code?")) return;
        try {
            await apiCall(`/admin/access-codes/${id}/revoke`, { method: "POST" });
            fetchCodes();
        } catch (err) {
            setError("Failed to revoke code: " + err.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "ACTIVE": return "bg-green-900/50 text-green-400 border-green-800";
            case "USED": return "bg-blue-900/50 text-blue-400 border-blue-800";
            case "REVOKED": return "bg-red-900/50 text-red-400 border-red-800";
            case "EXPIRED": return "bg-gray-800 text-gray-400 border-gray-700";
            default: return "bg-gray-800 text-gray-400";
        }
    };

    const filteredCodes = codes.filter(c => c.role_type === activeTab);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Access Management</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage registration authorization codes</p>
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Generate {activeTab} Code
                </button>
            </div>

            {error && <div className="bg-red-900/50 border border-red-800 text-red-300 p-3 rounded-lg text-sm">{error}</div>}

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="flex border-b border-gray-700">
                    <button 
                        className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 flex justify-center items-center gap-2 ${activeTab === "DEPARTMENT" ? "border-indigo-500 text-indigo-400 bg-gray-800" : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-750"}`}
                        onClick={() => setActiveTab("DEPARTMENT")}
                    >
                        <Briefcase className="w-5 h-5" />
                        Department Codes
                    </button>
                    <button 
                        className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 flex justify-center items-center gap-2 ${activeTab === "ADMIN" ? "border-red-500 text-red-400 bg-gray-800" : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-750"}`}
                        onClick={() => setActiveTab("ADMIN")}
                    >
                        <Shield className="w-5 h-5" />
                        Admin Codes
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs uppercase bg-gray-900 text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created By</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4">Expires At</th>
                                <th className="px-6 py-4">Used By / At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading codes...</td></tr>
                            ) : filteredCodes.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No {activeTab.toLowerCase()} codes generated yet.</td></tr>
                            ) : (
                                filteredCodes.map((code) => (
                                    <tr key={code.id} className="border-b border-gray-700/50 hover:bg-gray-750/50">
                                        <td className="px-6 py-4 font-mono font-medium text-white">{code.code}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(code.status)}`}>
                                                {code.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{code.created_by}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(code.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">{new Date(code.expires_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {code.used_by ? (
                                                <div>
                                                    <div className="text-white">{code.used_by}</div>
                                                    <div className="text-xs text-gray-500">{new Date(code.used_at).toLocaleDateString()}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {code.status === "ACTIVE" && (
                                                <button onClick={() => handleRevoke(code.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default AccessManagement;

