import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  pending: '⏳ Pendiente',
  confirmed: '✅ Confirmada',
  cancelled: '❌ Cancelada',
};

const ReservationsManager = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { toast } = useToast();

  const fetch = async () => {
    const { data } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
    if (data) setReservations(data);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: `Reservación ${statusLabels[status]}` });
    fetch();
  };

  return (
    <div>
      <h2 className="text-3xl font-display text-gradient mb-6">Reservaciones</h2>
      {reservations.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No hay reservaciones</p>
      ) : (
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r.id} className="bg-gradient-card border border-border rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <span className="font-display text-lg text-foreground">{r.customer_name}</span>
                  <span className="ml-3 text-sm text-muted-foreground">{r.customer_phone}</span>
                </div>
                <span className="text-sm text-muted-foreground">{r.guests} personas</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                📅 {r.reservation_date} • 🕐 {r.reservation_time}
              </p>
              <div className="flex flex-wrap gap-2">
                {(['pending', 'confirmed', 'cancelled'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(r.id, s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      r.status === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsManager;
