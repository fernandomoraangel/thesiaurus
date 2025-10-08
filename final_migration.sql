-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thesaurus_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  notes text,
  color text DEFAULT '#cccccc'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_thesaurus_id_fkey FOREIGN KEY (thesaurus_id) REFERENCES public.thesauruses(id)
);
CREATE TABLE public.concepts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thesaurus_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  category_id uuid,
  temporal_start integer,
  temporal_end integer,
  temporal_relevance numeric DEFAULT 1.0,
  CONSTRAINT concepts_pkey PRIMARY KEY (id),
  CONSTRAINT concepts_thesaurus_id_fkey FOREIGN KEY (thesaurus_id) REFERENCES public.thesauruses(id),
  CONSTRAINT concepts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.labels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  concept_id uuid NOT NULL,
  label_type text NOT NULL,
  label_text text NOT NULL,
  lang character DEFAULT 'es'::bpchar,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT labels_pkey PRIMARY KEY (id),
  CONSTRAINT labels_concept_id_fkey FOREIGN KEY (concept_id) REFERENCES public.concepts(id)
);
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  concept_id uuid NOT NULL,
  note_type text NOT NULL,
  note_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_concept_id_fkey FOREIGN KEY (concept_id) REFERENCES public.concepts(id)
);
CREATE TABLE public.relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  source_concept_id uuid NOT NULL,
  target_concept_id uuid NOT NULL,
  relationship_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  temporal_start integer,
  temporal_end integer,
  temporal_relevance numeric DEFAULT 1.0,
  CONSTRAINT relationships_pkey PRIMARY KEY (id),
  CONSTRAINT relationships_source_concept_id_fkey FOREIGN KEY (source_concept_id) REFERENCES public.concepts(id),
  CONSTRAINT relationships_target_concept_id_fkey FOREIGN KEY (target_concept_id) REFERENCES public.concepts(id)
);
CREATE TABLE public.thesauruses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  uri text,
  author text,
  version text,
  published_at timestamp with time zone,
  language text,
  license text,
  description text,
  thesaurus_type text DEFAULT 'static'::text CHECK (thesaurus_type = ANY (ARRAY['static'::text, 'dynamic'::text])),
  CONSTRAINT thesauruses_pkey PRIMARY KEY (id),
  CONSTRAINT thesauruses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);