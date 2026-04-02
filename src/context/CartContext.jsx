import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            const existingItem = state.find(item => item.product === action.payload.product);
            if (existingItem) {
                return state.map(item =>
                    item.product === action.payload.product
                        ? { ...item, qty: item.qty + action.payload.qty }
                        : item
                );
            } else {
                return [...state, action.payload];
            }
        case 'REMOVE_FROM_CART':
            return state.filter(item => item.product !== action.payload.product);
        case 'UPDATE_QTY':
            return state.map(item =>
                item.product === action.payload.product
                    ? { ...item, qty: action.payload.qty }
                    : item
            );
        case 'CLEAR_CART':
            return [];
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, dispatch] = useReducer(cartReducer, [], () => {
        if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('kartiko_cart');
            return localData ? JSON.parse(localData) : [];
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('kartiko_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
    };

    const removeFromCart = (productId) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: { product: productId } });
    };

    const updateQty = (productId, qty) => {
        dispatch({ type: 'UPDATE_QTY', payload: { product: productId, qty } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
