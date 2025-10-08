-- Migración para añadir campos de posición fija a la tabla concepts
-- Ejecutar en Supabase SQL Editor

-- Añadir columnas para posición fija de nodos en el grafo
ALTER TABLE public.concepts 
ADD COLUMN fixed_x numeric,
ADD COLUMN fixed_y numeric;

-- Comentarios para documentar los campos
COMMENT ON COLUMN public.concepts.fixed_x IS 'Posición X fija del nodo en el grafo (null = posición libre)';
COMMENT ON COLUMN public.concepts.fixed_y IS 'Posición Y fija del nodo en el grafo (null = posición libre)';

-- Los valores por defecto son NULL, lo que significa que los nodos son libres por defecto
