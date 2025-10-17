-- Migration: Add thesaurus versioning system
-- Adds fields to support versioned thesauruses with parent-child relationships

-- Add versioning fields to thesauruses table
ALTER TABLE thesauruses
ADD COLUMN parent_thesaurus_id uuid REFERENCES thesauruses(id),
ADD COLUMN version_number integer DEFAULT 1,
ADD COLUMN is_latest boolean DEFAULT true,
ADD COLUMN version_created_at timestamp with time zone DEFAULT now(),
ADD COLUMN version_description text;

-- Create index for better performance on version queries
CREATE INDEX idx_thesauruses_parent_id ON thesauruses(parent_thesaurus_id);
CREATE INDEX idx_thesauruses_is_latest ON thesauruses(is_latest);
CREATE INDEX idx_thesauruses_version_number ON thesauruses(version_number);

-- Update existing thesauruses to have version_number = 1 and is_latest = true
UPDATE thesauruses SET version_number = 1, is_latest = true WHERE version_number IS NULL;

-- Add constraint to ensure version numbers are positive
ALTER TABLE thesauruses ADD CONSTRAINT version_number_positive CHECK (version_number > 0);

-- Add constraint to ensure only one latest version per root thesaurus
-- This is a complex constraint that would require a function, so we'll handle it in application logic

-- Comments for documentation
COMMENT ON COLUMN thesauruses.parent_thesaurus_id IS 'ID of the parent thesaurus this version was created from';
COMMENT ON COLUMN thesauruses.version_number IS 'Sequential version number within the thesaurus family';
COMMENT ON COLUMN thesauruses.is_latest IS 'Whether this is the most recent version in its family';
COMMENT ON COLUMN thesauruses.version_created_at IS 'When this version was created';
COMMENT ON COLUMN thesauruses.version_description IS 'Optional description of changes in this version';