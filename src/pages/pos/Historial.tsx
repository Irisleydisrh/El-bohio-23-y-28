import { useState, useEffect } from 'react';
import { transaccionService, Transaccion } from '@/services/posApi';
import { useToast } from '@/hooks/use-toast';
import { 
  History, 
  RefreshCw,
  DollarSign,
  Calendar,
  Search,
  Receipt,
  Filter
} from 'lucide-react';

const Historial = () => {
  const { toast } = useToast();

  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState<'hoy' | 'ayer' | 'semana' | 'todos'>('hoy');
  const [busqueda, setBusqueda] = useState('');

  const cargarDatos = async () => {
    try {
      let data: Transaccion[];
      
      // Calcular rango de fechas
      const now = new Date();
      let inicio: string;
      let fin: string;

      if (filtroFecha === 'hoy') {
        inicio = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        fin = new Date(now.setHours(23, 59, 59, 999)).toISOString();
      } else if (filtroFecha === 'ayer') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        inicio = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
        fin = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
      } else if (filtroFecha === 'semana') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        inicio = weekAgo.toISOString();
        fin = now.toISOString();
      } else {
        // todos - traer todo
        data = await transaccionService.getAll();
        setTransacciones(data);
        setCargando(false);
        return;
      }

      const dataFiltrada = await transaccionService.getByDateRange(
        inicio.split('T')[0],
        fin.split('T')[0]
      );
      setTransacciones(dataFiltrada);
    } catch (error: any) {
      toast({
        title: 'Error al cargar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtroFecha]);

  // Filtrar por búsqueda
  const transaccionesFiltradas = transacciones.filter(t => 
    busqueda === '' || 
    t.numeroTransaccion.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.mesaNumero.toString().includes(busqueda)
  );

  // Calcular totales
  const totalVentas = transaccionesFiltradas.reduce((sum, t) => sum + Number(t.totalLocal), 0);
  const totalUSD = transaccionesFiltradas.reduce((sum, t) => sum + Number(t.totalUSD), 0);
  const cantidadTransacciones = transaccionesFiltradas.length;

  const formatoFecha = (fecha: string) => new Date(fecha).toLocaleString('es-CU', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const getFormaPagoLabel = (forma: string) => {
    const labels: Record<string, string> = {
      efectivo_local: 'Efectivo (CUP)',
      efectivo_usd: 'Efectivo (USD)',
      mixto: 'Mixto',
      tarjeta: 'Tarjeta'
    };
    return labels[forma] || forma;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial de Ventas</h1>
          <p className="text-muted-foreground">Transacciones del día</p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por número o mesa..."
            className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {(['hoy', 'ayer', 'semana', 'todos'] as const).map((fecha) => (
            <button
              key={fecha}
              onClick={() => setFiltroFecha(fecha)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filtroFecha === fecha
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {fecha === 'hoy' ? 'Hoy' : fecha === 'ayer' ? 'Ayer' : fecha === 'semana' ? '7 días' : 'Todo'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm">Ventas Total</p>
              <p className="text-2xl font-bold">${totalVentas.toLocaleString('es-CU')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Transacciones</p>
              <p className="text-2xl font-bold text-foreground">{cantidadTransacciones}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">En USD</p>
              <p className="text-2xl font-bold text-foreground">${totalUSD.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de transacciones */}
      {transaccionesFiltradas.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Sin transacciones</h2>
          <p className="text-muted-foreground">No hay ventas en el período seleccionado</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
            <div>Ticket</div>
            <div>Mesa</div>
            <div>Fecha</div>
            <div>Forma de Pago</div>
            <div>Monto (CUP)</div>
            <div>Monto (USD)</div>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-auto">
            {transaccionesFiltradas.map((t) => (
              <div key={t.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-muted/50 transition-colors">
                <div>
                  <span className="font-mono text-sm text-primary">{t.numeroTransaccion}</span>
                </div>
                <div>
                  <span className="font-medium">Mesa {t.mesaNumero}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatoFecha(t.createdAt)}
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    t.formaPago === 'efectivo_local' ? 'bg-accent/20 text-accent' :
                    t.formaPago === 'efectivo_usd' ? 'bg-primary/20 text-primary' :
                    t.formaPago === 'mixto' ? 'bg-secondary/20 text-secondary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {getFormaPagoLabel(t.formaPago)}
                  </span>
                </div>
                <div className="font-bold text-primary">
                  ${Number(t.totalLocal).toLocaleString('es-CU')}
                </div>
                <div className="text-muted-foreground">
                  ${Number(t.totalUSD).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Historial;