import { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, Save, X, Tag } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

const AdminCategories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load categories');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/api/categories/${editingId}`, { name, description });
                toast.success('Category updated');
            } else {
                await api.post('/api/categories', { name, description });
                toast.success('Category created');
            }
            setName('');
            setDescription('');
            setEditingId(null);
            setIsAdding(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Delete this category? This might affect products using it.')) {
            try {
                await api.delete(`/api/categories/${id}`);
                toast.success('Category deleted');
                fetchCategories();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Delete failed');
            }
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat._id);
        setName(cat.name);
        setDescription(cat.description || '');
        setIsAdding(true);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold dark:text-white flex items-center">
                    <Tag className="mr-3 text-primary-500" /> Category Management
                </h2>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center">
                        <Plus size={20} className="mr-2" /> Add Category
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold dark:text-white">{editingId ? 'Edit Category' : 'New Category'}</h3>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); setName(''); setDescription(''); }} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm outline-none dark:text-white focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm outline-none dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-gray-500 font-medium">Cancel</button>
                            <button type="submit" className="btn-primary flex items-center px-8">
                                <Save size={18} className="mr-2" /> {editingId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-20"><Spinner /></div>
            ) : (
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-dark-bg">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {categories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{cat.name}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate">{cat.description || 'No description'}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => startEdit(cat)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => deleteHandler(cat._id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
