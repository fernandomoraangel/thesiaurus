-- Migración para añadir detalles a la tabla de Tesauros

-- 1. Renombrar la columna 'name' a 'title' para mayor claridad
ALTER TABLE public.thesauruses
RENAME COLUMN name TO title;

-- 2. Añadir las nuevas columnas para almacenar la información detallada del tesauro
ALTER TABLE public.thesauruses
ADD COLUMN uri TEXT,
ADD COLUMN author TEXT,
ADD COLUMN version TEXT,
ADD COLUMN published_at TIMESTAMPTZ, 
ADD COLUMN language TEXT,
ADD COLUMN license TEXT;

-- 3. Comentarios sobre las nuevas columnas para documentación
COMMENT ON COLUMN public.thesauruses.title IS 'Nombre oficial y completo del tesauro.';
COMMENT ON COLUMN public.thesauruses.uri IS 'Identificador persistente, como un URI (Uniform Resource Identifier).';
COMMENT ON COLUMN public.thesauruses.author IS 'Organización o individuos responsables de su creación y mantenimiento.';
COMMENT ON COLUMN public.thesauruses.version IS 'Indicación de la versión actual del tesauro.';
COMMENT ON COLUMN public.thesauruses.published_at IS 'Fecha de publicación o última modificación de la versión.';
COMMENT ON COLUMN public.thesauruses.language IS 'Idiomas cubiertos por el tesauro.';
COMMENT ON COLUMN public.thesauruses.license IS 'Información sobre la licencia que rige su utilización (ej. Creative Commons).';
