-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION admin_create_user(
  new_email VARCHAR,
  new_password VARCHAR,
  new_full_name VARCHAR,
  new_role TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if the current user is an admin
  IF NOT (SELECT (raw_user_meta_data->'roles')::jsonb ? 'admin' FROM auth.users WHERE auth.users.id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Requires admin role';
  END IF;

  -- Ensure valid role
  IF new_role NOT IN ('admin', 'ustadz', 'staff') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  -- Generate new user ID
  new_user_id := gen_random_uuid();

  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    new_email,
    crypt(new_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', new_full_name, 'roles', jsonb_build_array(new_role)),
    now(),
    now()
  );

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', new_email),
    'email',
    now(),
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION admin_create_user(VARCHAR, VARCHAR, VARCHAR, TEXT) TO authenticated;
NOTIFY pgrst, 'reload schema';
