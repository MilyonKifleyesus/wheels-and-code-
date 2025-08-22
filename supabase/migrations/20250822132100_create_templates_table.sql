CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('page', 'section', 'block')),
    category TEXT NOT NULL,
    thumbnail TEXT,
    sections JSONB,
    metadata JSONB,
    user_id UUID DEFAULT auth.uid() REFERENCES public.users(id)
);

COMMENT ON TABLE public.templates IS 'Stores reusable page and section templates.';
COMMENT ON COLUMN public.templates.sections IS 'The structure of the template, composed of blocks.';
COMMENT ON COLUMN public.templates.metadata IS 'Additional metadata like description, tags, usage stats.';

-- RLS Policies for templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public templates are viewable by everyone."
ON public.templates
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own templates."
ON public.templates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates."
ON public.templates
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates."
ON public.templates
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access."
ON public.templates
FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
