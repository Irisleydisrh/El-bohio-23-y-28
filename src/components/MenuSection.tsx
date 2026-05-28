import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  display_order: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  available: boolean;
  featured: boolean;
}

const MenuSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMenu() {
      const [catRes, itemRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('display_order'),
        supabase.from('menu_items').select('*').eq('available', true),
      ]);
      if (catRes.data) {
        setCategories(catRes.data);
        setActiveCategory(catRes.data[0]?.id || null);
      }
      if (itemRes.data) setItems(itemRes.data);
      setLoading(false);
    }
    fetchMenu();

    // Realtime subscription for live updates from admin
    const channel = supabase
      .channel('menu-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        fetchMenu();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_categories' }, () => {
        fetchMenu();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredItems = items.filter((i) => i.category_id === activeCategory);

  const handleAdd = (item: MenuItem) => {
    addItem({ id: item.id, name: item.name, price: item.price });
    toast({
      title: '¡Agregado! 🍔',
      description: `${item.name} se añadió al pedido`,
    });
  };

  if (loading) {
    return (
      <section id="menu" className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse text-2xl text-muted-foreground">Cargando menú...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 px-4 bg-gradient-warm">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-display text-gradient">Nuestro Menú</h2>
          <p className="text-muted-foreground mt-2">Elige, personaliza y disfruta 🔥</p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-3 rounded-full font-medium text-sm transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground glow-primary scale-105'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gradient-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:glow-primary"
              >
                {/* Placeholder image area */}
                <div className="h-44 bg-muted/50 flex items-center justify-center text-6xl relative overflow-hidden">
                  <span className="group-hover:scale-110 transition-transform duration-500">🍔</span>
                  {item.featured && (
                    <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" /> Destacado
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-display text-secondary">
                      ${item.price.toFixed(2)}
                      <span className="text-sm text-muted-foreground ml-1">CUP</span>
                    </span>
                    <button
                      onClick={() => handleAdd(item)}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Agregar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MenuSection;
