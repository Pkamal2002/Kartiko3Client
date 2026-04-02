import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
    User, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    Code, 
    Globe, 
    ShieldPlus,
    Zap
} from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, login } = useAuth();

    const redirectParam = new URLSearchParams(location.search).get('redirect') || '/';
    const redirect = redirectParam.startsWith('/') ? redirectParam : `/${redirectParam}`;

    useEffect(() => {
        if (user) {
            navigate(redirect, { replace: true });
        }
    }, [user, navigate, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/register', { name, email, password });
            login(data);
            toast.success('Registration Successful', {
                icon: '🎉',
                style: { borderRadius: '1rem', background: '#333', color: '#fff' }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration Failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-[2rem] text-white shadow-2xl shadow-primary-500/40 mb-6"
                    >
                        <ShieldPlus size={32} />
                    </motion.div>
                    <h2 className="text-4xl font-black dark:text-white tracking-tighter">
                        Join the Elite<span className="text-primary-600">.</span>
                    </h2>
                    <p className="mt-3 text-sm text-gray-500 font-medium">
                        Create your Kartiko instance and start orchestrating.
                    </p>
                </div>

                <div className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none">
                    <form className="space-y-6" onSubmit={submitHandler}>
                        <div className="space-y-4">
                            {/* Name Field */}
                            <div className="relative group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4 mb-2 block">Full Designation</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Alex Mercer"
                                        className="input-premium"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="relative group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4 mb-2 block">Identity Identifier</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="nexus@kartiko.io"
                                        className="input-premium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="relative group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4 mb-2 block">Security Key</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••••"
                                        className="input-premium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative group border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4 mb-2 block">Validate Key</label>
                                <div className="relative">
                                    <ShieldPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="input-premium"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-5 rounded-[2rem] text-sm font-black tracking-[0.2em] uppercase shadow-2xl relative overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                                {loading ? (
                                    <Zap className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <span>Initialize Instance</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center py-4">
                            <div className="absolute inset-0 flex items-center px-8 text-gray-200 dark:text-gray-800"><div className="w-full border-t border-current"></div></div>
                            <span className="relative bg-transparent px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Social Matrix</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button type="button" className="flex items-center justify-center py-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                                <Globe size={18} className="text-gray-500 group-hover:text-primary-600 transition-colors" />
                            </button>
                            <button type="button" className="flex items-center justify-center py-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                                <Code size={18} className="text-gray-500 group-hover:text-primary-600 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Already authenticated?{' '}
                    <Link to={`/login?redirect=${redirect}`} className="text-primary-600 hover:text-primary-500 transition-colors underline underline-offset-4 decoration-primary-600/30">
                        Synchronize Session
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
