import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, AlignLeft, AlertTriangle } from 'lucide-react';

const ReportSighting = () => {
    const { apiCall } = useAuth();
    const navigate = useNavigate();
    
    const [species, setSpecies] = useState('LION');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiCall('/sightings', {
                method: 'POST',
                body: JSON.stringify({
                    species,
                    sighting_date: date,
                    sighting_time: time,
                    description,
                    image_url: imageUrl || null
                })
            });
            alert('Sighting reported successfully! The Department has been notified.');
            navigate('/public');
        } catch (err) {
            alert('Failed to report sighting: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate('/public')} className="text-green-400 hover:text-green-300 mb-6 flex items-center gap-2">
                    &larr; Back to Dashboard
                </button>
                
                <h1 className="text-3xl font-bold mb-2">Report Wildlife Sighting</h1>
                <p className="text-gray-400 mb-8">Help us monitor wildlife movement and keep the community safe.</p>

                <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Species Spotted</label>
                        <select 
                            value={species} 
                            onChange={(e) => setSpecies(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="LION">Asiatic Lion</option>
                            <option value="LEOPARD">Leopard</option>
                            <option value="OTHER">Other Wildlife</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1">Date</label>
                            <input 
                                type="date" required 
                                value={date} onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1">Time</label>
                            <input 
                                type="time" required 
                                value={time} onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Description & Exact Location</label>
                        <textarea 
                            required rows="3"
                            placeholder="e.g. Near the banyan tree at the edge of the village farm..."
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Photo Evidence (Optional Base64 URL)</label>
                        <div className="flex gap-2 items-center">
                            <Camera className="text-gray-400 h-6 w-6" />
                            <input 
                                type="text" 
                                placeholder="Paste image URL here for now"
                                value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2"
                            />
                        </div>
                    </div>

                    <div className="bg-orange-900/30 border border-orange-800/50 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="text-orange-400 h-6 w-6 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-200">
                            By submitting this report, you confirm the information is accurate. False reports may delay emergency responses.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-md transition-colors"
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default ReportSighting;
