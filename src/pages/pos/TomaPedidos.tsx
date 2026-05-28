import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mesaService, menuService, pedidoService, Mesa, Categoria, Producto } from '@/services/posApi';
import { authService } from '@/services/posApi';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle,
  Search
} from 'lucide-react';

// Item temporal para agregar al pedido
interface ItemTemporal {
  productoId: string;
  productoNombre: string;
  precio: number;
  cantidad: number;
}

const TomaPedidos = () => {
  const { mesaId } = useParams<{ mesaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const user = authService.getUser();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [items, setItems] = useState<ItemTemporal[]>([]);
  const [creando, setCreando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const cargar = async () => {
      try {
        if (mesaId) {
          const mesaData = await mesaService.getById(mesaId);
          setMesa(mesaData);
        }

        const [cats, prods] = await Promise.all([
          menuService.getCategorias(),
          menuService.getProductos(),
        ]);

        setCategorias(cats);
        setProductos(prods.filter(p => p.activo));
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [mesaId]);

  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaSeleccionada === 'todas' || p.categoriaId === categoriaSeleccionada;
    const coincideBusqueda = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  // Agregar item al carrito temporal
  const agregarItem = (producto: Producto) => {
    const existente = items.find(i => i.productoId === producto.id);
    if (existente) {
      setItems(items.map(i => i.productoId === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setItems([...items, {
        productoId: producto.id,
        productoNombre: producto.nombre,
        precio: Number(producto.precio),
        cantidad: 1,
      }]);
    }
  };

  // Actualizar cantidad
  const actualizarCantidad = (productoId: string, cambio: number) => {
    const existente = items.find(i => i.productoId === productoId);
    if (!existente) return;

    const nuevaCantidad = existente.cantidad + cambio;
    if (nuevaCantidad <= 0) {
      setItems(items.filter(i => i.productoId !== productoId));
    } else {
      setItems(items.map(i => i.productoId === productoId ? { ...i, cantidad: nuevaCantidad } : i));
    }
  };

  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  // Crear pedido
  const crearPedido = async () => {
    if (!mesaId || !user || items.length === 0) return;

    setCreando(true);
    try {
      await pedidoService.create({
        mesaId,
        meseraId: user.id,
        items: items.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
      });

      toast({
        title: 'Pedido creado',
        description: `Mesa ${mesa?.numero} - ${items.length} items`,
      });

      navigate('/pos/mesas');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/pos/mesas" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Nueva Orden</h1>
              <p className="text-primary-foreground/80 text-sm">
                Mesa {mesa?.numero} • {mesa?.nombre || 'Sin nombre'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold">{items.length}</span>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="p-4 bg-card border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-card border-b overflow-x-auto">
        <div className="flex gap-2 p-4">
          <button
            onClick={() => setCategoriaSeleccionada('todas')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
              categoriaSeleccionada === 'todas'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaSeleccionada(cat.id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                categoriaSeleccionada === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de productos */}
      <div className="flex-1 overflow-auto p-4 bg-muted/50">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {productosFiltrados.map((producto) => {
            const itemEnCarrito = items.find(i => i.productoId === producto.id);
            return (
              <div
                key={producto.id}
                onClick={() => agregarItem(producto)}
                className={`bg-card rounded-xl p-3 border-2 cursor-pointer transition-all ${
                  itemEnCarrito ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-foreground text-sm line-clamp-2">
                    {producto.nombre}
                  </h3>
                  {itemEnCarrito && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {itemEnCarrito.cantidad}
                    </span>
                  )}
                </div>
                <p className="text-primary font-bold">
                  ${Number(producto.precio).toLocaleString('es-CU')}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carrito */}
      {items.length > 0 && (
        <div className="bg-card border-t p-4">
          <div className="max-h-32 overflow-auto mb-3 space-y-2">
            {items.map((item) => (
              <div key={item.productoId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => actualizarCantidad(item.productoId, -1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-medium">{item.cantidad}</span>
                  <button onClick={() => actualizarCantidad(item.productoId, 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">{item.productoNombre}</span>
                </div>
                <span className="font-medium">${(item.precio * item.cantidad).toLocaleString('es-CU')}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
            <span className="text-xl font-bold text-primary">${subtotal.toLocaleString('es-CU')}</span>
          </div>
          <button
            onClick={crearPedido}
            disabled={creando || items.length === 0}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-lg rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creando ? 'Creando...' : <><CheckCircle className="w-5 h-5" /> Crear Pedido</>}
          </button>
        </div>
      )}
    </div>
  );
};

export default TomaPedidos;