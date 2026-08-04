-- ==========================================
-- SQL Script for User Management in Supabase
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Function to get all users (Admin only)
CREATE OR REPLACE FUNCTION get_users()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  full_name VARCHAR,
  roles JSONB,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT (SELECT (raw_user_meta_data->'roles')::jsonb ? 'admin' FROM auth.users WHERE auth.users.id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Requires admin role';
  END IF;

  RETURN QUERY
  SELECT 
    u.id, 
    u.email::VARCHAR, 
    (u.raw_user_meta_data->>'full_name')::VARCHAR AS full_name,
    COALESCE(u.raw_user_meta_data->'roles', '["staff"]'::jsonb) AS roles,
    u.created_at
  FROM auth.users u;
END;
$$ LANGUAGE plpgsql;


-- Function to update a user's role (Admin only)
CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT (SELECT (raw_user_meta_data->'roles')::jsonb ? 'admin' FROM auth.users WHERE auth.users.id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Requires admin role';
  END IF;

  -- Ensure valid role
  IF new_role NOT IN ('admin', 'ustadz', 'staff') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{roles}',
    jsonb_build_array(new_role)
  )
  WHERE auth.users.id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_users() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_role(UUID, TEXT) TO authenticated;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
