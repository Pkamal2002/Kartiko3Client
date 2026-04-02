import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userWishlist, setUserWishlist] = useState([]);

    const fetchWishlist = async () => {
        try {
            const { data } = await api.get('/api/users/wishlist');
            // Mapping to IDs for simple `includes` checks
            setUserWishlist(data.map(p => typeof p === 'object' ? p._id : p));
        } catch (e) {
            console.log('Failed to fetch wishlist', e);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('kartiko_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchWishlist();
            } catch (error) {
                console.error('Failed to parse user from local storage');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('kartiko_user', JSON.stringify(userData));
        setUser(userData);
        fetchWishlist();
    };

    const logout = () => {
        localStorage.removeItem('kartiko_user');
        setUser(null);
        setUserWishlist([]);
    };

    const toggleWishlist = async (productId) => {
        try {
            const { data } = await api.post('/api/users/wishlist', { productId });
            setUserWishlist(data);
            return true;
        } catch (error) {
            console.error('Toggle wishlist failed', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, userWishlist, toggleWishlist }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
