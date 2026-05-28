import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pedidoService, Pedido, PedidoItem } from '@/services/posApi';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Send, XCircle, DollarSign
} from 'lucide-react';

const VerPedido = () => {
  const { mesaId } = useParams<{ mesaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      if (!mesaId) return;
      try {
        const pedidoData = await pedidoService.getActivoByMesa(mesaId);
        if (pedidoData) setPedido(pedidoData);
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [mesaId]);

  const actualizarCantidad = async (itemId: string, nuevaCantidad: number) => {
    if (!pedido || nuevaCantidad < 1) return;
    setActualizando(true);
    try {
      await pedidoService.updateItemCantidad(itemId, nuevaCantidad);
      if (mesaId) {
        const actualizado = await pedidoService.getActivoByMesa(mesaId);
        if (actualizado) setPedido(actualizado);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActualizando(false);
    }
  };

  const eliminarItem = async (itemId: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    setActualizando(true);
    try {
      await pedidoService.removeItem(itemId);
      if (mesaId) {
        const actualizado = await pedidoService.getActivoByMesa(mesaId);
        if (actualizado) setPedido(actualizado);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActualizando(false);
    }
  };

  const agregarProductos = () => navigate(`/pos/pedido/nuevo/${mesaId}`);

  const marcarParaCobrar = async () => {
    if (!pedido) return;
    if (!confirm('¿Marcar pedido para cobrar?')) return;
    setActualizando(true);
    try {
      await pedidoService.marcarParaCobrar(pedido.id);
      toast({ title: 'Listo para cobrar' });
      navigate('/pos/mesas');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActualizando(false);
    }
  };

  const cancelarPedido = async () => {
    if (!pedido) return;
    if (!confirm('¿Cancelar este pedido? Se liberará la mesa.')) return;
    setActualizando(true);
    try {
      await pedidoService.cancelar(pedido.id);
      toast({ title: 'Pedido cancelado' });
      navigate('/pos/mesas');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActualizando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">No hay pedido activo</h2>
        <p className="text-muted-foreground mb-4">Esta mesa no tiene ningún pedido</p>
        <Link to="/pos/mesas" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          Volver a Mesas
        </Link>
      </div>
    );
  }

  const items = pedido.items || [];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/pos/mesas" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Pedido Activo</h1>
              <p className="text-white/80 text-sm">Mesa {pedido.mesa?.numero}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${pedido.estado === 'activo' ? 'bg-primary/20 text-primary-foreground' : 'bg-secondary/20 text-secondary-foreground'}`}>
            {pedido.estado === 'activo' ? 'Activo' : 'Por Cobrar'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-muted/50">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay productos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{item.productoNombre}</h3>
                  <p className="text-muted-foreground text-sm">${Number(item.precioUnitario).toLocaleString('es-CU')} c/u</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} disabled={actualizando || item.cantidad <= 1}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-50">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.cantidad}</span>
                    <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} disabled={actualizando}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-50">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-20 text-right">
                    <span className="font-bold text-primary">${Number(item.subtotal).toLocaleString('es-CU')}</span>
                  </div>
                  <button onClick={() => eliminarItem(item.id)} disabled={actualizando}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border-t p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span>${Number(pedido.subtotal).toLocaleString('es-CU')}</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t">
            <span>Total</span><span className="text-primary">${Number(pedido.total).toLocaleString('es-CU')}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={agregarProductos} className="py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Agregar
          </button>
          <button onClick={marcarParaCobrar} disabled={actualizando || items.length === 0}
            className="py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <DollarSign className="w-5 h-5" /> Cobrar
          </button>
        </div>
        <button onClick={cancelarPedido} disabled={actualizando}
          className="w-full py-3 text-destructive text-sm hover:bg-destructive/10 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
          <XCircle className="w-4 h-4" /> Cancelar Pedido
        </button>
      </div>
    </div>
  );
};

export default VerPedido;