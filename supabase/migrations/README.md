# Supabase Migrations

## How to apply

Run migration files in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) in chronological order.

---

## 20260220_admin_email_from_setting.sql — REQUIRED ACTION

This migration updates `is_admin()` to read the admin email from a database-level
setting rather than hardcoding it. After running the migration file, you must also
run this one-time command in the SQL editor to set the email:

```sql
ALTER DATABASE postgres SET app.admin_email = 'your@email.com';
```

To change the admin email in the future, just re-run that command — no code
changes or redeployments required.
