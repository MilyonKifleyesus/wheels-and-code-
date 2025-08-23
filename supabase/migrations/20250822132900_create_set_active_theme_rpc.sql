CREATE OR REPLACE FUNCTION public.set_active_theme(theme_id_to_set UUID)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure the user is an admin
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can set the active theme.';
  END IF;

  -- First, deactivate all themes
  UPDATE public.themes
  SET is_active = false
  WHERE is_active = true;

  -- Then, activate the selected theme
  UPDATE public.themes
  SET is_active = true
  WHERE id = theme_id_to_set;
END;
$$
LANGUAGE plpgsql;
