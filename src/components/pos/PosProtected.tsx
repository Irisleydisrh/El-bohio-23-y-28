import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService, AuthUser } from '@/services/posApi';

interface PosProtectedProps {
  children: React.ReactNode;
}

export const usePosAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  return { user, loading };
};

export const PosProtected = ({ children }: PosProtectedProps) => {
  const location = useLocation();
  const { user, loading } = usePosAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Verificando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/pos/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const PosRequireRole = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode; 
  requiredRole: 'CAJERO' | 'MESERO' 
}) => {
  const { user, loading } = usePosAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/pos/login" replace />;
  }

  if (user.rol !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-gray-400 mb-4">
            Necesitas ser {requiredRole} para acceder a esta sección
          </p>
          <a 
            href="/pos/login" 
            className="inline-block px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
          >
            Ir al login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PosProtected;