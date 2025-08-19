-- 1. Crear la tabla de Términos (nodos del grafo)
CREATE TABLE public.terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    scope_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.terms IS 'Almacena los términos del tesauro, que actúan como nodos en el grafo.';

-- 2. Crear la tabla de Relaciones (aristas del grafo)
CREATE TABLE public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE NOT NULL,
    target_term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE NOT NULL,
    relationship_type TEXT NOT NULL, -- Ej: 'BT' (Broader), 'NT' (Narrower), 'RT' (Related), 'UF' (Used For)
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source_term_id, target_term_id, relationship_type) -- Prevenir relaciones duplicadas exactas
);
COMMENT ON TABLE public.relationships IS 'Define las relaciones entre los términos, actuando como aristas en el grafo.';

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- 4. Crear Políticas de Seguridad (Policies)
-- Estas políticas permiten el acceso público de lectura y escritura a cualquier usuario.
-- Para un entorno de producción real, querrías restringir esto a usuarios autenticados.
CREATE POLICY "Allow public read access" ON public.terms FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.terms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.terms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.terms FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.relationships FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.relationships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.relationships FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.relationships FOR DELETE USING (true);
