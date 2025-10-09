-- ===================================
-- SISTEMA DE VISTAS ANALÍTICAS
-- ===================================
-- Crea la tabla para almacenar vistas analíticas personalizadas y predefinidas
-- que permiten filtrar y analizar el tesauro desde diferentes perspectivas.

-- Tabla principal de vistas analíticas
CREATE TABLE IF NOT EXISTS public.analytical_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thesaurus_id uuid NOT NULL REFERENCES public.thesauruses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  -- Configuración de filtros en formato JSON
  -- Ejemplo: {"categories": ["cat-id-1", "cat-id-2"], "temporal_range": [1990, 2020], "min_connections": 3}
  filters jsonb DEFAULT '{}'::jsonb,
  color text DEFAULT '#2c5282',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analytical_views_user_thesaurus_name_key UNIQUE (user_id, thesaurus_id, name)
);

-- Tabla para guardar qué vistas están activas para cada usuario/tesauro
CREATE TABLE IF NOT EXISTS public.active_analytical_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thesaurus_id uuid NOT NULL REFERENCES public.thesauruses(id) ON DELETE CASCADE,
  view_id uuid NOT NULL REFERENCES public.analytical_views(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT active_analytical_views_unique UNIQUE (user_id, thesaurus_id, view_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_analytical_views_user_thesaurus 
  ON public.analytical_views(user_id, thesaurus_id);

CREATE INDEX IF NOT EXISTS idx_analytical_views_is_default 
  ON public.analytical_views(is_default);

CREATE INDEX IF NOT EXISTS idx_active_analytical_views_user_thesaurus 
  ON public.active_analytical_views(user_id, thesaurus_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_analytical_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_analytical_views_updated_at ON public.analytical_views;
CREATE TRIGGER trigger_update_analytical_views_updated_at
  BEFORE UPDATE ON public.analytical_views
  FOR EACH ROW
  EXECUTE FUNCTION update_analytical_views_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.analytical_views IS 'Vistas analíticas personalizadas y predefinidas para filtrar el tesauro';
COMMENT ON COLUMN public.analytical_views.filters IS 'Configuración JSON con criterios de filtrado (categorías, fechas, relaciones, etc.)';
COMMENT ON COLUMN public.analytical_views.is_default IS 'Indica si es una vista predefinida del sistema';
COMMENT ON COLUMN public.analytical_views.color IS 'Color asociado a la vista para identificación visual';

COMMENT ON TABLE public.active_analytical_views IS 'Registro de qué vistas están activas para cada usuario/tesauro';

-- Otorgar permisos para acceso vía API
GRANT ALL ON public.analytical_views TO authenticated;
GRANT ALL ON public.active_analytical_views TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.analytical_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_analytical_views ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Users can view their own analytical views" ON public.analytical_views;
DROP POLICY IF EXISTS "Users can create their own analytical views" ON public.analytical_views;
DROP POLICY IF EXISTS "Users can update their own analytical views" ON public.analytical_views;
DROP POLICY IF EXISTS "Users can delete their own analytical views" ON public.analytical_views;
DROP POLICY IF EXISTS "Users can view their own active views" ON public.active_analytical_views;
DROP POLICY IF EXISTS "Users can create their own active views" ON public.active_analytical_views;
DROP POLICY IF EXISTS "Users can delete their own active views" ON public.active_analytical_views;

-- Políticas de seguridad para analytical_views
CREATE POLICY "Users can view their own analytical views"
  ON public.analytical_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytical views"
  ON public.analytical_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytical views"
  ON public.analytical_views FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytical views"
  ON public.analytical_views FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false);

-- Políticas de seguridad para active_analytical_views
CREATE POLICY "Users can view their own active views"
  ON public.active_analytical_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own active views"
  ON public.active_analytical_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own active views"
  ON public.active_analytical_views FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
