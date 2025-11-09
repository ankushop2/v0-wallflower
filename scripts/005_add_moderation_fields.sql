-- Add moderation fields to grievances table
ALTER TABLE public.grievances
ADD COLUMN IF NOT EXISTS needs_moderation BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected', null)) DEFAULT null,
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- Create index for moderation queries
CREATE INDEX IF NOT EXISTS idx_grievances_needs_moderation ON public.grievances(needs_moderation, moderation_status);

-- Update existing grievances to not need moderation by default
UPDATE public.grievances SET needs_moderation = false WHERE needs_moderation IS NULL;
