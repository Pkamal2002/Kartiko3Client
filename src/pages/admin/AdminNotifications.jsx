import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { Bell, Plus, Trash2, X, Loader2, Wand2 } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        linkUrl: '',
        isActive: true
    });

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/api/notifications/admin');
            setNotifications(data);
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAIGenerate = async () => {
        const prompt = window.prompt("What should this notification be about? (e.g. 'Warn users about scheduled maintenance tonight')");
        if (!prompt) return;

        setGenerating(true);
        try {
            const { data } = await api.post('/api/ai/generate-notification', { intent: prompt });
            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                message: data.message || prev.message,
                type: data.type || prev.type
            }));
            toast.success("AI drafted notification successfully");
        } catch (error) {
            toast.error("Failed to generate notification");
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post('/api/notifications', formData);
            toast.success('Notification broadcasted successfully');
            fetchNotifications();
            setIsMenuOpen(false);
            setFormData({ title: '', message: '', type: 'info', linkUrl: '', isActive: true });
        } catch (error) {
            toast.error('Failed to broadcast notification');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;
        try {
            await api.delete(`/api/notifications/${id}`);
            toast.success('Notification removed');
            fetchNotifications();
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const toggleStatus = async (noti) => {
        try {
            await api.put(`/api/notifications/${noti._id}`, { isActive: !noti.isActive });
            toast.success('Status updated');
            fetchNotifications();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Broadcast Center</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage global system alerts and promotional notifications</p>
                </div>
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="btn-primary space-x-2"
                >
                    <Plus size={20} />
                    <span>New Broadcast</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {notifications.map((noti) => (
                    <motion.div 
                        key={noti._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white dark:bg-dark-card p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between ${noti.isActive ? 'border-primary-500/30' : 'border-gray-100 dark:border-gray-800'}`}
                    >
                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-2xl ${noti.type === 'alert' ? 'bg-red-100 text-red-600' : noti.type === 'promo' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Bell size={24} />
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 mb-1">
                                    <h3 className="text-lg font-black dark:text-white">{noti.title}</h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-500">
                                        {noti.type}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl">{noti.message}</p>
                                {noti.linkUrl && (
                                    <a href={noti.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline mt-2 inline-block">
                                        {noti.linkUrl}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => toggleStatus(noti)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${noti.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                            >
                                {noti.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button 
                                onClick={() => handleDelete(noti._id)}
                                className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {notifications.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-gray-800">
                        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-black text-gray-400">Silence is golden</h3>
                        <p className="text-gray-500">No broadcasts have been transmitted yet.</p>
                    </div>
                )}
            </div>

            {/* Modal for New Broadcast */}
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
                                    <h3 className="text-xl font-black">Transmit Broadcast</h3>
                                    <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X size={20} /></button>
                                </div>
                                <div className="overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-dark-card">
                                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Transmission Title</label>
                                        <button 
                                            type="button" 
                                            onClick={handleAIGenerate}
                                            disabled={generating}
                                            className="text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded-lg transition-colors"
                                        >
                                            {generating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                            <span>Draft with AI</span>
                                        </button>
                                    </div>
                                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-4 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary-500/20 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Message Payload</label>
                                    <textarea required name="message" value={formData.message} onChange={handleInputChange} rows="3" className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-4 text-sm font-medium outline-none resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Signal Type</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-4 text-sm font-bold outline-none">
                                            <option value="info">Info</option>
                                            <option value="promo">Promotion</option>
                                            <option value="alert">Alert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Target URL (Optional)</label>
                                        <input type="text" name="linkUrl" value={formData.linkUrl} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-4 text-sm font-bold outline-none" placeholder="/shop" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 pt-2">
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 rounded editor-checkbox" id="isActiveCheck" />
                                    <label htmlFor="isActiveCheck" className="text-sm font-black text-gray-700 dark:text-gray-300">Transmit Immediately</label>
                                </div>
                                <button type="submit" disabled={submitting} className="w-full btn-primary h-14 mt-4">
                                    {submitting ? <Loader2 className="animate-spin" /> : 'Launch Broadcast'}
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

export default AdminNotifications;
