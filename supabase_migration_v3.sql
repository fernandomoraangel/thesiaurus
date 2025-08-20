-- 1. Create Thesauruses Table
CREATE TABLE public.thesauruses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.thesauruses IS 'Stores the list of thesauruses, each linked to a user.';

-- 2. Add thesaurus_id to terms table
ALTER TABLE public.terms
ADD COLUMN thesaurus_id UUID REFERENCES public.thesauruses(id) ON DELETE CASCADE;

-- 3. Update RLS policies
-- TERMS
DROP POLICY "Allow public read access" ON public.terms;
DROP POLICY "Allow public write access" ON public.terms;
DROP POLICY "Allow public update access" ON public.terms;
DROP POLICY "Allow public delete access" ON public.terms;

CREATE POLICY "Allow users to read their own terms" ON public.terms
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.thesauruses WHERE id = thesaurus_id));

CREATE POLICY "Allow users to insert terms into their own thesauruses" ON public.terms
FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.thesauruses WHERE id = thesaurus_id));

CREATE POLICY "Allow users to update their own terms" ON public.terms
FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.thesauruses WHERE id = thesaurus_id));

CREATE POLICY "Allow users to delete their own terms" ON public.terms
FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.thesauruses WHERE id = thesaurus_id));

-- RELATIONSHIPS
DROP POLICY "Allow public read access" ON public.relationships;
DROP POLICY "Allow public write access" ON public.relationships;
DROP POLICY "Allow public update access" ON public.relationships;
DROP POLICY "Allow public delete access" ON public.relationships;

CREATE POLICY "Allow users to read relationships in their own thesauruses" ON public.relationships
FOR SELECT USING (
    source_term_id IN (SELECT id FROM public.terms WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()))
);

CREATE POLICY "Allow users to insert relationships in their own thesauruses" ON public.relationships
FOR INSERT WITH CHECK (
    source_term_id IN (SELECT id FROM public.terms WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()))
);

CREATE POLICY "Allow users to update relationships in their own thesauruses" ON public.relationships
FOR UPDATE USING (
    source_term_id IN (SELECT id FROM public.terms WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()))
);

CREATE POLICY "Allow users to delete relationships in their own thesauruses" ON public.relationships
FOR DELETE USING (
    source_term_id IN (SELECT id FROM public.terms WHERE thesaurus_id IN (SELECT id FROM public.thesauruses WHERE user_id = auth.uid()))
);

-- THESAURUSES
ALTER TABLE public.thesauruses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own thesauruses" ON public.thesauruses
FOR ALL USING (auth.uid() = user_id);
