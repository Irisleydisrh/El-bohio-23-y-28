import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardList, DollarSign, CalendarDays, Star } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, reservations: 0, reviews: 0 });

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const [ordersRes, reservationsRes, reviewsRes] = await Promise.all([
        supabase.from('orders').select('total, created_at'),
        supabase.from('reservations').select('id').eq('status', 'pending'),
        supabase.from('reviews').select('id'),
      ]);

      const todayOrders = (ordersRes.data || []).filter(o => o.created_at.startsWith(today));
      const revenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        orders: todayOrders.length,
        revenue,
        reservations: reservationsRes.data?.length || 0,
        reviews: reviewsRes.data?.length || 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: 'Pedidos hoy', value: stats.orders, icon: ClipboardList, color: 'text-primary' },
    { label: 'Ingresos hoy', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-secondary' },
    { label: 'Reservaciones pendientes', value: stats.reservations, icon: CalendarDays, color: 'text-accent' },
    { label: 'Total reseñas', value: stats.reviews, icon: Star, color: 'text-secondary' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-display text-gradient mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-gradient-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <c.icon className={`w-5 h-5 ${c.color}`} />
              <span className="text-sm text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-3xl font-display text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
