# Supabase + Admin Panel

## Goal

Persist RSVP responses in Supabase Postgres. Expose a private `/admin` dashboard for the couple to read, search, filter, export, and delete responses.

## Current State

- Supabase project exists (region ap-south-1)
- `rsvps` table schema defined below
- RLS enabled: public INSERT only, no anon SELECT
- Admin code exists locally in `src/components/admin/`
- Edge function `admin-function` exists in `supabase/functions/`
- **Architecture drift:** local code uses random-token auth; deployed function uses JWT auth. The mismatch blocks `/admin` in deployed builds. See `fix-db.md` and `Problems-to-fix.md` P-013.

## Schema

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| created_at | timestamptz | now() | Auto |
| name | text | — | NOT NULL, trimmed |
| guests | int2 | 1 | CHECK 1–10 |
| events | text[] | {} | From `content.ts` |
| dietary | text | '' | Free text |
| message | text | '' | Free text |
| source | text | 'web' | Future-proof |
| user_agent | text | '' | Debug |

SQL — constraints + indexes:
```sql
ALTER TABLE rsvps
  ADD CONSTRAINT guests_range CHECK (guests BETWEEN 1 AND 10),
  ADD CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0);

CREATE INDEX rsvps_name_lower_idx ON rsvps (lower(name));
CREATE INDEX rsvps_created_at_idx ON rsvps (created_at DESC);
```

## RLS

```sql
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow public insert" ON rsvps
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "deny anon select" ON rsvps
  FOR SELECT TO anon USING (false);
```

Admin reads use the `service_role` key in the edge function. The anon key never has SELECT.

## Auth Models

There are two competing designs in the codebase:

1. **Deployed Edge Function (JWT)**
   - Client sends SHA-256 password hash
   - Function compares to `ADMIN_PASSWORD_HASH` env var
   - On match, mints short-lived JWT
   - Reads use `service_role`, bypassing RLS

2. **Local working tree (random token)**
   - Client stores opaque 32-byte hex token
   - Server validates token directly
   - No JWT involved

**Recommendation:** Keep the deployed JWT function and align local code to it.

## Env Vars

### Frontend (`.env`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_PASSWORD_HASH`
- `VITE_ADMIN_FUNCTION_URL`

### Edge Function (Supabase Dashboard → Secrets)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `ADMIN_PASSWORD_HASH`

## Guest UX

Form → insert row → success animation. No external redirects.

## Admin UX

`/admin` → password → dashboard (table, stats, CSV export, delete).

## Issues

See `Problems-to-fix.md` P-013.
