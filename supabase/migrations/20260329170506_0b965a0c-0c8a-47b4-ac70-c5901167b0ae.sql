
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Allow all inserts on categories" ON public.categories FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all updates on categories" ON public.categories FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all deletes on categories" ON public.categories FOR DELETE TO public USING (true);

-- Seed with existing categories from menu items
INSERT INTO public.categories (name)
SELECT DISTINCT category FROM public.menu
ON CONFLICT (name) DO NOTHING;
