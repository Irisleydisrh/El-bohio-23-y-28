import { useState, useEffect } from 'react';
import { tasaService, ExchangeRate } from '@/services/posApi';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  DollarSign, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Edit2
} from 'lucide-react';

const Configuracion = () => {
  const { toast } = useToast();

  const [tasaActiva, setTasaActiva] = useState<ExchangeRate | null>(null);
  const [historialTasas, setHistorialTasas] = useState<ExchangeRate[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [tasaEditada, setTasaEditada] = useState('');

  const cargarTasas = async () => {
    try {
      const [activa, todas] = await Promise.all([
        tasaService.getActiva().catch(() => null),
        tasaService.getAll(),
      ]);
      setTasaActiva(activa);
      setHistorialTasas(todas);
      if (activa) {
        setTasaEditada(String(activa.tasa));
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTasas();
  }, []);

  // Guardar edición de tasa activa
  const guardarTasaEditada = async () => {
    const tasaNum = Number(tasaEditada);
    if (!tasaNum || tasaNum <= 0) {
      toast({ title: 'Error', description: 'La tasa debe ser mayor a 0', variant: 'destructive' });
      return;
    }

    setGuardando(true);
    try {
      const tasa = await tasaService.update(tasaActiva!.id, { tasa: tasaNum });
      setTasaActiva(tasa);
      setEditando(false);
      toast({ title: 'Tasa actualizada', description: `1 USD = ${tasaNum.toLocaleString()} CUP` });
      cargarTasas();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setGuardando(false);
    }
  };

  // Crear nueva tasa (para historial)
  const crearNuevaTasa = async () => {
    const tasaNum = Number(tasaEditada);
    if (!tasaNum || tasaNum <= 0) {
      toast({ title: 'Error', description: 'La tasa debe ser mayor a 0', variant: 'destructive' });
      return;
    }

    setGuardando(true);
    try {
      const tasa = await tasaService.create({ tasa: tasaNum });
      setTasaActiva(tasa);
      setEditando(false);
      toast({ title: 'Tasa actualizada', description: `1 USD = ${tasaNum.toLocaleString()} CUP` });
      cargarTasas();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setGuardando(false);
    }
  };

  const formatoFecha = (fecha: string) => new Date(fecha).toLocaleString('es-CU', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground"> Configuración</h1>
        <p className="text-muted-foreground">Administra el sistema POS</p>
      </div>

      {/* Tasa activa - EDITABLE */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-primary-foreground mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/80 text-sm">Tasa de Cambio Actual</p>
            
            {/* Campo editable */}
            {editando ? (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center bg-white/20 rounded-xl px-4 py-2">
                  <span className="text-2xl font-bold">1 USD = </span>
                  <input
                    type="number"
                    value={tasaEditada}
                    onChange={(e) => setTasaEditada(e.target.value)}
                    className="w-32 bg-transparent text-4xl font-bold text-white placeholder:text-white/50 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-2xl font-bold">CUP</span>
                </div>
                <button
                  onClick={guardarTasaEditada}
                  disabled={guardando}
                  className="p-3 bg-white/20 rounded-xl hover:bg-white/30 disabled:opacity-50"
                >
                  {guardando ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => { setEditando(false); setTasaEditada(String(tasaActiva?.tasa || '')); }}
                  className="p-3 bg-white/20 rounded-xl hover:bg-white/30"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <p className="text-4xl font-bold">
                  {tasaActiva ? `1 USD = ${Number(tasaActiva.tasa).toLocaleString('es-CU')} CUP` : 'No configurada'}
                </p>
                <button
                  onClick={() => setEditando(true)}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
        {tasaActiva && !editando && (
          <p className="text-primary-foreground/80 text-sm">Actualizada: {formatoFecha(tasaActiva.updatedAt)}</p>
        )}
      </div>

      {/* Nueva tasa (alternativa) */}
      <div className="bg-card rounded-2xl p-6 border border-border mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Crear Nueva Tasa</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Si prefieres crear una nueva tasa en lugar de editar la actual, puedes hacerlo aquí. Esto mantendrá un historial de tasas anteriores.
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            value={tasaEditada}
            onChange={(e) => setTasaEditada(e.target.value)}
            placeholder="Nueva tasa (ej: 3900)"
            className="flex-1 p-4 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={crearNuevaTasa}
            disabled={guardando || !tasaEditada}
            className="px-6 py-4 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {guardando ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Nueva Tasa
          </button>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-card rounded-2xl border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Historial de Tasas</h2>
        </div>
        <div className="divide-y divide-border">
          {historialTasas.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No hay tasas registradas</p>
            </div>
          ) : (
            historialTasas.map((tasa) => (
              <div key={tasa.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">1 USD = {Number(tasa.tasa).toLocaleString('es-CU')} CUP</p>
                    {tasa.activa ? (
                      <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Activa
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">Inactiva</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{formatoFecha(tasa.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-card rounded-2xl p-6 border border-border">
        <h2 className="text-lg font-bold text-foreground mb-4">Información del Sistema</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Versión</span><span className="font-medium">1.0.0</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Base de datos</span><span className="font-medium">PostgreSQL</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Mesas</span><span className="font-medium">10</span></div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;