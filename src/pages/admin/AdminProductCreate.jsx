import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    X
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProductCreate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
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
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, category: data[0]._id }));
                }
            } catch (error) {
                toast.error('Failed to load categories');
            }
        };
        if (user) fetchCategories();
    }, [user]);

    const handleAIDescription = async () => {
        if (!formData.name) {
            toast.error('Enter a product name first');
            return;
        }

        try {
            setGeneratingAI(true);
            const selectedCat = categories.find(c => c._id === formData.category);
            
            // Using Groq backend endpoint
            const { data } = await api.post('/api/ai/generate-description', {
                productName: formData.name,
                category: selectedCat ? selectedCat.name : 'General',
                keyFeatures: 'Premium quality, High durability, Modern design'
            });

            // Assuming the AI returns a structured matrix
            setFormData(prev => ({ 
                ...prev, 
                description: data.description,
                tags: [...new Set([...prev.tags, ...(data.tags || [])])],
                seoTitle: data.seoTitle || `${formData.name} - Kartiko Premium`,
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
            toast.success('Cloud upload successful');
        } catch (error) {
            toast.error('Image upload failed');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.description || !formData.stock) {
            toast.error('Fill required fields');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                images: formData.image ? [formData.image] : []
            };

            await api.post('/api/products', payload);
            
            toast.success('Product published!');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Creation failed');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-32">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
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
                        <h2 className="text-3xl font-black dark:text-white">New Masterpiece</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Create and publish a premium product</p>
                    </div>
                </div>
                <button 
                    onClick={handleSubmit}
                    disabled={loading || uploading}
                    className="btn-primary space-x-2 px-10"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    <span>Publish Item</span>
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Form */}
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 rounded-xl bg-primary-100 text-primary-600"><Info size={18} /></div>
                            <h3 className="text-xl font-black">Basic Information</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Product Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter definitive product title"
                                        className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Retail Price (₹)</label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Inventory Stock</label>
                                    <input 
                                        type="number" 
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        placeholder="Units in warehouse"
                                        className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-xl bg-purple-100 text-purple-600"><Sparkles size={18} /></div>
                                <h3 className="text-xl font-black">AI Storytelling</h3>
                            </div>
                            <button 
                                type="button"
                                onClick={handleAIDescription}
                                disabled={generatingAI}
                                className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 disabled:opacity-50"
                            >
                                {generatingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                <span>{generatingAI ? 'Writing...' : 'Generate with AI'}</span>
                            </button>
                        </div>
                        
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="8"
                            placeholder="Tell the story of your product..."
                            className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-[2rem] p-8 text-sm leading-relaxed outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white resize-none"
                        />
                    </section>
                </div>

                {/* Right Column / Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Product Media</h3>
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
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" />
                            ) : (
                                <div className="text-center p-6">
                                    <div className="p-5 bg-white dark:bg-dark-card rounded-3xl shadow-xl inline-block mb-4 text-primary-600">
                                        <Plus size={32} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Upload Asset</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 rounded-xl bg-orange-100 text-orange-600"><Layers size={18} /></div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Organization</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Master Category</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-dark-bg rounded-2xl p-4 text-xs font-bold outline-none dark:text-white"
                                >
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Search Tags (Enter)</label>
                                <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-2xl min-h-[100px] flex flex-wrap gap-2">
                                    <AnimatePresence>
                                        {formData.tags.map(tag => (
                                            <motion.span 
                                                key={tag}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-[10px] font-black text-primary-600 flex items-center space-x-2 shadow-sm"
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

                    <section className="bg-gray-900 dark:bg-dark-card p-10 rounded-[2.5rem] text-white">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400"><Globe size={18} /></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Global SEO</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-3">SEO Optimized Title</label>
                                <input 
                                    name="seoTitle"
                                    value={formData.seoTitle}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-3">Meta Description</label>
                                <textarea 
                                    name="seoDescription"
                                    value={formData.seoDescription}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-blue-500 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminProductCreate;
