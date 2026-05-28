import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

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

const MenuManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', featured: false, available: true });
  const { toast } = useToast();

  const fetchData = async () => {
    const [catRes, itemRes] = await Promise.all([
      supabase.from('menu_categories').select('*').order('display_order'),
      supabase.from('menu_items').select('*'),
    ]);
    if (catRes.data) {
      setCategories(catRes.data);
      if (!activeCategory && catRes.data[0]) setActiveCategory(catRes.data[0].id);
    }
    if (itemRes.data) setItems(itemRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(i => i.category_id === activeCategory);

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem(false);
    setForm({ name: item.name, description: item.description || '', price: String(item.price), featured: item.featured, available: item.available });
  };

  const startNew = () => {
    setEditingItem(null);
    setNewItem(true);
    setForm({ name: '', description: '', price: '', featured: false, available: true });
  };

  const cancel = () => { setEditingItem(null); setNewItem(false); };

  const saveItem = async () => {
    if (!form.name || !form.price || !activeCategory) return;
    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      featured: form.featured,
      available: form.available,
      category_id: activeCategory,
    };

    if (editingItem) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', editingItem.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Producto actualizado ✅' });
    } else {
      const { error } = await supabase.from('menu_items').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Producto creado ✅' });
    }
    cancel();
    fetchData();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Producto eliminado 🗑️' });
    fetchData();
  };

  const toggleAvailable = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id);
    fetchData();
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display text-gradient">Gestión de Menú</h2>
        <button onClick={startNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); cancel(); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {(newItem || editingItem) && (
        <div className="bg-gradient-card border border-border rounded-2xl p-4 mb-6 space-y-3">
          <h3 className="font-display text-lg text-foreground">{editingItem ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre" className={inputClass} />
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className={inputClass} />
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Precio (CUP)" className={inputClass} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-secondary" /> Destacado
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="accent-accent" /> Disponible
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={saveItem} className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm"><Save className="w-4 h-4" /> Guardar</button>
            <button onClick={cancel} className="flex items-center gap-1 bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm"><X className="w-4 h-4" /> Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className={`flex items-center justify-between bg-gradient-card border border-border rounded-xl p-4 ${!item.available ? 'opacity-50' : ''}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{item.name}</span>
                {item.featured && <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">⭐ Destacado</span>}
                {!item.available && <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">No disponible</span>}
              </div>
              {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
              <p className="text-secondary font-display text-lg">${item.price.toFixed(2)} CUP</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleAvailable(item)} className="p-2 hover:bg-muted rounded-lg text-sm text-muted-foreground">
                {item.available ? '🟢' : '🔴'}
              </button>
              <button onClick={() => startEdit(item)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
              <button onClick={() => deleteItem(item.id)} className="p-2 hover:bg-destructive/20 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No hay productos en esta categoría</p>}
      </div>
    </div>
  );
};

export default MenuManager;
