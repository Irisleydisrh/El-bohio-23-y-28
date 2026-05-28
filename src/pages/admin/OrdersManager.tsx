import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  delivery_address: string | null;
  status: string;
  total: number;
  created_at: string;
}

const statuses = ['pending', 'preparing', 'ready', 'delivered'];
const statusLabels: Record<string, string> = {
  pending: '⏳ Pendiente',
  preparing: '🔥 Preparando',
  ready: '✅ Listo',
  delivered: '🚀 Entregado',
};

const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: `Estado actualizado: ${statusLabels[status]}` });
    fetchOrders();
  };

  return (
    <div>
      <h2 className="text-3xl font-display text-gradient mb-6">Pedidos</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No hay pedidos aún</p>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-gradient-card border border-border rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <span className="font-display text-lg text-foreground">#{order.order_number}</span>
                  <span className="ml-3 text-sm text-muted-foreground">{order.customer_name} • {order.customer_phone}</span>
                </div>
                <span className="text-secondary font-display text-lg">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <span className="capitalize">{order.order_type}</span>
                {order.delivery_address && <span>• {order.delivery_address}</span>}
                <span>• {new Date(order.created_at).toLocaleString('es-CU')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(order.id, s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      order.status === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
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

export default OrdersManager;
