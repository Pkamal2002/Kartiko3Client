import { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Ticket, Trash2, Plus, RefreshCcw, Calendar } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

const AdminCoupons = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [coupons, setCoupons] = useState([]);
    
    // New coupon state
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        expiryDate: '',
        minOrderValue: 0
    });

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/api/coupons');
            setCoupons(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load coupons');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCoupon({ ...newCoupon, [name]: value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/api/coupons', newCoupon);
            toast.success('Coupon created');
            setNewCoupon({ code: '', discountType: 'percentage', discountAmount: '', expiryDate: '', minOrderValue: 0 });
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Creation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this coupon?')) {
            try {
                await api.delete(`/api/coupons/${id}`);
                toast.success('Coupon deleted');
                fetchCoupons();
            } catch (error) {
                toast.error('Deletion failed');
            }
        }
    };

    if (loading) return <div className="h-64 flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-bold dark:text-white mb-8 flex items-center">
                <Ticket className="mr-3 text-primary-500" /> Coupon Management
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Create Coupon Form */}
                <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Create Coupon</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coupon Code</label>
                            <input 
                                type="text"
                                name="code"
                                value={newCoupon.code}
                                onChange={handleChange}
                                placeholder="SAVE20"
                                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                <select 
                                    name="discountType"
                                    value={newCoupon.discountType}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white outline-none"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="flat">Flat Discount (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Value</label>
                                <input 
                                    type="number"
                                    name="discountAmount"
                                    value={newCoupon.discountAmount}
                                    onChange={handleChange}
                                    placeholder="20"
                                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                            <div className="relative">
                                <input 
                                    type="date"
                                    name="expiryDate"
                                    value={newCoupon.expiryDate}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Order Value (₹)</label>
                             <input 
                                 type="number"
                                 name="minOrderValue"
                                 value={newCoupon.minOrderValue}
                                 onChange={handleChange}
                                 placeholder="500"
                                 className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white outline-none"
                             />
                        </div>

                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-primary-600 hover:bg-primary-700 text-white w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                            {saving ? <RefreshCcw className="animate-spin" /> : <Plus size={20} />}
                            <span>{saving ? 'Creating...' : 'Create Coupon'}</span>
                        </button>
                    </form>
                </div>

                {/* Coupons List */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Active Promotions</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs uppercase text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-4 py-4">Code</th>
                                    <th className="px-4 py-4">Discount</th>
                                    <th className="px-4 py-4">Expires</th>
                                    <th className="px-4 py-4">Min Spend</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {coupons.length > 0 ? coupons.map((coupon) => (
                                    <tr key={coupon._id} className="text-sm dark:text-gray-300">
                                        <td className="px-4 py-5 font-mono font-bold text-primary-600">{coupon.code}</td>
                                        <td className="px-4 py-5">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} OFF`}
                                        </td>
                                        <td className="px-4 py-5 flex items-center">
                                            <Calendar size={14} className="mr-2 text-gray-400" />
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-5">₹{coupon.minOrderValue}</td>
                                        <td className="px-4 py-5 text-right">
                                            <button 
                                                onClick={() => handleDelete(coupon._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-10 text-center text-gray-500">No active coupons available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCoupons;
