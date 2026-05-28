import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Star } from 'lucide-react';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

const ReviewsManager = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { toast } = useToast();

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  useEffect(() => { fetchReviews(); }, []);

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Reseña eliminada 🗑️' });
    fetchReviews();
  };

  return (
    <div>
      <h2 className="text-3xl font-display text-gradient mb-6">Reseñas ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No hay reseñas</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-gradient-card border border-border rounded-2xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{r.customer_name}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-secondary fill-secondary' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString('es-CU')}</p>
              </div>
              <button onClick={() => deleteReview(r.id)} className="p-2 hover:bg-destructive/20 rounded-lg">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
