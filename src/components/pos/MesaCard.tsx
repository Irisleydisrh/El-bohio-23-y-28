import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mesaService, pedidoService, Mesa, Pedido } from '@/services/posApi';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Clock, 
  ShoppingBag, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface MesaCardProps {
  mesa: Mesa;
  pedidoActivo?: Pedido | null;
  onActualizar: () => void;
}

const MesaCard = ({ mesa, pedidoActivo, onActualizar }: MesaCardProps) => {
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  // Colores según estado
  const getColores = () => {
    switch (mesa.estado) {
      case 'libre':
        return {
          bg: 'bg-accent',
          border: 'border-accent',
          text: 'text-accent',
          badge: 'bg-accent/20 text-accent',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'ocupada':
        return {
          bg: 'bg-primary',
          border: 'border-primary',
          text: 'text-primary',
          badge: 'bg-primary/20 text-primary',
          icon: <ShoppingBag className="w-4 h-4" />
        };
      case 'por_cobrar':
        return {
          bg: 'bg-secondary',
          border: 'border-secondary',
          text: 'text-secondary',
          badge: 'bg-secondary/20 text-secondary',
          icon: <AlertCircle className="w-4 h-4" />
        };
    }
  };

  const colores = getColores();
  const tienePedido = pedidoActivo && mesa.estado !== 'libre';

  // Al abrir mesa, navegar directamente a crear pedido
  const handleAbrirMesa = () => {
    window.location.href = `/pos/pedido/nuevo/${mesa.id}`;
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${colores.border} bg-card
        hover:shadow-xl hover:scale-[1.02] cursor-pointer group
      `}
    >
      {/* Header con color según estado */}
      <div className={`${colores.bg} p-3 flex items-center justify-between`}>
        <span className="text-primary-foreground font-bold text-xl">Mesa {mesa.numero}</span>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colores.badge}`}>
          {colores.icon}
          {mesa.estado === 'libre' && 'Libre'}
          {mesa.estado === 'ocupada' && 'Ocupada'}
          {mesa.estado === 'por_cobrar' && 'Por Cobrar'}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Capacidad */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">Capacidad: {mesa.capacidad} personas</span>
        </div>

        {/* Estado del pedido */}
        {tienePedido && (
          <div className={`flex items-center gap-2 p-2 rounded-lg ${colores.badge}`}>
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-medium">
              {Number(pedidoActivo.total).toLocaleString('es-CU')} CUP
            </span>
          </div>
        )}

        {/* Acciones según estado */}
        <div className="pt-2">
          {mesa.estado === 'libre' && (
            <button
              onClick={handleAbrirMesa}
              disabled={cargando}
              className="w-full py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {cargando ? '...' : 'Abrir Mesa'}
            </button>
          )}

          {mesa.estado === 'ocupada' && (
            <Link
              to={`/pos/pedido/${mesa.id}`}
              className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Ver Pedido <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {mesa.estado === 'por_cobrar' && (
            <Link
              to={`/pos/cierre/${mesa.id}`}
              className="w-full flex items-center justify-center gap-2 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Cobrar <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MesaCard;