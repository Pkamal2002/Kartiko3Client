import { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    ShieldAlert, 
    ShieldCheck, 
    Activity, 
    Zap, 
    Server, 
    Globe, 
    Lock, 
    Unlock,
    BarChart3,
    Settings,
    Database,
    Cpu,
    ArrowUpRight,
    Search,
    RefreshCw,
    Download,
    Trash2,
    Users as UsersIcon,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import Spinner from '../../components/common/Spinner';

const SuperAdminControl = () => {
    const { user } = useAuth();
    const [telemetry, setTelemetry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTelemetry = async (isManual = false) => {
        try {
            if (isManual) setRefreshing(true);
            const { data } = await api.get('/api/admin/telemetry');
            setTelemetry(data);
            if (isManual) toast.success('Telemetry synchronized');
        } catch (error) {
            toast.error('Failed to link with system telemetry');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        document.title = 'Command Center | Kartiko SuperAdmin';
        fetchTelemetry();
    }, [user]);

    const handleQuickAction = (action) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: `Executing ${action}...`,
                success: `${action} complete`,
                error: `Failed to execute ${action}`,
            }
        );
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner /></div>;

    const roleData = [
        { name: 'Super Admins', value: telemetry.stats.roleBreakdown.superAdmins, color: '#f43f5e' },
        { name: 'Admins', value: telemetry.stats.roleBreakdown.admins, color: '#f59e0b' },
        { name: 'Customers', value: telemetry.stats.roleBreakdown.customers, color: '#10b981' },
    ];

    const healthStats = [
        { label: 'Platform Uptime', value: telemetry.health.serverUptime, icon: <Activity className="text-green-500" />, sub: 'High Availability' },
        { label: 'API Latency', value: telemetry.health.apiLatency, icon: <Zap className="text-yellow-500" />, sub: 'Real-time Pulse' },
        { label: 'DB Cluster', value: telemetry.health.dbStatus, icon: <Database className="text-blue-500" />, sub: 'Primary Instance' },
        { label: 'Heap Memory', value: telemetry.health.memoryUsage, icon: <Cpu className="text-purple-500" />, sub: 'Resource Load' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12 pb-20"
        >
            {/* Header Control Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white flex items-center tracking-tighter">
                        <ShieldAlert className="mr-4 text-primary-600" size={40} /> COMMAND CENTER
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Level 4 Restricted Access • Kartiko Governance Dashboard
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => fetchTelemetry(true)}
                        disabled={refreshing}
                        className="p-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin text-primary-600' : 'text-gray-400'} />
                        <span className="dark:text-white text-gray-700">Sync Pipeline</span>
                    </button>
                    <div className="h-14 w-[1px] bg-gray-200 dark:bg-gray-800" />
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-black text-right text-gray-400 uppercase tracking-widest mb-1">Authorization</p>
                        <p className="text-sm font-black text-primary-600 text-right uppercase tracking-tighter">SUPER ADMIN CLEARANCE</p>
                    </div>
                </div>
            </div>

            {/* Platform Pulse Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {healthStats.map((stat, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-dark-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-gray-100 dark:border-gray-800">
                                {stat.icon}
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{stat.value}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{stat.label}</p>
                            <p className="text-[8px] font-bold text-primary-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{stat.sub}</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-600/5 rounded-full blur-xl group-hover:bg-primary-600/10 transition-colors" />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* User Governance & Role Distribution */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Role Chart */}
                        <div className="bg-white dark:bg-dark-card p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center">
                                    <UsersIcon className="mr-3 text-primary-600" size={20} /> User Demographics
                                </h3>
                            </div>
                            <div className="h-64 flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={roleData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {roleData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                            itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 grid grid-cols-1 gap-3">
                                {roleData.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{r.name}</span>
                                        </div>
                                        <span className="text-xs font-black dark:text-white">{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Snapshot */}
                        <div className="bg-gradient-to-br from-gray-900 to-black p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                            <div className="relative z-10">
                                <div className="flex items-center space-x-3 mb-8">
                                    <TrendingUp className="text-primary-400" size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Aggregate Revenue</span>
                                </div>
                                <h1 className="text-5xl font-black tracking-tighter mb-4">₹{telemetry.stats.totalRevenue.toLocaleString()}</h1>
                                <p className="text-xs font-medium text-gray-400">Total processed volume through platform merchant accounts.</p>
                            </div>
                            <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-1">Total Sales</p>
                                    <p className="text-lg font-black">{telemetry.stats.totalOrders}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-1">Total Assets</p>
                                    <p className="text-lg font-black">{telemetry.stats.totalProducts}</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px]" />
                        </div>
                    </div>

                    {/* Security Protocol Log */}
                    <div className="bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                                    <Database className="mr-3 text-primary-600" size={20} /> Security Event Stream
                                </h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Live Telemetry feed from server process</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-gray-800">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Action</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Initiator</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {[
                                        { action: 'Role Update: SUPER_ADMIN', actor: 'Root / SysAdmin', status: 'COMPLETED' },
                                        { action: 'System Audit Export', actor: 'kamal@kartiko.com', status: 'COMPLETED' },
                                        { action: 'Database Index Sync', actor: 'Automated Worker', status: 'COMPLETED' },
                                        { action: 'Unauthorized Panel Attempt', actor: 'IP: 45.12.8.29', status: 'REJECTED' },
                                    ].map((log, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all font-mono">
                                            <td className="px-8 py-6 text-xs font-black text-gray-900 dark:text-white">{log.action}</td>
                                            <td className="px-8 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{log.actor}</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${log.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* System Control Panel */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-dark-card p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col space-y-8 h-fit">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Governance Module</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Level 4 System Controls</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <button 
                                onClick={() => handleQuickAction('Key Rotation')}
                                className="w-full p-6 bg-gray-50 dark:bg-dark-bg hover:bg-primary-600 hover:text-white rounded-3xl transition-all flex items-center justify-between group border border-gray-100 dark:border-gray-800"
                            >
                                <div className="flex items-center space-x-4">
                                    <Lock size={20} className="text-primary-600 group-hover:text-white" />
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-widest">Rotate API Keys</p>
                                        <p className="text-[9px] font-bold opacity-60">Security Protocol 8C</p>
                                    </div>
                                </div>
                                <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100" />
                            </button>

                            <button 
                                onClick={() => handleQuickAction('Server Flush')}
                                className="w-full p-6 bg-gray-50 dark:bg-dark-bg hover:bg-orange-600 hover:text-white rounded-3xl transition-all flex items-center justify-between group border border-gray-100 dark:border-gray-800"
                            >
                                <div className="flex items-center space-x-4">
                                    <RefreshCw size={20} className="text-orange-600 group-hover:text-white" />
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-widest">Flush All Caches</p>
                                        <p className="text-[9px] font-bold opacity-60">Operations Protocol 2A</p>
                                    </div>
                                </div>
                                <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100" />
                            </button>

                            <button 
                                onClick={() => handleQuickAction('Log Archive Export')}
                                className="w-full p-6 bg-gray-50 dark:bg-dark-bg hover:bg-blue-600 hover:text-white rounded-3xl transition-all flex items-center justify-between group border border-gray-100 dark:border-gray-800"
                            >
                                <div className="flex items-center space-x-4">
                                    <Download size={20} className="text-blue-600 group-hover:text-white" />
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-widest">Download Logs</p>
                                        <p className="text-[9px] font-bold opacity-60">Archive Access</p>
                                    </div>
                                </div>
                                <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100" />
                            </button>

                            <button 
                                onClick={() => handleQuickAction('Platform Lock')}
                                className="w-full p-6 bg-red-50 hover:bg-red-600 hover:text-white rounded-3xl transition-all flex items-center justify-between group border border-red-100/50"
                            >
                                <div className="flex items-center space-x-4">
                                    <ShieldAlert size={20} className="text-red-500 group-hover:text-white" />
                                    <div className="text-left text-red-600 group-hover:text-white">
                                        <p className="text-xs font-black uppercase tracking-widest">Maintenance Mode</p>
                                        <p className="text-[9px] font-bold opacity-60">Critical Overwrite</p>
                                    </div>
                                </div>
                                <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>

                    {/* Network Status Widget */}
                    <div className="bg-primary-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Network Secure</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Global Access</h3>
                            <p className="text-xs opacity-60 font-medium mb-0">Platform is currently serving 14 geographic zones with 0 reported outages.</p>
                        </div>
                        <Globe className="absolute -right-10 -bottom-10 w-40 h-40 opacity-10" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SuperAdminControl;
