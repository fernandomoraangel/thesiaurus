-- MIGRACIÓN A UN ESQUEMA COMPATIBLE CON SKOS

-- NOTA: Este script es destructivo. Borra las tablas de términos y relaciones existentes.
-- Se recomienda hacer una copia de seguridad de los datos antes de ejecutarlo.

-- 1. Borrado de tablas existentes que serán reemplazadas
DROP TABLE IF EXISTS public.relationships CASCADE;
DROP TABLE IF EXISTS public.terms CASCADE;

-- 2. Creación de la tabla de Conceptos (skos:Concept)
CREATE TABLE public.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesaurus_id UUID REFERENCES public.thesauruses(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.concepts IS 'Almacena los conceptos SKOS, que son las unidades centrales del tesauro.';

-- 3. Creación de la tabla de Etiquetas (skos:prefLabel, skos:altLabel, skos:hiddenLabel)
CREATE TABLE public.labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    label_type TEXT NOT NULL, -- 'prefLabel', 'altLabel', 'hiddenLabel'
    label_text TEXT NOT NULL,
    lang CHAR(2) DEFAULT 'es', -- Código de idioma ISO 639-1
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(concept_id, label_type, label_text, lang)
);
COMMENT ON TABLE public.labels IS 'Almacena las etiquetas de texto para cada concepto.';

-- 4. Creación de la tabla de Notas (skos:definition, skos:scopeNote, skos:example)
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    note_type TEXT NOT NULL, -- 'definition', 'scopeNote', 'example'
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.notes IS 'Almacena las notas de documentación para cada concepto.';

-- 5. Re-creación de la tabla de Relaciones (skos:broader, skos:narrower, skos:related)
CREATE TABLE public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    target_concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    relationship_type TEXT NOT NULL, -- 'broader', 'narrower', 'related'
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source_concept_id, target_concept_id, relationship_type)
);
COMMENT ON TABLE public.relationships IS 'Define las relaciones semánticas entre conceptos.';

-- 6. Habilitación de Row Level Security (RLS) para las nuevas tablas
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de seguridad para las nuevas tablas
CREATE POLICY "Los usuarios pueden gestionar los conceptos de sus propios tesauros" ON public.concepts
FOR ALL USING (thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()))
WITH CHECK (thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()));

CREATE POLICY "Los usuarios pueden gestionar las etiquetas de sus propios tesauros" ON public.labels
FOR ALL USING (concept_id IN (SELECT id FROM public.concepts WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid())));

CREATE POLICY "Los usuarios pueden gestionar las notas de sus propios tesauros" ON public.notes
FOR ALL USING (concept_id IN (SELECT id FROM public.concepts WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid())));

CREATE POLICY "Los usuarios pueden gestionar las relaciones de sus propios tesauros" ON public.relationships
FOR ALL USING (source_concept_id IN (SELECT id FROM public.concepts WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid())));

-- 8. Asignación de privilegios a los roles
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.concepts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.labels TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.relationships TO anon, authenticated;
