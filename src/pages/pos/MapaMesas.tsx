import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mesaService, pedidoService, Mesa, Pedido } from '@/services/posApi';
import { authService } from '@/services/posApi';
import MesaCard from '@/components/pos/MesaCard';
import { useToast } from '@/hooks/use-toast';
import { LayoutGrid, RefreshCw, AlertCircle } from 'lucide-react';

const MapaMesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [pedidos, setPedidos] = useState<Map<string, Pedido>>(new Map());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const { toast } = useToast();

  const cargarDatos = async () => {
    try {
      setError(null);
      const [mesasData, pedidosData] = await Promise.all([
        mesaService.getAll(),
        pedidoService.getActivos(),
      ]);

      setMesas(mesasData);

      // Mapear pedidos por mesaId
      const pedidosMap = new Map<string, Pedido>();
      pedidosData.forEach((pedido) => {
        pedidosMap.set(pedido.mesaId, pedido);
      });
      setPedidos(pedidosMap);
    } catch (error: any) {
      setError('No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo en http://localhost:3000');
      console.error('Error cargando mesas:', error);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    
    // Auto-refresh cada 10 segundos
    const interval = setInterval(cargarDatos, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleActualizar = () => {
    setActualizando(true);
    cargarDatos();
  };

  // Agrupar mesas por estado
  const mesasLibres = mesas.filter(m => m.estado === 'libre');
  const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada');
  const mesasPorCobrar = mesas.filter(m => m.estado === 'por_cobrar');

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mesas</h1>
          <p className="text-muted-foreground">Gestiona las mesas del restaurante</p>
        </div>
        <button
          onClick={handleActualizar}
          disabled={actualizando}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${actualizando ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Error de conexión */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-400 font-medium">{error}</p>
          <p className="text-red-400/80 text-sm mt-1">Inicia el backend con: cd backend && npm run dev</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent">{mesasLibres.length}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Libres</p>
              <p className="font-semibold text-foreground">Disponibles</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{mesasOcupadas.length}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ocupadas</p>
              <p className="font-semibold text-foreground">Con pedido</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-secondary">{mesasPorCobrar.length}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Por Cobrar</p>
              <p className="font-semibold text-foreground">Esperando</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {mesas.map((mesa) => (
          <MesaCard
            key={mesa.id}
            mesa={mesa}
            pedidoActivo={pedidos.get(mesa.id)}
            onActualizar={cargarDatos}
          />
        ))}
      </div>
    </div>
  );
};

export default MapaMesas;