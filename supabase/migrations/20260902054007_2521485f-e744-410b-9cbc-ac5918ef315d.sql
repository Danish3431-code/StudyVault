CREATE TABLE public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  material_id uuid references public.materials(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

CREATE INDEX notifications_user_created_idx ON public.notifications(user_id, created_at DESC);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.notify_public_material()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_name text;
BEGIN
  IF NEW.visibility <> 'public' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.visibility = 'public' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(full_name, ''), username, 'Someone') INTO actor_name
  FROM public.profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, actor_id, material_id, title, body)
  SELECT p.id, NEW.user_id, NEW.id,
         COALESCE(actor_name, 'Someone') || ' shared new material',
         NEW.title
  FROM public.profiles p
  WHERE p.id <> NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_material_public_insert
AFTER INSERT ON public.materials
FOR EACH ROW EXECUTE FUNCTION public.notify_public_material();

CREATE TRIGGER on_material_public_update
AFTER UPDATE OF visibility ON public.materials
FOR EACH ROW EXECUTE FUNCTION public.notify_public_material();

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;