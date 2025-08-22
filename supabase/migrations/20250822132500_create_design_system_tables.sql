-- Themes table to manage different versions of design tokens
CREATE TABLE public.themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_staging BOOLEAN DEFAULT false,
    user_id UUID DEFAULT auth.uid() REFERENCES public.users(id)
);

COMMENT ON TABLE public.themes IS 'Manages different versions of design tokens as themes.';

-- Design tokens table
CREATE TABLE public.design_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    theme_id UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
    tokens JSONB NOT NULL,
    user_id UUID DEFAULT auth.uid() REFERENCES public.users(id)
);

COMMENT ON TABLE public.design_tokens IS 'Stores the actual design token data for a specific theme.';

-- RLS Policies
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for themes
CREATE POLICY "Allow all users to read themes" ON public.themes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin users to manage themes" ON public.themes FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Policies for design_tokens
CREATE POLICY "Allow all users to read design tokens" ON public.design_tokens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin users to manage design tokens" ON public.design_tokens FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Ensure only one theme is active at a time
CREATE UNIQUE INDEX single_active_theme_idx ON public.themes (is_active) WHERE is_active = true;
CREATE UNIQUE INDEX single_staging_theme_idx ON public.themes (is_staging) WHERE is_staging = true;

-- Seed a default theme
DO $$
DECLARE
  default_theme_id UUID;
  default_user_id UUID;
BEGIN
  -- Get the ID of the admin user created earlier
  SELECT id INTO default_user_id FROM auth.users WHERE email = 'mili.kifleyesus@gmail.com';

  -- Insert the default theme
  INSERT INTO public.themes (name, is_active, is_staging, user_id)
  VALUES ('Default Theme', true, false, default_user_id)
  RETURNING id INTO default_theme_id;

  -- Insert the default design tokens
  INSERT INTO public.design_tokens (theme_id, user_id, tokens)
  VALUES (
    default_theme_id,
    default_user_id,
    '{
      "colors": {
        "primary": "#D7FF00",
        "secondary": "#C8FF1A",
        "accent": "#39FF14",
        "background": "#0B0B0C",
        "surface": "#1A1B1E",
        "text": "#FFFFFF",
        "textSecondary": "#9CA3AF",
        "success": "#10B981",
        "warning": "#F59E0B",
        "error": "#EF4444"
      },
      "typography": {
        "fontFamily": "Inter, system-ui, sans-serif",
        "headingFont": "Inter, system-ui, sans-serif",
        "fontSize": { "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem", "xl": "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem" },
        "fontWeight": { "normal": "400", "medium": "500", "bold": "700", "black": "900" }
      },
      "spacing": { "xs": "0.25rem", "sm": "0.5rem", "md": "1rem", "lg": "1.5rem", "xl": "2rem", "2xl": "3rem", "3xl": "4rem", "4xl": "6rem" },
      "borderRadius": { "sm": "0.125rem", "md": "0.375rem", "lg": "0.5rem", "xl": "0.75rem" }
    }'::jsonb
  );
END $$;
