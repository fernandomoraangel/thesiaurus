-- Migración para agregar campos de forma y tamaño a los nodos
-- Ejecutar este script en Supabase SQL Editor

-- Agregar columna shape (forma) con valor por defecto 'circle'
ALTER TABLE concepts
ADD COLUMN IF NOT EXISTS shape TEXT DEFAULT 'circle';

-- Agregar columna size (tamaño) con valor por defecto 0.5
ALTER TABLE concepts
ADD COLUMN IF NOT EXISTS size REAL DEFAULT 0.5;

-- Actualizar nodos existentes que puedan tener valores NULL
UPDATE concepts
SET shape = 'circle'
WHERE shape IS NULL;

UPDATE concepts
SET size = 0.5
WHERE size IS NULL;

-- Comentarios para documentación
COMMENT ON COLUMN concepts.shape IS 'Forma del nodo: circle, square, triangle, diamond, star';
COMMENT ON COLUMN concepts.size IS 'Tamaño del nodo (0.0 a 1.0)';
