import { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    Trash2, 
    Search, 
    Users as UsersIcon, 
    ShieldCheck, 
    User, 
    Mail, 
    Calendar,
    MoreVertical,
    ShieldAlert,
    ExternalLink,
    Filter,
    Lock,
    Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '../../components/common/Skeleton';

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/users');
            setUsers(data);
            setLoading(false);
        } catch (error) {
            toast.error('Identity lookup failed');
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Command Center | Participant Directory | Kartiko';
        fetchUsers();
    }, [currentUser]);

    const deleteHandler = async (id) => {
        if (window.confirm('IRREVERSIBLE ACTION: Permanently revoke system access for this participant?')) {
            try {
                await api.delete(`/api/users/${id}`);
                toast.success('Identity purged successfully');
                setUsers(users.filter(u => u._id !== id));
            } catch (error) {
                toast.error(error.response?.data?.message || 'Protocol failure during purge');
            }
        }
    };

    const handleToggleBlock = async (id, currentStatus) => {
        const action = currentStatus ? 'unblock' : 'block';
        if (window.confirm(`CONFIRMATION REQUIRED: Are you sure you want to ${action} this participant?`)) {
            try {
                const { data } = await api.patch(`/api/users/${id}/block`, {});
                toast.success(data.message);
                setUsers(users.map(u => u._id === id ? { ...u, isBlocked: data.isBlocked } : u));
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Access modification failed';
                toast.error(errorMessage);
            }
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u._id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'All' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    if (loading) return <TableSkeleton rows={10} />;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center">
                        <UsersIcon className="mr-4 text-primary-600" /> Participant Directory
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage ecosystem roles and platform access</p>
                </div>
                
                <div className="flex bg-white dark:bg-dark-card p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    {['All', 'user', 'admin', 'super_admin'].map(role => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRole === role ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {role.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-white dark:bg-dark-card p-4 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search by identity, email or unique identifier..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-dark-bg border-none p-5 pl-14 rounded-2xl text-xs font-bold outline-none focus:ring-4 ring-primary-500/10 dark:text-white"
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
            </div>

            {/* Directory Table */}
            <div className="bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identity Profile</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Node</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authority Level</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Onboarding</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ops</th>
                            </tr>
                        </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <Search size={48} className="text-gray-300 mb-6" />
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Zero Identity Match</h3>
                                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No participants found in current segment</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr 
                                        key={u._id} 
                                        className={`group transition-all ${
                                            u.isBlocked 
                                            ? 'bg-gray-50/50 dark:bg-dark-bg/20 opacity-60 grayscale-[0.5]' 
                                            : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                                        }`}
                                    >
                                        <td className="px-8 py-7">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                                                    u.role === 'super_admin' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-lg shadow-indigo-500/10' :
                                                    u.role === 'admin' ? 'bg-primary-50 border-primary-200 text-primary-600 shadow-lg shadow-primary-500/10' :
                                                    'bg-gray-50 dark:bg-dark-bg border-gray-100 dark:border-gray-800 text-gray-400'
                                                }`}>
                                                    {u.role === 'super_admin' ? <ShieldAlert size={20} /> : 
                                                     u.role === 'admin' ? <ShieldCheck size={20} /> : 
                                                     <User size={20} />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 dark:text-white mb-0.5">{u.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">ID: {u._id.substring(18).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <a href={`mailto:${u.email}`} className="group/link inline-flex items-center space-x-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                <Mail size={14} className="opacity-50" />
                                                <span>{u.email}</span>
                                                <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-all" />
                                            </a>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${
                                                u.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                u.role === 'admin' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400'
                                            }`}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                                u.isBlocked ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-red-500' : 'bg-green-500'}`} />
                                                <span>{u.isBlocked ? 'Blocked' : 'Active'}</span>
                                            </span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white mb-1">{new Date(u.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Protocol Start</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            {/* Prevent deleting/blocking yourself or other super_admins */}
                                            {u._id !== currentUser._id && u.role !== 'super_admin' ? (
                                                <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <button 
                                                        onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                                                        className={`p-3 rounded-2xl transition-all border ${
                                                            u.isBlocked 
                                                            ? 'bg-green-50 text-green-500 border-green-100 hover:text-green-700' 
                                                            : 'bg-orange-50 text-orange-500 border-orange-100 hover:text-orange-700'
                                                        }`}
                                                        title={u.isBlocked ? "Grant Access" : "Restrict Access"}
                                                    >
                                                        {u.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteHandler(u._id)}
                                                        className="p-3 rounded-2xl bg-red-50 text-red-500 hover:text-red-700 transition-all border border-red-100"
                                                        title="Revoke Identity"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-[9px] font-black uppercase tracking-widest text-primary-600 opacity-30 select-none">Protected Node</div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminUsers;
