import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pedidoService, cajaService, Pedido } from '@/services/posApi';
import { authService } from '@/services/posApi';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  RefreshCw,
  DollarSign,
  Clock,
  ArrowRight,
  AlertCircle,
  Lock
} from 'lucide-react';

const Cobros = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [cajaCerrada, setCajaCerrada] = useState(false);

  const user = authService.getUser();

  const cargarDatos = async () => {
    try {
      setError(null);
      
      // Verificar caja primero
      const cajaEstado = await cajaService.getEstado();
      if (!cajaEstado || cajaEstado.estado !== 'abierta') {
        setCajaCerrada(true);
        setCargando(false);
        return;
      }

      const pedidosData = await pedidoService.getPorCobrar();
      setPedidos(pedidosData);
    } catch (error: any) {
      setError('No se pudo conectar al servidor.');
      console.error('Error cargando cobros:', error);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleActualizar = () => {
    setActualizando(true);
    cargarDatos();
  };

  // Calcular totales
  const totalPorCobrar = pedidos.reduce((sum, p) => sum + Number(p.total), 0);
  const cantidadPedidos = pedidos.length;

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando cobros...</p>
        </div>
      </div>
    );
  }

  if (cajaCerrada) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Caja Cerrada</h2>
          <p className="text-muted-foreground mb-4">
            La caja está cerrada. No se pueden procesar cobros.
          </p>
          <Link
            to="/pos/caja"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Abrir Caja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cobros Pendientes</h1>
          <p className="text-muted-foreground">Mesas esperando pago</p>
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
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm">Total por Cobrar</p>
              <p className="text-2xl font-bold">
                ${totalPorCobrar.toLocaleString('es-CU')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Pedidos</p>
              <p className="text-2xl font-bold text-foreground">
                {cantidadPedidos}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de pedidos por cobrar */}
      {pedidos.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">¡Todo al día!</h2>
          <p className="text-muted-foreground">No hay mesas pendientes de cobro</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <div 
              key={pedido.id}
              className="bg-card rounded-2xl p-4 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {pedido.mesa?.numero || '-'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Mesa {pedido.mesa?.numero}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {pedido.items?.length || 0} productos
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(pedido.createdAt).toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                        {pedido.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    ${Number(pedido.total).toLocaleString('es-CU')}
                  </p>
                  <Link
                    to={`/pos/cierre/${pedido.mesaId}?pedidoId=${pedido.id}`}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  >
                    Cobrar <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cobros;