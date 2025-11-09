-- Create webhook_integrations table for storing generic webhook configurations
CREATE TABLE IF NOT EXISTS public.webhook_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_webhook_integrations_category ON public.webhook_integrations(category);
CREATE INDEX IF NOT EXISTS idx_webhook_integrations_created_by ON public.webhook_integrations(created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhook_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating to make script idempotent
DROP TRIGGER IF EXISTS trigger_update_webhook_integration_updated_at ON public.webhook_integrations;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_webhook_integration_updated_at
  BEFORE UPDATE ON public.webhook_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_integration_updated_at();

-- Enable Row Level Security
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating to make script idempotent
DROP POLICY IF EXISTS "Admin and moderators can view webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Admin and moderators can create webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Admin and moderators can update their webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Admin and moderators can delete their webhook integrations" ON public.webhook_integrations;

-- Create RLS policies
-- Admin and moderators can view all integrations
CREATE POLICY "Admin and moderators can view webhook integrations"
  ON public.webhook_integrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Admin and moderators can insert their own integrations
CREATE POLICY "Admin and moderators can create webhook integrations"
  ON public.webhook_integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Admin and moderators can update their own integrations
CREATE POLICY "Admin and moderators can update their webhook integrations"
  ON public.webhook_integrations
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Admin and moderators can delete their own integrations
CREATE POLICY "Admin and moderators can delete their webhook integrations"
  ON public.webhook_integrations
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );
