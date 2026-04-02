import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { Activity, Plus, Trash2, X, Loader2, UploadCloud, Image as ImageIcon, Wand2 } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAds = () => {
    const { user } = useAuth();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true
    });

    useEffect(() => {
        fetchAds();
    }, [user]);

    const fetchAds = async () => {
        try {
            const { data } = await api.get('/api/promotions/admin');
            setAds(data);
        } catch (error) {
            toast.error('Failed to load advertisements');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAIGenerate = async () => {
        const prompt = window.prompt("What is the context of the ad? (e.g. 'Diwali sale on electronics')");
        if (!prompt) return;

        setGenerating(true);
        try {
            const { data } = await api.post('/api/ai/generate-ad', { context: prompt });
            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                linkUrl: data.linkUrl || prev.linkUrl
            }));
            toast.success("AI Generation Complete");
        } catch (error) {
            toast.error("Failed to generate ad copy");
        } finally {
            setGenerating(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            setUploading(true);
            const { data } = await api.post('/api/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, imageUrl: data.url }));
            toast.success('Ad graphic uploaded');
        } catch (error) {
            toast.error('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.imageUrl) {
            toast.error('Ad image is strongly required');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/api/promotions', formData);
            toast.success('Advertisement launched');
            fetchAds();
            setIsMenuOpen(false);
            setFormData({ title: '', imageUrl: '', linkUrl: '', isActive: true });
        } catch (error) {
            toast.error('Failed to launch ad');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to pull this advertisement entirely?')) return;
        try {
            await api.delete(`/api/promotions/${id}`);
            toast.success('Ad pulled');
            fetchAds();
        } catch (error) {
            toast.error('Failed to delete ad');
        }
    };

    const toggleStatus = async (ad) => {
        try {
            await api.put(`/api/promotions/${ad._id}`, { isActive: !ad.isActive });
            toast.success('Ad status updated');
            fetchAds();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Ad Campaign Manager</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Control homepage hero carousels and promotional graphics</p>
                </div>
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="btn-primary space-x-2"
                >
                    <Plus size={20} />
                    <span>Launch Campaign</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {ads.map((ad) => (
                    <motion.div 
                        key={ad._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`bg-white dark:bg-dark-card rounded-3xl border shadow-sm overflow-hidden flex flex-col ${ad.isActive ? 'border-primary-500/30' : 'border-gray-100 dark:border-gray-800'}`}
                    >
                        <div className="w-full h-48 bg-gray-100 dark:bg-dark-bg relative group">
                            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover object-center" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <a href={ad.linkUrl || '#'} target="_blank" rel="noreferrer" className="px-6 py-2 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full">Test Link</a>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-black dark:text-white">{ad.title}</h3>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button 
                                    onClick={() => toggleStatus(ad)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    {ad.isActive ? 'Active' : 'Inactive'}
                                </button>
                                <button 
                                    onClick={() => handleDelete(ad._id)}
                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {ads.length === 0 && (
                    <div className="lg:col-span-2 text-center py-20 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-gray-800">
                        <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-black text-gray-400">No campaigns active</h3>
                        <p className="text-gray-500">The storefront carousel is currently empty.</p>
                    </div>
                )}
            </div>

            {/* Modal for New Ad */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                                className="w-full max-w-lg bg-white dark:bg-dark-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-full pointer-events-auto"
                            >
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-dark-card sticky top-0 z-10">
                                    <h3 className="text-xl font-black">Configure Campaign</h3>
                                    <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X size={20} /></button>
                                </div>
                                <div className="overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-dark-card">
                                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign Title</label>
                                        <button 
                                            type="button" 
                                            onClick={handleAIGenerate}
                                            disabled={generating}
                                            className="text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded-lg transition-colors"
                                        >
                                            {generating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                            <span>Auto-Generate</span>
                                        </button>
                                    </div>
                                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-4 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary-500/20 transition-all" />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Creative Asset</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative group h-32 rounded-2xl bg-gray-50 dark:bg-dark-bg border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-all overflow-hidden"
                                    >
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        
                                        {uploading ? (
                                            <div className="flex flex-col items-center space-y-2">
                                                <Spinner />
                                            </div>
                                        ) : formData.imageUrl ? (
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center space-y-2 text-gray-400">
                                                <UploadCloud size={24} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Upload Graphic</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Target Action URL (Optional)</label>
                                    <input type="text" name="linkUrl" value={formData.linkUrl} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-4 text-sm font-bold outline-none" placeholder="e.g., /shop?category=electronics" />
                                </div>
                                
                                <div className="flex items-center space-x-3 pt-2">
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 rounded editor-checkbox" id="isActiveAdCheck" />
                                    <label htmlFor="isActiveAdCheck" className="text-sm font-black text-gray-700 dark:text-gray-300">Activate Immediately</label>
                                </div>
                                <button type="submit" disabled={submitting || uploading} className="w-full btn-primary h-14 mt-4">
                                    {submitting ? <Loader2 className="animate-spin" /> : 'Launch Campaign'}
                                </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAds;
