-- 1. Crear el tipo ENUM para las relaciones
CREATE TYPE public.tipo_relacion AS ENUM (
    'TG', -- Término Genérico (Broader Term)
    'TE', -- Término Específico (Narrower Term)
    'TR', -- Término Relacionado (Related Term)
    'UF'  -- Usado por (Non-preferred term)
);

-- 2. Crear la tabla de Términos
CREATE TABLE public.terminos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_preferente TEXT NOT NULL UNIQUE,
    nota_alcance TEXT,
    creado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.terminos IS 'Almacena los términos preferentes del tesauro.';

-- 3. Crear la tabla de Sinónimos (Términos no preferentes)
CREATE TABLE public.sinonimos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_sinonimo TEXT NOT NULL,
    id_termino_preferente UUID REFERENCES public.terminos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.sinonimos IS 'Almacena los términos no preferentes y su relación con el término preferente.';

-- 4. Crear la tabla de Relaciones
CREATE TABLE public.relaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_termino_origen UUID REFERENCES public.terminos(id) ON DELETE CASCADE NOT NULL,
    tipo_relacion public.tipo_relacion NOT NULL,
    id_termino_destino UUID REFERENCES public.terminos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(id_termino_origen, tipo_relacion, id_termino_destino) -- Evitar relaciones duplicadas
);
COMMENT ON TABLE public.relaciones IS 'Define las relaciones jerárquicas y asociativas entre términos.';

-- 5. Habilitar Row Level Security (RLS) para las tablas
ALTER TABLE public.terminos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sinonimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relaciones ENABLE ROW LEVEL SECURITY;

-- 6. Crear Políticas de Seguridad (Policies)

-- Política para terminos: Permitir lectura a todos, y CRUD solo al creador.
CREATE POLICY "Allow public read access on terminos" ON public.terminos FOR SELECT USING (true);
CREATE POLICY "Allow individual insert access on terminos" ON public.terminos FOR INSERT WITH CHECK (auth.uid() = creado_por);
CREATE POLICY "Allow individual update access on terminos" ON public.terminos FOR UPDATE USING (auth.uid() = creado_por);
CREATE POLICY "Allow individual delete access on terminos" ON public.terminos FOR DELETE USING (auth.uid() = creado_por);

-- Política para sinonimos: Permitir lectura a todos, y escritura a usuarios autenticados.
-- La escritura se valida a través del término preferente al que se asocia.
CREATE POLICY "Allow public read access on sinonimos" ON public.sinonimos FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert access on sinonimos" ON public.sinonimos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update access on sinonimos" ON public.sinonimos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete access on sinonimos" ON public.sinonimos FOR DELETE TO authenticated USING (true);

-- Política para relaciones: Permitir lectura a todos, y escritura a usuarios autenticados.
CREATE POLICY "Allow public read access on relaciones" ON public.relaciones FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert access on relaciones" ON public.relaciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update access on relaciones" ON public.relaciones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete access on relaciones" ON public.relaciones FOR DELETE TO authenticated USING (true);
