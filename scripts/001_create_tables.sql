-- Create users table for admin/moderator accounts
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create anonymous tokens table for tracking anonymous users
CREATE TABLE IF NOT EXISTS public.anonymous_tokens (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create grievances table
CREATE TABLE IF NOT EXISTS public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  frequency TEXT NOT NULL CHECK (frequency IN ('once', 'occasional', 'frequent', 'constant')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  anonymous_token TEXT NOT NULL REFERENCES public.anonymous_tokens(token) ON DELETE CASCADE,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  anonymous_token TEXT NOT NULL REFERENCES public.anonymous_tokens(token) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(grievance_id, anonymous_token)
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  anonymous_token TEXT NOT NULL REFERENCES public.anonymous_tokens(token) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(grievance_id, anonymous_token, emoji)
);

-- Create comments table (thread timeline)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  anonymous_token TEXT REFERENCES public.anonymous_tokens(token) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'comment' CHECK (comment_type IN ('comment', 'status_change', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (anonymous_token IS NOT NULL AND user_id IS NULL) OR
    (anonymous_token IS NULL AND user_id IS NOT NULL)
  )
);

-- Create blind_dm_threads table
CREATE TABLE IF NOT EXISTS public.blind_dm_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  anonymous_token TEXT NOT NULL REFERENCES public.anonymous_tokens(token) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(grievance_id, anonymous_token)
);

-- Create blind_dm_messages table
CREATE TABLE IF NOT EXISTS public.blind_dm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.blind_dm_threads(id) ON DELETE CASCADE,
  is_from_moderator BOOLEAN NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create routing_rules table
CREATE TABLE IF NOT EXISTS public.routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('category', 'impact', 'keyword', 'frequency')),
  condition_value TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('assign', 'notify', 'auto_respond')),
  action_value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_grievances_status ON public.grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON public.grievances(category);
CREATE INDEX IF NOT EXISTS idx_grievances_created_at ON public.grievances(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grievances_upvotes ON public.grievances(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_votes_grievance ON public.votes(grievance_id);
CREATE INDEX IF NOT EXISTS idx_comments_grievance ON public.comments(grievance_id);
CREATE INDEX IF NOT EXISTS idx_blind_dm_thread ON public.blind_dm_threads(grievance_id);
CREATE INDEX IF NOT EXISTS idx_blind_dm_messages_thread ON public.blind_dm_messages(thread_id);
