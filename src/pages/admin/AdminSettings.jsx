import { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Save, RefreshCcw } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

const AdminSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        gstRate: 18,
        shippingThreshold: 500,
        shippingFee: 50
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/api/settings');
                setSettings(data);
                setLoading(false);
            } catch (error) {
                toast.error('Failed to load settings');
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: Number(e.target.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/api/settings', settings);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-64 flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold dark:text-white mb-8 flex items-center">
                <SettingsIcon className="mr-3 text-primary-500" /> Business Settings
            </h2>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">GST Rate (%)</label>
                    <input 
                        type="number"
                        name="gstRate"
                        value={settings.gstRate}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                        placeholder="18"
                    />
                    <p className="mt-1 text-xs text-gray-500 uppercase tracking-tighter">Tax applied at checkout</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Free Delivery Threshold (₹)</label>
                    <input 
                        type="number"
                        name="shippingThreshold"
                        value={settings.shippingThreshold}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                        placeholder="500"
                    />
                    <p className="mt-1 text-xs text-gray-500 uppercase tracking-tighter">Orders above this amount get free shipping</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Standard Delivery Fee (₹)</label>
                    <input 
                        type="number"
                        name="shippingFee"
                        value={settings.shippingFee}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                        placeholder="50"
                    />
                    <p className="mt-1 text-xs text-gray-500 uppercase tracking-tighter">Fee applied to orders below threshold</p>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="btn-primary w-full py-4 flex items-center justify-center space-x-2 shadow-xl shadow-primary-500/20"
                    >
                        {saving ? <RefreshCcw className="animate-spin" /> : <Save size={20} />}
                        <span>{saving ? 'Updating...' : 'Save All Changes'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
