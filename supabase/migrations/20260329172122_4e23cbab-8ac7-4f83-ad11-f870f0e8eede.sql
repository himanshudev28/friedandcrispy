CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb NOT NULL,
  total numeric NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text DEFAULT '',
  order_type text NOT NULL DEFAULT 'Delivery',
  payment_method text NOT NULL DEFAULT 'Cash',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders are publicly readable" ON public.orders FOR SELECT TO public USING (true);
CREATE POLICY "Allow public inserts on orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public updates on orders" ON public.orders FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public deletes on orders" ON public.orders FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;