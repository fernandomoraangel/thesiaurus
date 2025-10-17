-- Migración para agregar campo de color a las relaciones
-- Ejecutar este script en Supabase SQL Editor

-- Agregar columna color con valor por defecto NULL (usará colores por defecto según tipo)
ALTER TABLE relationships
ADD COLUMN IF NOT EXISTS color TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN relationships.color IS 'Color personalizado de la relación en formato hex (#RRGGBB)';