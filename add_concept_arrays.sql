-- Script para agregar campos de arrays a la tabla concepts
-- Ejecutar en Supabase SQL Editor

-- Agregar campo citations (array de texto para almacenar citas)
ALTER TABLE public.concepts 
ADD COLUMN IF NOT EXISTS citations text[] DEFAULT '{}';

-- Agregar campo works (array de texto para almacenar obras relacionadas)
ALTER TABLE public.concepts 
ADD COLUMN IF NOT EXISTS works text[] DEFAULT '{}';

-- Agregar campo media (array de texto para almacenar URLs o referencias de medios)
ALTER TABLE public.concepts 
ADD COLUMN IF NOT EXISTS media text[] DEFAULT '{}';

-- Verificar que los campos se agregaron correctamente
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'concepts' 
-- AND column_name IN ('citations', 'works', 'media');
