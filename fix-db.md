# Admin Auth 400 — Diagnosis & Fix

Date: 2026-07-06

Symptom: `/admin` login form posts to Supabase edge function and gets 400 (Bad Request). Function log shows early drops/cold starts.

## Root Cause

The deployed edge function expects `{ password: <SHA-256 hex> }` and compares it against `ADMIN_PASSWORD_HASH`. The 400 means either the env vars are missing/unset, the hash does not match, or a cold-start causes a JSON-parse failure in the catch block.

## Architecture Drift

Local working tree and deployed origin/main are out of sync on the auth model:

| Concern | Local (working tree) | Remote (origin/main) |
|---------|---------------------|----------------------|
| Password check | Client-side SHA-256 vs env hash | Server-side: client hashes, function compares to env hash |
| Token | Random 32-byte hex | JWT signed with `SUPABASE_JWT_SECRET` |
| Row reads | Direct supabase client with anon key | Edge function with `service_role` key |
| RLS | Currently denies anon select | Bypassed by service-role key in function |
| Edge function | Not present locally | Deployed and expected by origin/main |

Both models can work, but the repo must pick one and commit to it.

## Concrete Fixes

1. Verify function env vars in Supabase Dashboard → Edge Functions → admin-function → Secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `ADMIN_PASSWORD_HASH`

2. Generate the hash correctly:
   ```bash
   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
   ```
   Paste the 64-char lowercase hex into the function secret. No newline, no prefix.

3. Test before redeploying:
   ```bash
   HASH=$(node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_PASSWORD').digest('hex'))")
   curl -i -X POST "https://vknvqkcocvluihibfnib.supabase.co/functions/v1/admin-function" \
     -H "Content-Type: application/json" \
     -d "{\"password\":\"$HASH\"}"
   ```
   - 200 → `{ token, rows }`
   - 401 → `{ error: "Invalid password" }`
   - 400 → env/parse failure

4. Stop the architecture drift.

   **Recommended:** keep the edge function because:
   - `service_role` key never leaves the function.
   - JWT gives rate-limiting and session-revocation for free.
   - Anon key stays safe-by-RLS.

   Then:
   - Discard the local client-side auth rewrite, OR
   - Align local code to the deployed JWT function and redeploy.

5. Force-redeploy frontend from origin/main so the bundle matches the chosen auth path.

## Preload Warning (low priority)

The browser console may warn that `/hero/couple.webp` was preloaded but unused on `/admin`. Fix by gating the preload on the wedding route or moving it into a `useEffect`.

## TL;DR

- Set `ADMIN_PASSWORD_HASH` to the plain SHA-256 hex of your password in the Supabase function secrets.
- Pick one auth model and delete the other.
- Redeploy so frontend and function agree.
