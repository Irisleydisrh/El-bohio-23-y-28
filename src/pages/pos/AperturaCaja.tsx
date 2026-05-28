import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cajaService, Caja } from '@/services/posApi';
import { authService, AuthUser } from '@/services/posApi';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  Lock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Banknote,
  Wallet
} from 'lucide-react';

const AperturaCaja = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getUser() as AuthUser;

  const [caja, setCaja] = useState<Caja | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [aperturaLocal, setAperturaLocal] = useState('');
  const [aperturaUSD, setAperturaUSD] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const estado = await cajaService.getEstado();
        setCaja(estado);
        setCargando(false);
      } catch (error: any) {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const abrirCaja = async () => {
    setGuardando(true);
    try {
      const nueva = await cajaService.abrir({
        cajeroId: user.id,
        cajeroNombre: user.firstName || user.email,
        aperturaLocal: Number(aperturaLocal) || 0,
        aperturaUSD: Number(aperturaUSD) || 0,
      });
      setCaja(nueva);
      toast({ title: 'Caja abierta', description: `Apertura: ${Number(aperturaLocal).toLocaleString('es-CU')} CUP` });
      navigate('/pos/cobros');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setGuardando(false);
    }
  };

  const cerrarCaja = async () => {
    if (!confirm('¿Cerrar la caja? No se podrán procesar cobros hasta abrir de nuevo.')) return;
    setGuardando(true);
    try {
      await cajaService.cerrar({ observaciones });
      toast({ title: 'Caja cerrada' });
      authService.logout();
      navigate('/pos/login');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Verificando caja...</p>
        </div>
      </div>
    );
  }

  const cajaAbierta = caja?.estado === 'abierta';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Caja</h1>
        <p className="text-muted-foreground">Gestión de caja</p>
      </div>

      {cajaAbierta ? (
        <>
          {/* Caja abierta */}
          <div className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8" />
              <div>
                <p className="text-accent-foreground/80 text-sm">Estado</p>
                <p className="text-xl font-bold">Caja Abierta</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-accent-foreground/80 text-sm">Apertura CUP</p>
                <p className="text-lg font-bold">${Number(caja?.aperturaLocal).toLocaleString('es-CU')}</p>
              </div>
              <div>
                <p className="text-accent-foreground/80 text-sm">Apertura USD</p>
                <p className="text-lg font-bold">${Number(caja?.aperturaUSD).toLocaleString('es-CU')}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <p className="text-sm text-muted-foreground mb-4">Ventas del día (se calculan al cerrar)</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Ventas CUP</p>
                <p className="text-xl font-bold text-primary">${Number(caja?.totalVentasLocal).toLocaleString('es-CU')}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Ventas USD</p>
                <p className="text-xl font-bold text-primary">${Number(caja?.totalVentasUSD).toLocaleString('es-CU')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Observaciones de cierre</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas sobre el cierre de caja..."
                rows={3}
                className="w-full p-4 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <button
              onClick={cerrarCaja}
              disabled={guardando}
              className="w-full py-4 bg-destructive/10 text-destructive font-bold text-lg rounded-xl hover:bg-destructive/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {guardando ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Cerrar Caja
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Caja cerrada — abrirla */}
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-8 h-8" />
              <div>
                <p className="text-xl font-bold">Caja Cerrada</p>
                <p className="text-sm text-muted-foreground">Debes abrir la caja antes de cobrar</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Monto de Apertura</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ingresa el efectivo que hay en caja al iniciar. No es obligatorio.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Banknote className="w-4 h-4 inline mr-1" />
                  Efectivo en CUP
                </label>
                <input
                  type="number"
                  value={aperturaLocal}
                  onChange={(e) => setAperturaLocal(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 text-2xl font-bold bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Wallet className="w-4 h-4 inline mr-1" />
                  Efectivo en USD
                </label>
                <input
                  type="number"
                  value={aperturaUSD}
                  onChange={(e) => setAperturaUSD(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 text-2xl font-bold bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={abrirCaja}
                disabled={guardando}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-lg rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {guardando ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    Abrir Caja
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AperturaCaja;