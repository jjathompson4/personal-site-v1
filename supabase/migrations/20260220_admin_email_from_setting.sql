-- Move admin email out of hardcoded SQL into a dedicated table.
--
-- This migration was applied to the live database on 2026-02-20.
--
-- To add or change the admin email in the future, run in the Supabase SQL editor:
--   INSERT INTO admin_emails (email) VALUES ('new@email.com') ON CONFLICT DO NOTHING;
--   DELETE FROM admin_emails WHERE email = 'old@email.com';

CREATE TABLE IF NOT EXISTS admin_emails (
  email text PRIMARY KEY
);

INSERT INTO admin_emails (email)
VALUES ('jjathompson4@gmail.com')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_emails
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
