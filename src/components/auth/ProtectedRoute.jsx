import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

    if (!user) {
        return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
    }

    return children;
};

export const AdminRoute = ({ children, requireSuperAdmin = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

    if (!user) {
        return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
        return <Navigate to="/" replace />;
    }

    if (requireSuperAdmin && user.role !== 'super_admin') {
        return <Navigate to="/admin" replace />;
    }

    return children;
};
