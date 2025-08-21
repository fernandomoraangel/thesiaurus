-- Final Supabase Migration Script

-- 1. Create Thesauruses Table
CREATE TABLE public.thesauruses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    uri TEXT,
    author TEXT,
    version TEXT,
    published_at TIMESTAMPTZ,
    language TEXT,
    license TEXT,
    description TEXT
);
COMMENT ON TABLE public.thesauruses IS 'Stores the list of thesauruses, each linked to a user.';
COMMENT ON COLUMN public.thesauruses.title IS 'Official and complete name of the thesaurus.';
COMMENT ON COLUMN public.thesauruses.uri IS 'Persistent identifier, such as a URI (Uniform Resource Identifier).';
COMMENT ON COLUMN public.thesauruses.author IS 'Organization or individuals responsible for its creation and maintenance.';
COMMENT ON COLUMN public.thesauruses.version IS 'Indication of the current version of the thesaurus.';
COMMENT ON COLUMN public.thesauruses.published_at IS 'Date of publication or last modification of the version.';
COMMENT ON COLUMN public.thesauruses.language IS 'Languages covered by the thesaurus.';
COMMENT ON COLUMN public.thesauruses.license IS 'Information about the license that governs its use (e.g. Creative Commons).';
COMMENT ON COLUMN public.thesauruses.description IS 'A brief description of the thesaurus.';

-- 2. Create Concepts Table (skos:Concept)
CREATE TABLE public.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesaurus_id UUID REFERENCES public.thesauruses(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.concepts IS 'Stores SKOS concepts, which are the central units of the thesaurus.';

-- 3. Create Labels Table (skos:prefLabel, skos:altLabel, skos:hiddenLabel)
CREATE TABLE public.labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    label_type TEXT NOT NULL, -- 'prefLabel', 'altLabel', 'hiddenLabel'
    label_text TEXT NOT NULL,
    lang CHAR(2) DEFAULT 'es', -- ISO 639-1 language code
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(concept_id, label_type, label_text, lang)
);
COMMENT ON TABLE public.labels IS 'Stores text labels for each concept.';

-- 4. Create Notes Table (skos:definition, skos:scopeNote, skos:example)
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    note_type TEXT NOT NULL, -- 'definition', 'scopeNote', 'example'
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.notes IS 'Stores documentation notes for each concept.';

-- 5. Create Relationships Table (skos:broader, skos:narrower, skos:related)
CREATE TABLE public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    target_concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
    relationship_type TEXT NOT NULL, -- 'broader', 'narrower', 'related'
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source_concept_id, target_concept_id, relationship_type)
);
COMMENT ON TABLE public.relationships IS 'Defines semantic relationships between concepts.';

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.thesauruses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- 7. Security Policies
CREATE POLICY "Users can manage their own thesauruses" ON public.thesauruses
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage concepts in their own thesauruses" ON public.concepts
FOR ALL USING (thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()))
WITH CHECK (thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage labels in their own thesauruses" ON public.labels
FOR ALL USING (concept_id IN (SELECT id FROM public.concepts WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage notes in their own thesauruses" ON public.notes
FOR ALL USING (concept_id IN (SELECT id FROM public.concepts WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage relationships in their own thesauruses" ON public.relationships
FOR ALL USING (source_concept_id IN (SELECT id FROM public.concepts WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid())));

-- 8. Grant Privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.thesauruses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.concepts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.labels TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.relationships TO anon, authenticated;
