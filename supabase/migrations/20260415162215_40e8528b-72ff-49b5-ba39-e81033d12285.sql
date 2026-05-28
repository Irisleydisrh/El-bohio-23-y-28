
-- Create menu_categories table
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu categories"
ON public.menu_categories FOR SELECT
USING (true);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
ON public.menu_items FOR SELECT
USING (true);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
  delivery_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view their orders by order_number"
ON public.orders FOR SELECT
USING (true);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view order items"
ON public.order_items FOR SELECT
USING (true);

-- Seed categories
INSERT INTO public.menu_categories (name, description, icon, display_order) VALUES
('Hamburguesas', 'Las mejores hamburguesas al carbón de La Habana', '🍔', 1),
('Sándwiches y Entrepanes', 'Entrepanes al carbón con lechón y más', '🥖', 2),
('Combos', 'Combos especiales para compartir', '🍱', 3),
('Bebidas y Extras', 'Refrescos, jugos y acompañamientos', '🥤', 4);

-- Seed menu items
INSERT INTO public.menu_items (category_id, name, description, price, available, featured) VALUES
((SELECT id FROM public.menu_categories WHERE name = 'Hamburguesas'), 'Hamburguesa Clásica', 'Pan artesanal, carne de res al carbón, lechuga, tomate, cebolla y salsa especial', 250.00, true, true),
((SELECT id FROM public.menu_categories WHERE name = 'Hamburguesas'), 'Hamburguesa Doble', 'Doble carne al carbón, queso fundido, bacon, lechuga y salsa BBQ', 350.00, true, false),
((SELECT id FROM public.menu_categories WHERE name = 'Hamburguesas'), 'Hamburguesa de Cerdo', 'Carne de cerdo ahumada al carbón con piña caramelizada y salsa criolla', 300.00, true, true),
((SELECT id FROM public.menu_categories WHERE name = 'Hamburguesas'), 'Hamburguesa El Bohío', 'La especialidad de la casa: triple carne, queso, huevo, bacon y todos los vegetales', 450.00, true, true),
((SELECT id FROM public.menu_categories WHERE name = 'Sándwiches y Entrepanes'), 'Entrepán de Lechón', 'Pan crujiente al carbón relleno de lechón asado, cebolla y mojo criollo', 200.00, true, true),
((SELECT id FROM public.menu_categories WHERE name = 'Sándwiches y Entrepanes'), 'Entrepán Mixto', 'Jamón, queso, lechón y encurtidos en pan al carbón', 280.00, true, false),
((SELECT id FROM public.menu_categories WHERE name = 'Sándwiches y Entrepanes'), 'Pan con Bistec', 'Bistec de res jugoso con cebolla caramelizada en pan artesanal', 300.00, true, false),
((SELECT id FROM public.menu_categories WHERE name = 'Sándwiches y Entrepanes'), 'Crea Tu Propio Pan', 'Elige tu pan, tu proteína y tus ingredientes favoritos', 350.00, true, true),
((SELECT id FROM public.menu_categories WHERE name = 'Combos'), 'Combo Individual', 'Hamburguesa clásica + papas fritas + refresco', 400.00, true, true),
((SELECT id FROM public.menu_categories WHERE name = 'Combos'), 'Combo Pareja', '2 hamburguesas + papas fritas grandes + 2 refrescos', 700.00, true, false),
((SELECT id FROM public.menu_categories WHERE name = 'Combos'), 'Combo Familiar', '4 hamburguesas + 2 papas fritas grandes + 4 refrescos', 1300.00, true, true),
((SELECT id FROM public.menu_categories WHERE name = 'Bebidas y Extras'), 'Refresco Natural', 'Jugo natural de frutas tropicales', 80.00, true, false),
((SELECT id FROM public.menu_categories WHERE name = 'Bebidas y Extras'), 'Cerveza', 'Cerveza fría nacional', 150.00, true, false),
((SELECT id FROM public.menu_categories WHERE name = 'Bebidas y Extras'), 'Papas Fritas', 'Papas fritas crujientes con sal', 120.00, true, false),
((SELECT id FROM public.menu_categories WHERE name = 'Bebidas y Extras'), 'Yuca Frita', 'Yuca frita dorada con mojo', 100.00, true, false);
