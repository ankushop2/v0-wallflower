-- Make moderator_id nullable in blind_dm_threads table
-- This allows threads to be created before a moderator is assigned

ALTER TABLE public.blind_dm_threads 
  ALTER COLUMN moderator_id DROP NOT NULL;
