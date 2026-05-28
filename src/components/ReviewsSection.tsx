import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`transition-transform ${interactive ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hover || rating)
                ? 'fill-secondary text-secondary'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, index }: { review: Review; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-secondary/30 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-foreground">{review.customer_name}</h4>
      <StarRating rating={review.rating} />
    </div>
    {review.comment && (
      <p className="text-muted-foreground text-sm leading-relaxed">"{review.comment}"</p>
    )}
    <p className="text-xs text-muted-foreground/50 mt-3">
      {new Date(review.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>
  </motion.div>
);

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setReviews(data);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast({ title: 'Completa todos los campos', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        customer_name: name.trim(),
        rating,
        comment: comment.trim(),
      });
      if (error) throw error;
      toast({ title: '¡Gracias por tu reseña! ⭐' });
      setName('');
      setRating(5);
      setComment('');
      fetchReviews();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast({ title: 'Error al enviar', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <section id="resenas" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-gradient mb-3">
            Lo que dicen nuestros clientes
          </h2>
          <div className="flex items-center justify-center gap-2 text-secondary">
            <Star className="w-6 h-6 fill-secondary" />
            <span className="text-2xl font-bold">{avgRating}</span>
            <span className="text-muted-foreground text-sm">({reviews.length} reseñas)</span>
          </div>
        </motion.div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {reviews.map((r, i) => (
            <ReviewCard key={r.id} review={r} index={i} />
          ))}
        </div>

        {/* Submit form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8"
        >
          <h3 className="font-display text-2xl text-gradient mb-6 text-center">Deja tu opinión</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Puntuación:</span>
              <StarRating rating={rating} onRate={setRating} interactive />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia..."
              rows={3}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
