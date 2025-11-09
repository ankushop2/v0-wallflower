-- Function to automatically create user profile when auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'moderator')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update grievance vote counts
CREATE OR REPLACE FUNCTION public.update_grievance_votes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE public.grievances SET upvotes = upvotes + 1 WHERE id = NEW.grievance_id;
    ELSE
      UPDATE public.grievances SET downvotes = downvotes + 1 WHERE id = NEW.grievance_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.grievances SET upvotes = upvotes - 1 WHERE id = OLD.grievance_id;
    ELSE
      UPDATE public.grievances SET downvotes = downvotes - 1 WHERE id = OLD.grievance_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.grievances SET upvotes = upvotes - 1 WHERE id = OLD.grievance_id;
    ELSE
      UPDATE public.grievances SET downvotes = downvotes - 1 WHERE id = OLD.grievance_id;
    END IF;
    IF NEW.vote_type = 'up' THEN
      UPDATE public.grievances SET upvotes = upvotes + 1 WHERE id = NEW.grievance_id;
    ELSE
      UPDATE public.grievances SET downvotes = downvotes + 1 WHERE id = NEW.grievance_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for vote changes
DROP TRIGGER IF EXISTS on_vote_change ON public.votes;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_grievance_votes();
