import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-xl w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-9xl font-black text-primary-600/20 dark:text-primary-400/10 relative">
                        404
                        <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white">
                            Oops!
                        </span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg leading-relaxed">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            to="/" 
                            className="btn-primary px-8 py-4 flex items-center justify-center w-full sm:w-auto"
                        >
                            <Home className="mr-2" size={20} />
                            Back to Home
                        </Link>
                        <button 
                            onClick={() => window.history.back()}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center w-full sm:w-auto border border-gray-200 dark:border-gray-700"
                        >
                            <ArrowLeft className="mr-2" size={20} />
                            Go Back
                        </button>
                    </div>

                    <div className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-400 mb-4 uppercase tracking-widest font-bold">Try searching for something else</p>
                        <div className="relative max-w-sm mx-auto">
                           <input 
                                type="text" 
                                placeholder="Search products..."
                                className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                           />
                           <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;
