
-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

-- Public insert
CREATE POLICY "Anyone can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (true);

-- Validation trigger for rating 1-5
CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_rating_trigger
BEFORE INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.validate_review_rating();

-- Seed reviews
INSERT INTO public.reviews (customer_name, rating, comment) VALUES
  ('María González', 5, '¡Los mejores entrepanes de La Habana! El pan con lechón es increíble. Siempre vuelvo.'),
  ('Carlos Rodríguez', 4, 'Muy buena comida y rápido servicio. El combo familiar es perfecto para compartir.'),
  ('Ana López', 5, 'Abierto 24 horas es genial. Las hamburguesas son enormes y deliciosas. 100% recomendado.'),
  ('Pedro Martínez', 5, 'El delivery llegó súper rápido y todo caliente. La calidad es siempre la misma. ¡Excelente!');
