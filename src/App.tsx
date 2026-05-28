import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import Admin from "./pages/Admin.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import MenuManager from "./pages/admin/MenuManager.tsx";
import OrdersManager from "./pages/admin/OrdersManager.tsx";
import ReservationsManager from "./pages/admin/ReservationsManager.tsx";
import ReviewsManager from "./pages/admin/ReviewsManager.tsx";

// POS - Login
import PosLogin from "./pages/pos/PosLogin.tsx";
import PosLayout from "./pages/pos/PosLayout.tsx";
import MapaMesas from "./pages/pos/MapaMesas.tsx";
import TomaPedidos from "./pages/pos/TomaPedidos.tsx";
import VerPedido from "./pages/pos/VerPedido.tsx";
import Cobros from "./pages/pos/Cobros.tsx";
import CierreMesa from "./pages/pos/CierreMesa.tsx";
import Configuracion from "./pages/pos/Configuracion.tsx";
import Historial from "./pages/pos/Historial.tsx";
import AperturaCaja from "./pages/pos/AperturaCaja.tsx";

// POS - Auth
import { authService, AuthUser } from "./services/posApi";

// Componente para proteger rutas
const RequirePosAuth = ({ children }: { children: React.ReactNode }) => {
  const user = authService.getUser();
  if (!user) {
    return <Navigate to="/pos/login" replace />;
  }
  return <>{children}</>;
};

// Layout del POS con el usuario
const PosLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const user = authService.getUser() as AuthUser;
  if (!user) {
    return <Navigate to="/pos/login" replace />;
  }
  return <PosLayout user={user}>{children}</PosLayout>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Sitio público */}
          <Route path="/" element={<Index />} />
          
          {/* Admin (legacy) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />}>
            <Route index element={<Dashboard />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="orders" element={<OrdersManager />} />
            <Route path="reservations" element={<ReservationsManager />} />
            <Route path="reviews" element={<ReviewsManager />} />
          </Route>

          {/* POS - Login */}
          <Route path="/pos/login" element={<PosLogin />} />

          {/* POS - Rutas protegidas */}
          <Route path="/pos" element={
            <RequirePosAuth>
              <PosLayoutWrapper>
                <Navigate to="/pos/mesas" replace />
              </PosLayoutWrapper>
            </RequirePosAuth>
          } />
          
          {/* MESERA */}
          <Route path="/pos/mesas" element={
            <RequirePosAuth>
              <PosLayoutWrapper>
                <MapaMesas />
              </PosLayoutWrapper>
            </RequirePosAuth>
          } />
          <Route path="/pos/pedido/nuevo/:mesaId" element={
            <RequirePosAuth>
              <PosLayoutWrapper>
                <TomaPedidos />
              </PosLayoutWrapper>
            </RequirePosAuth>
          } />
          <Route path="/pos/pedido/:mesaId" element={
            <RequirePosAuth>
              <PosLayoutWrapper>
                <VerPedido />
              </PosLayoutWrapper>
            </RequirePosAuth>
          } />

          {/* CAJERA */}
          <Route path="/pos/caja" element={
            <RequirePosAuth>
              <PosLayoutWrapper>
                <AperturaCaja />
              </PosLayoutWrapper>
            </RequirePosAuth>
          } />
          <Route path="/pos/cobros" element={
            <RequirePosAuth>
              <PosLayoutWrapper>
                <Cobros />
              </PosLayoutWrapper>
            </RequirePosAuth>
          } />
          <Route path="/pos/cierre/:mesaId" element={
            <RequirePosAuth>
              <PosLayoutWrapper>
                <CierreMesa />
              </PosLayoutWrapper>
            </RequirePosAuth>
          } />
          <Route path="/pos/config" element={
            <RequirePosAuth>
              <PosLayoutWrapper>
                <Configuracion />
              </PosLayoutWrapper>
            </RequirePosAuth>
          } />
          <Route path="/pos/historial" element={
            <RequirePosAuth>
              <PosLayoutWrapper>
                <Historial />
              </PosLayoutWrapper>
            </RequirePosAuth>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;