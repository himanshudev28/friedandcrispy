
-- Create menu table
CREATE TABLE public.menu (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu is publicly readable" ON public.menu FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on menu" ON public.menu FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on menu" ON public.menu FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes on menu" ON public.menu FOR DELETE USING (true);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  items JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales are publicly readable" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on sales" ON public.sales FOR INSERT WITH CHECK (true);

-- Storage bucket for menu images
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true);

CREATE POLICY "Menu images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');
CREATE POLICY "Anyone can upload menu images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-images');
CREATE POLICY "Anyone can update menu images" ON storage.objects FOR UPDATE USING (bucket_id = 'menu-images');
CREATE POLICY "Anyone can delete menu images" ON storage.objects FOR DELETE USING (bucket_id = 'menu-images');
