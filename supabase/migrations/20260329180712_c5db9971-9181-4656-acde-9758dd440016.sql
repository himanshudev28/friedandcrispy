
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT 'true'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public updates on settings" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Allow public inserts on settings" ON public.settings FOR INSERT WITH CHECK (true);

INSERT INTO public.settings (key, value) VALUES ('ratings_enabled', 'true'::jsonb);

ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
