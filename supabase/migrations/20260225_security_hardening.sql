-- Security hardening based on Supabase Security Advisor warnings.
-- Applied 2026-02-25.

-- =============================================================
-- 1. Lock down admin_emails table (CRITICAL)
-- =============================================================
-- Enable RLS with NO permissive policies.  This blocks all direct
-- access from anon and authenticated roles.  The is_admin() function
-- still works because it is SECURITY DEFINER (bypasses RLS).
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 2. Pin search_path on is_admin() function
-- =============================================================
-- Using search_path = '' forces fully-qualified table names,
-- preventing schema-spoofing attacks.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
