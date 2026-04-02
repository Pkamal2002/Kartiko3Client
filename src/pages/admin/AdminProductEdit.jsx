import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    ArrowLeft, 
    UploadCloud, 
    Save, 
    Image as ImageIcon, 
    Sparkles, 
    Layers, 
    Tag as TagIcon, 
    Globe, 
    Info,
    CheckCircle2,
    Loader2,
    Plus,
    X,
    Trash2
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProductEdit = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        image: null,
        tags: [],
        seoTitle: '',
        seoDescription: '',
    });

    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get(`/api/products/${id}`),
                    api.get('/api/categories')
                ]);
                
                const data = prodRes.data;
                setCategories(catRes.data);
                
                setFormData({
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    category: typeof data.category === 'object' ? data.category._id : data.category,
                    stock: data.stock,
                    image: data.images && data.images.length > 0 ? data.images[0] : null,
                    tags: data.tags || [],
                    seoTitle: data.seoTitle || '',
                    seoDescription: data.seoDescription || '',
                });

                if (data.images && data.images.length > 0) {
                    setPreviewUrl(data.images[0].url);
                }
                setLoading(false);
            } catch (error) {
                toast.error('Identity lookup failed for this asset');
                navigate('/admin/products');
            }
        };

        if (user) fetchData();
    }, [id, user, navigate]);

    const handleAIDescription = async () => {
        if (!formData.name) {
            toast.error('Enter a product name first');
            return;
        }

        try {
            setGeneratingAI(true);
            const selectedCat = categories.find(c => c._id === formData.category);
            
            const { data } = await api.post('/api/ai/generate-description', {
                productName: formData.name,
                category: selectedCat ? selectedCat.name : 'Premium',
                keyFeatures: 'Modern, High-performance, Authentic Kartiko design'
            });

            setFormData(prev => ({ 
                ...prev, 
                description: data.description,
                tags: [...new Set([...prev.tags, ...(data.tags || [])])],
                seoTitle: data.seoTitle || `${formData.name} | Kartiko Premium`,
                seoDescription: data.shortSummary || data.description.substring(0, 160)
            }));
            
            toast.success('System Orchestration complete!', { icon: '✨' });
        } catch (error) {
            toast.error('AI generation failed');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));
        const formDataImage = new FormData();
        formDataImage.append('image', file);

        try {
            setUploading(true);
            const { data } = await api.post('/api/upload', formDataImage, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({
                ...prev,
                image: { public_id: data.public_id, url: data.url }
            }));
            toast.success('Cloud sync successful');
        } catch (error) {
            toast.error('Image upload failed');
            setPreviewUrl(formData.image?.url || null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                images: formData.image ? [formData.image] : []
            };

            await api.put(`/api/products/${id}`, payload);
            
            toast.success('Asset matrix updated');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
            setUpdating(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-5xl mx-auto pb-32">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-12"
            >
                <div className="flex items-center space-x-6">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-4 bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800"
                    >
                        <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black dark:text-white">Modify Asset</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">Updating: <span className="text-primary-600 font-black italic">{formData.name}</span></p>
                    </div>
                </div>
                <button 
                    onClick={handleSubmit}
                    disabled={updating || uploading}
                    className="btn-primary space-x-3 px-10 shadow-2xl shadow-primary-500/20"
                >
                    {updating ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Commit Changes</span>
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* Basic Info */}
                    <section className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center space-x-4 mb-10">
                            <div className="p-3 rounded-2xl bg-primary-50 text-primary-600"><Info size={20} /></div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Core Definition</h3>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Product Designation</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Market Price (₹)</label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Inventory Units</label>
                                    <input 
                                        type="number" 
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI Description */}
                    <section className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600"><Sparkles size={20} /></div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">AI Narrative</h3>
                            </div>
                            <button 
                                type="button"
                                onClick={handleAIDescription}
                                disabled={generatingAI}
                                className="flex items-center space-x-3 px-6 py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 disabled:opacity-50"
                            >
                                {generatingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                <span>Refine Matrix</span>
                            </button>
                        </div>
                        
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="8"
                            className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-[2rem] p-8 text-sm leading-relaxed outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white resize-none"
                        />
                    </section>
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Asset Visualization</p>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group aspect-square rounded-[2rem] bg-gray-50 dark:bg-dark-bg border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-all overflow-hidden"
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                            
                            {uploading ? (
                                <div className="flex flex-col items-center space-y-4">
                                    <Spinner />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Syncing Cloud</p>
                                </div>
                            ) : previewUrl ? (
                                <div className="relative w-full h-full p-4">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                        <Plus className="text-white" size={32} />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-6">
                                    <Plus size={32} className="mx-auto text-primary-600 mb-2" />
                                    <p className="text-xs font-black uppercase tracking-widest">Update Cloud</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 rounded-2xl bg-orange-50 text-orange-600"><Layers size={20} /></div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Logic & Metadata</h3>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase">Primary Category</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-dark-bg rounded-2xl p-4 text-xs font-bold outline-none dark:text-white border-none appearance-none"
                                >
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase">Search Clusters</label>
                                <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl min-h-[120px] flex flex-wrap gap-2 content-start">
                                    <AnimatePresence>
                                        {formData.tags.map(tag => (
                                            <motion.span 
                                                key={tag}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-[10px] font-black text-primary-600 flex items-center space-x-2 shadow-sm border border-gray-100 dark:border-gray-700"
                                            >
                                                <span>{tag}</span>
                                                <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                                            </motion.span>
                                        ))}
                                    </AnimatePresence>
                                    <input 
                                        type="text" 
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={addTag}
                                        placeholder="Add tag..."
                                        className="bg-transparent border-none outline-none text-xs font-bold flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-hidden relative">
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400"><Globe size={20} /></div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest">Global SEO Protocol</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">Target SEO Title</label>
                                    <input 
                                        name="seoTitle"
                                        value={formData.seoTitle}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">Meta Payload</label>
                                    <textarea 
                                        name="seoDescription"
                                        value={formData.seoDescription}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-blue-500 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px]" />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminProductEdit;
