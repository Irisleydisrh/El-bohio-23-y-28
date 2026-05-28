import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { authService, AuthUser } from '@/services/posApi';
import { ErrorBoundary } from '@/components/pos/ErrorBoundary';
import { 
  ChefHat, 
  LayoutGrid, 
  Receipt, 
  CreditCard, 
  Settings, 
  LogOut,
  Plus,
  Clock,
  History,
  DollarSign
} from 'lucide-react';

interface PosLayoutProps {
  user: AuthUser;
}

const PosLayout = ({ user }: PosLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('User loaded:', user);
  console.log('User rol:', user?.rol);
  
  const isCajera = user.rol === 'CAJERO';

  const handleLogout = () => {
    authService.logout();
    navigate('/pos/login');
  };

  // DEBUG: mostra siempre todas las opciones
  const navItems = [
    { label: 'Cobros', href: '/pos/cobros', icon: CreditCard, visible: isCajera },
    { label: 'Caja', href: '/pos/caja', icon: DollarSign, visible: isCajera },
    { label: 'Mesas', href: '/pos/mesas', icon: LayoutGrid, visible: true },
    { label: 'Historial', href: '/pos/historial', icon: History, visible: isCajera },
    { label: 'Configuración', href: '/pos/config', icon: Settings, visible: isCajera },
  ];

  const getRoleBadge = () => {
    return isCajera ? (
      <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
        CAJERO
      </span>
    ) : (
      <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-bold rounded-full">
        MESERO
      </span>
    );
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-foreground font-bold text-lg">El Bohío</h1>
              <p className="text-muted-foreground text-xs">Sistema POS</p>
            </div>
          </div>
        </div>

        {/* Usuario */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium text-sm">{user.firstName || user.email}</p>
              {getRoleBadge()}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.filter(item => item.visible !== false).map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Hora */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto bg-background">
        <ErrorBoundary
          fallback={
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
                <p className="text-muted-foreground mb-6">Recarga la página para continuar</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Recargar
                </button>
              </div>
            </div>
          }
        >
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default PosLayout;