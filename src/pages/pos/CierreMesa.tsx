import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { pedidoService, tasaService, transaccionService, Pedido, Mesa, ExchangeRate } from '@/services/posApi';
import { authService, AuthUser } from '@/services/posApi';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  CheckCircle,
  X,
  Banknote,
  Wallet,
  RefreshCw,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';

type FormaPago = 'efectivo_local' | 'efectivo_usd' | 'mixto' | 'tarjeta';

const CierreMesa = () => {
  const { mesaId } = useParams<{ mesaId: string }>();
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get('pedidoId');

  const { toast } = useToast();
  const user = authService.getUser() as AuthUser;

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [tasa, setTasa] = useState<ExchangeRate | null>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorPedido, setErrorPedido] = useState(false);

  const [formaPago, setFormaPago] = useState<FormaPago>('efectivo_local');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [montoUSD, setMontoUSD] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    const cargar = async () => {
      if (!mesaId) return;
      try {
        const [mesaData, tasaData] = await Promise.all([
          mesaService.getById(mesaId),
          tasaService.getActiva(),
        ]);
        setMesa(mesaData);
        setTasa(tasaData);

        const pedidoData = pedidoId
          ? await pedidoService.getById(pedidoId)
          : await pedidoService.getActivoByMesa(mesaId);

        if (pedidoData) {
          setPedido(pedidoData);
        } else {
          setErrorPedido(true);
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setErrorPedido(true);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [mesaId, pedidoId]);

  const totalCUP = Number(pedido?.total || 0);
  const totalFinalUSD = tasa ? totalCUP / Number(tasa.tasa) : 0;

  const montoRecibidoNum = Number(montoRecibido) || 0;
  const montoUSDNum = Number(montoUSD) || 0;
  const cambio = formaPago === 'efectivo_local' ? montoRecibidoNum - totalCUP : 0;

  const procesarCierre = async () => {
    if (!mesa || !pedido || !user) return;
    setProcesando(true);
    try {
      const result = await transaccionService.cerrarMesa({
        mesaId: mesa.id,
        pedidoId: pedido.id,
        cajeraId: user.id,
        cajeraNombre: user.firstName || user.email,
        descuento: 0,
        formaPago,
        montoRecibidoLocal: formaPago !== 'efectivo_usd' ? montoRecibidoNum : undefined,
        montoRecibidoUSD: formaPago === 'efectivo_usd' ? montoUSDNum : undefined,
        notas: notas || undefined,
      });
      setTicket(result.ticket);
      toast({ title: 'Cobro realizado', description: `Transacción ${result.transaccion.numeroTransaccion}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcesando(false);
    }
  };

  if (ticket) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold">¡Cobro Exitoso!</h1>
            <p className="text-accent-foreground/80">Mesa {mesa?.numero}</p>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="bg-card-dark p-4 text-center">
              <h2 className="font-bold text-lg text-foreground">EL BOHÍO 23 Y 28</h2>
              <p className="text-muted-foreground text-sm">La Habana, Cuba</p>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Ticket:</span><span className="font-mono">{ticket.numeroTransaccion}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mesa:</span><span>{ticket.mesaNumero}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cajero:</span><span>{ticket.cajeraNombre}</span></div>
            </div>
            {ticket.items && ticket.items.length > 0 && (
              <div className="border-t border-b border-border p-4">
                {ticket.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>{item.cantidad}x {item.nombre}</span>
                    <span>${item.subtotal.toLocaleString('es-CU')}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>Subtotal</span><span>${ticket.subtotal?.toLocaleString('es-CU')}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total:</span><span className="text-primary">${ticket.totalLocal?.toLocaleString('es-CU')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-card border-t space-y-3">
          <Link to="/pos/cobros" className="block w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors text-center">
            Volver a Cobros
          </Link>
        </div>
      </div>
    );
  }

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

  if (errorPedido || !pedido) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-4">
          <div className="flex items-center gap-3">
            <Link to="/pos/cobros" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Cobrar Mesa</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Sin pedido activo</h2>
            <p className="text-muted-foreground mb-4">No hay pedido para cobrar en esta mesa</p>
            <Link to="/pos/cobros" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors inline-block">
              Volver a Cobros
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/pos/cobros" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Cobrar Mesa</h1>
              <p className="text-white/80 text-sm">Mesa {mesa?.numero}</p>
            </div>
          </div>
          <Link to="/pos/cobros" className="text-white/80 hover:text-white"><X className="w-6 h-6" /></Link>
        </div>
      </div>

      <div className="bg-card border-b p-4">
        <div className="flex justify-between items-center">
          <div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold text-primary">${totalCUP.toLocaleString('es-CU')} CUP</p></div>
          <div className="text-right"><p className="text-sm text-muted-foreground">USD</p><p className="text-xl font-semibold text-foreground">${totalFinalUSD.toFixed(2)}</p></div>
        </div>
      </div>

      <div className="p-4 bg-card border-b">
        <p className="text-sm font-medium text-foreground mb-3">Forma de Pago</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormaPago('efectivo_local')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
              formaPago === 'efectivo_local' ? 'border-accent bg-accent/10' : 'border-border hover:border-primary/50'
            }`}
          >
            <Banknote className="w-6 h-6 text-accent" />
            <span className="text-sm font-medium">Efectivo (CUP)</span>
          </button>
          <button
            onClick={() => setFormaPago('efectivo_usd')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
              formaPago === 'efectivo_usd' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
          >
            <Wallet className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Efectivo (USD)</span>
          </button>
        </div>
      </div>

      {formaPago === 'efectivo_local' && (
        <div className="p-4 bg-card border-b">
          <p className="text-sm font-medium text-foreground mb-3">Monto Recibido (CUP)</p>
          <input
            type="number"
            value={montoRecibido}
            onChange={(e) => setMontoRecibido(e.target.value)}
            placeholder="0"
            className="w-full p-4 text-2xl font-bold bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {montoRecibidoNum > 0 && (
            <p className="mt-2 text-right text-muted-foreground">
              Cambio: <span className="text-accent font-medium">${cambio.toLocaleString('es-CU')} CUP</span>
            </p>
          )}
        </div>
      )}

      {formaPago === 'efectivo_usd' && (
        <div className="p-4 bg-card border-b">
          <p className="text-sm font-medium text-foreground mb-3">Monto Recibido (USD)</p>
          <input
            type="number"
            value={montoUSD}
            onChange={(e) => setMontoUSD(e.target.value)}
            placeholder="0"
            className="w-full p-4 text-2xl font-bold bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      <div className="p-4 bg-card border-t">
        <button
          onClick={procesarCierre}
          disabled={procesando || totalCUP <= 0}
          className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-lg rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {procesando ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Cobrar ${totalCUP.toLocaleString('es-CU')} CUP
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CierreMesa;