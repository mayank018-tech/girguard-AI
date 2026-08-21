import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Clock, MapPin, Search } from 'lucide-react';

const VerificationDesk = () => {
    const { apiCall } = useAuth();
    const [sightings, setSightings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingSightings();
    }, []);

    const fetchPendingSightings = async () => {
        try {
            setLoading(true);
            // We want all PENDING sightings
            const res = await apiCall('/sightings?verification_status=PENDING');
            setSightings(res.data || []);
        } catch (err) {
            console.error('Failed to fetch sightings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            await apiCall(/sightings/ + id, {
                method: 'PATCH',
                body: JSON.stringify({ verification_status: status })
            });
            // Remove from list
            setSightings(sightings.filter(s => s.id !== id));
            alert(Sighting marked as !);
        } catch (err) {
            alert('Error updating sighting: ' + err.message);
        }
    };

    if (loading) return <div className="p-6 text-gray-400">Loading pending reports...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">Verification Desk</h1>
            <p className="text-gray-400 mb-8">Review reports submitted by the public before they are escalated into active incidents.</p>

            {sightings.length === 0 ? (
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">All Caught Up!</h3>
                    <p className="text-gray-400">There are no pending reports waiting for verification right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sightings.map(s => (
                        <div key={s.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            {s.image_url ? (
                                <img src={s.image_url} alt="Sighting Evidence" className="w-full h-48 object-cover" />
                            ) : (
                                <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-500">
                                    <Camera className="h-8 w-8 mb-2" />
                                    <span>No Image Provided</span>
                                </div>
                            )}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{s.species}</h3>
                                        <div className="flex items-center text-sm text-gray-400 gap-1 mt-1">
                                            <Clock size={14} /> {s.date} at {s.time || 'Unknown time'}
                                        </div>
                                    </div>
                                    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/50">
                                        PENDING
                                    </span>
                                </div>
                                
                                <p className="text-gray-300 text-sm mb-6 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                    "{s.description || 'No description provided.'}"
                                </p>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleVerify(s.id, 'VERIFIED')}
                                        className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/50 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <CheckCircle size={18} /> Verify Sighting
                                    </button>
                                    <button 
                                        onClick={() => handleVerify(s.id, 'REJECTED')}
                                        className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default VerificationDesk;
