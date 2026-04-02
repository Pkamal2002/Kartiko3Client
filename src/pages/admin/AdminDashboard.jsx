import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    DollarSign, 
    ShoppingBag, 
    Package, 
    Users, 
    ArrowUpRight,
    Activity
} from 'lucide-react';
import api from '../../utils/api.js';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/api/admin/analytics');
                setAnalytics(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user]);

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner /></div>;
    if (!analytics) return <div className="text-red-500 p-8 bg-red-50 rounded-2xl">Failed to load analytics data.</div>;

    const stats = [
        { label: 'Revenue', value: `₹${analytics.totalRevenue.toLocaleString('en-IN')}`, icon: <DollarSign size={20} />, trend: '+12.5%', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
        { label: 'Orders', value: analytics.totalOrders, icon: <ShoppingBag size={20} />, trend: '+8.2%', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
        { label: 'Products', value: analytics.totalProducts, icon: <Package size={20} />, trend: 'Stable', color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/20' },
        { label: 'Customers', value: analytics.totalUsers, icon: <Users size={20} />, trend: '+14.1%', color: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/20' },
    ];

    const categoryData = analytics.categoryData || [
        { name: 'Electronics', count: 400 },
        { name: 'Fashion', count: 300 },
        { name: 'Lifestyle', count: 200 },
        { name: 'Books', count: 120 },
    ];

    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Command Center</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Real-time business insights & operations</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-white dark:bg-dark-card p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                        <Activity size={14} className="text-primary-600" />
                        <span>Live Tracking Active</span>
                    </div>
                </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={idx} 
                        whileHover={{ y: -5 }}
                        className={`relative bg-gradient-to-br ${stat.color} p-8 rounded-[2.5rem] ${stat.shadow} shadow-2xl overflow-hidden group`}
                    >
                        <div className="relative z-10 text-white">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                                    {stat.icon}
                                </div>
                                <div className="flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest bg-black/10 px-2.5 py-1 rounded-lg">
                                    <ArrowUpRight size={12} />
                                    <span>{stat.trend}</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-8 bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Revenue Metrics</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Performance Analysis</p>
                        </div>
                        <button className="px-6 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-bg text-[10px] font-black uppercase tracking-widest text-primary-600 border border-primary-100 dark:border-primary-900/30 active:scale-95 transition-all">Report</button>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#9CA3AF" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '24px' }}
                                    itemStyle={{ color: '#4F46E5', fontWeight: '900', fontSize: '14px' }}
                                    labelStyle={{ fontWeight: '900', marginBottom: '8px' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Chart */}
                <div className="lg:col-span-4 bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8">Stock Balance</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <XAxis dataKey="name" hide />
                                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" radius={[15, 15, 15, 15]} barSize={40}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-4">
                        {categoryData.map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-gray-500 dark:text-gray-400">{cat.name}</span>
                                </div>
                                <span className="text-gray-900 dark:text-white">{cat.count} Units</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
