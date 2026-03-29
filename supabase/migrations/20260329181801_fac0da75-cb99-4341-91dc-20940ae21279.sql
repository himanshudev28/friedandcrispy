
ALTER TABLE public.orders ADD COLUMN order_id text UNIQUE;

CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  new_id text;
BEGIN
  new_id := 'ORD-' || LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0');
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_id = new_id) LOOP
    new_id := 'ORD-' || LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0');
  END LOOP;
  NEW.order_id := new_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_id
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_id();
