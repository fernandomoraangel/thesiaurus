-- Script para el borrado completo y creación de la base de datos

-- 1. Borrado de tablas existentes (en orden inverso de dependencias)
DROP TABLE IF EXISTS public.relationships CASCADE;
DROP TABLE IF EXISTS public.terms CASCADE;
DROP TABLE IF EXISTS public.thesauruses CASCADE;

-- 2. Creación de la tabla de Tesauros
CREATE TABLE public.thesauruses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.thesauruses IS 'Almacena la lista de tesauros, cada uno vinculado a un usuario.';

-- 3. Creación de la tabla de Términos
CREATE TABLE public.terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesaurus_id UUID REFERENCES public.thesauruses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    scope_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(thesaurus_id, name) -- Asegura que un término sea único dentro de un mismo tesauro
);
COMMENT ON TABLE public.terms IS 'Almacena los términos del tesauro, que actúan como nodos en el grafo.';

-- 4. Creación de la tabla de Relaciones
CREATE TABLE public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE NOT NULL,
    target_term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE NOT NULL,
    relationship_type TEXT NOT NULL, -- Por ejemplo: 'BT' (Término Genérico), 'NT' (Término Específico), 'RT' (Término Relacionado), 'UF' (Usado Para)
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source_term_id, target_term_id, relationship_type) -- Previene la creación de relaciones duplicadas
);
COMMENT ON TABLE public.relationships IS 'Define las relaciones entre los términos, actuando como aristas en el grafo.';

-- 5. Habilitación de Row Level Security (RLS)
ALTER TABLE public.thesauruses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de seguridad para Tesauros
CREATE POLICY "Los usuarios pueden gestionar sus propios tesauros" ON public.thesauruses
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Políticas de seguridad para Términos
CREATE POLICY "Los usuarios pueden gestionar los términos de sus propios tesauros" ON public.terms
FOR ALL USING (thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()))
WITH CHECK (thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()));

-- 8. Políticas de seguridad para Relaciones
CREATE POLICY "Los usuarios pueden gestionar las relaciones de sus propios tesauros" ON public.relationships
FOR ALL USING (source_term_id IN (SELECT id FROM public.terms WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid())))
WITH CHECK (source_term_id IN (SELECT id FROM public.terms WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid())));

-- 9. Asignación de privilegios a los roles
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.thesauruses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.terms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.relationships TO anon, authenticated;
