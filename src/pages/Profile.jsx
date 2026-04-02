import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api.js';
import Spinner from '../components/common/Spinner';
import { User, Package, Settings, Save, MapPin, Plus, Trash2, CheckCircle, MapPin as MapPinIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    
    // Initialize tab from URL query
    const queryParams = new URLSearchParams(window.location.search);
    const initialTab = queryParams.get('tab') || 'details';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Profile Settings Form
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updating, setUpdating] = useState(false);

    // Addresses State
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '', city: '', state: '', zipCode: '', country: 'India', phone: '', isDefault: false
    });
    const [addingAddress, setAddingAddress] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/api/orders/myorders');
                setOrders(data);
                setLoadingOrders(false);
            } catch (error) {
                setLoadingOrders(false);
            }
        };

        const fetchAddresses = async () => {
            try {
                const { data } = await api.get('/api/auth/profile');
                setAddresses(data.addresses || []);
                setLoadingAddresses(false);
            } catch (error) {
                console.error('Failed to fetch addresses:', error);
                setLoadingAddresses(false);
            }
        };

        if (activeTab === 'orders') {
            fetchOrders();
        }
        if (activeTab === 'addresses') {
            fetchAddresses();
        }
    }, [user, navigate, activeTab]);

    // Handle tab change via URL
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const tab = queryParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [window.location.search]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setUpdating(true);
        try {
            const { data } = await api.put(
                '/api/users/profile',
                { name, email, password }
            );
            
            // Re-login to update global state with new token/user data
            // Assuming backend returns updated user. We need to preserve original token
            login({ ...data, token: user.token });
            
            toast.success('Profile updated successfully');
            setPassword('');
            setConfirmPassword('');
            setUpdating(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
            setUpdating(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Account</h1>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="md:w-1/4">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 space-y-2">
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'details' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <User size={20} />
                            <span>Account Details</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <Package size={20} />
                            <span>Order History</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('addresses')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'addresses' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <MapPin size={20} />
                            <span>My Addresses</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <Settings size={20} />
                            <span>Settings</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="md:w-3/4">
                    {/* DETAILS TAB */}
                    {activeTab === 'details' && (
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                            <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center"><User className="mr-3 text-primary-500" /> Account Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-dark-bg p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div>
                                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</span>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</span>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.email}</p>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account Role</span>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{user.role}</p>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Member Since</span>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Active</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ADDRESSES TAB */}
                    {activeTab === 'addresses' && (
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold dark:text-white flex items-center"><MapPin className="mr-3 text-primary-500" /> Saved Addresses</h2>
                                {!showAddressForm && (
                                    <button 
                                        onClick={() => setShowAddressForm(true)}
                                        className="btn-primary py-2 px-4 text-sm flex items-center"
                                    >
                                        <Plus size={16} className="mr-2" /> Add New Address
                                    </button>
                                )}
                            </div>

                            {showAddressForm && (
                                <div className="mb-8 p-6 bg-gray-50 dark:bg-dark-bg rounded-xl border border-primary-100 dark:border-primary-900/30">
                                    <h3 className="text-lg font-bold mb-4 dark:text-white">Add New Address</h3>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        setAddingAddress(true);
                                        try {
                                            const { data } = await api.post('/api/users/addresses', newAddress);
                                            setAddresses(data);
                                            setShowAddressForm(false);
                                            setNewAddress({ street: '', city: '', state: '', zipCode: '', country: 'India', phone: '', isDefault: false });
                                            toast.success('Address added successfully');
                                        } catch (error) {
                                            toast.error(error.response?.data?.message || 'Failed to add address');
                                        } finally {
                                            setAddingAddress(false);
                                        }
                                    }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <input 
                                                type="text" placeholder="Street Address" required
                                                value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                                                className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                            />
                                        </div>
                                        <input 
                                            type="text" placeholder="City" required
                                            value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                                            className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        />
                                        <input 
                                            type="text" placeholder="State" required
                                            value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                                            className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        />
                                        <input 
                                            type="text" placeholder="Zip Code" required
                                            value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})}
                                            className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        />
                                        <input 
                                            type="text" placeholder="Country" required
                                            value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})}
                                            className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        />
                                        <input 
                                            type="text" placeholder="Phone Number" required
                                            value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                                            className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        />
                                        <div className="md:col-span-2 flex items-center mt-2">
                                            <input 
                                                type="checkbox" id="isDefault" 
                                                checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})}
                                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            />
                                            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Set as default address</label>
                                        </div>
                                        <div className="md:col-span-2 flex space-x-3 mt-4">
                                            <button type="submit" disabled={addingAddress} className="btn-primary py-2 px-6 flex items-center">
                                                {addingAddress ? <Spinner /> : 'Save Address'}
                                            </button>
                                            <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {loadingAddresses ? (
                                <div className="flex justify-center p-10"><Spinner /></div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center bg-gray-50 dark:bg-dark-bg p-10 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <MapPinIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">You haven't saved any addresses yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map((addr) => (
                                        <div key={addr._id} className={`p-6 rounded-xl border transition-all ${addr.isDefault ? 'border-primary-500 bg-primary-50/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                {addr.isDefault ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">Default Address</span>
                                                ) : (
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                const { data } = await api.patch(`/api/users/addresses/${addr._id}/default`, {});
                                                                setAddresses(data);
                                                                toast.success('Default address updated');
                                                            } catch (error) {
                                                                toast.error('Failed to set default');
                                                            }
                                                        }}
                                                        className="text-xs text-gray-500 hover:text-primary-600 dark:text-gray-400 flex items-center"
                                                    >
                                                        <CheckCircle size={14} className="mr-1" /> Set as default
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={async () => {
                                                        if (window.confirm('Delete this address?')) {
                                                            try {
                                                                const { data } = await api.delete(`/api/users/addresses/${addr._id}`);
                                                                setAddresses(data);
                                                                toast.success('Address removed');
                                                            } catch (error) {
                                                                toast.error('Failed to delete address');
                                                            }
                                                        }
                                                    }}
                                                    className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <p className="text-gray-900 dark:text-white font-medium">{addr.street}</p>
                                            <p className="text-gray-500 dark:text-gray-400">{addr.city}, {addr.state} {addr.zipCode}</p>
                                            <p className="text-gray-500 dark:text-gray-400">{addr.country}</p>
                                            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">📞 {addr.phone}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                            <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center"><Settings className="mr-3 text-primary-500" /> Update Profile</h2>
                            <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors dark:text-white"
                                    />
                                </div>
                                <hr className="my-6 border-gray-200 dark:border-gray-700" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password (Optional)</label>
                                    <input 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors dark:text-white"
                                    />
                                </div>
                                <button type="submit" disabled={updating} className="btn-primary w-full py-3 flex items-center justify-center space-x-2">
                                    {updating ? <Spinner /> : <><Save size={18} /><span>Save Changes</span></>}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                            <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center"><Package className="mr-3 text-primary-500" /> Order History</h2>
                            {loadingOrders ? (
                                <div className="flex justify-center p-10"><Spinner /></div>
                            ) : orders.length === 0 ? (
                                <div className="text-center bg-gray-50 dark:bg-dark-bg p-10 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                                <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                            {orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-12 w-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                                                                <img src={order.orderItems[0].image} alt="" className="h-full w-full object-cover" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-bold text-gray-900 dark:text-white">#{order._id.substring(18).toUpperCase()}</div>
                                                                <div className="text-xs text-gray-500">{order.orderItems.length} {order.orderItems.length > 1 ? 'items' : 'item'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                                            order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                                                            order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                                                        }`}>
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => navigate(`/order/${order._id}`)}
                                                                className="text-primary-600 hover:text-primary-700 font-bold hover:underline"
                                                            >
                                                                Details
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
