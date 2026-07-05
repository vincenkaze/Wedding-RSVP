Admin Login 400 Bad Request — Diagnosis & Fix

Date: 2026-07-06
Symptom: /admin login form posts to https://vknvqkcocvluihibfnib.supabase.co/functions/v1/admin-function and gets 400 (Bad Request). Function log shows EarlyDrop shutdowns.



Root cause (one-liner)

The deployed edge function expects { password: <SHA-256 of user input> } and compares it against the ADMIN_PASSWORD_HASH env var on the function. The env var on the function is missing or set to a value that doesn't match the client-side hash, so the comparison fails. The 400 (not 401) means the request body is also failing to parse — likely because the function cold-starts and the early-dropped container returns a partial response.

There is a second, bigger problem: the local working tree and origin/main are out of sync on the auth model. See "Architecture drift" below.



What's deployed right now (from origin/main)

src/App.tsx                          # /admin → <AdminGate />
src/components/admin/AdminGate.tsx   # login ↔ dashboard toggle
src/components/admin/AdminLogin.tsx  # calls login() from lib/admin.ts
src/components/admin/AdminDashboard.tsx  # uses fetchRows() / downloadCsv() / deleteRow()
src/lib/admin.ts                     # login() POSTs to VITE_ADMIN_FUNCTION_URL
supabase/functions/admin-function/index.ts

 flow:





Hash the typed password client-side with crypto.subtle.digest('SHA-256', password).



POST { password: <hex hash> } to VITE_ADMIN_FUNCTION_URL.



Function compares password !== adminHash where adminHash = Deno.env.get("ADMIN_PASSWORD_HASH").



On match, function signs a JWT with SUPABASE_JWT_SECRET and returns { token, rows }.



Client stores the token in localStorage and uses it as Authorization: Bearer ... for subsequent GETs.

 flow (deployed):





Reads SUPABASE_JWT_SECRET, ADMIN_PASSWORD_HASH, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY from env.



POST: hash-compare → mint JWT → fetch rows with service-role key.



GET: verify JWT → fetch rows (optionally as CSV).



400 path: only hit when await req.json() throws (empty body / non-JSON / cold-start race).



Architecture drift — the real issue

Your local working tree (the code I just built) is a different design from what's on origin/main:







Concern



Local (working tree)



Remote (origin/main)





Password check



Client-side SHA-256 vs VITE_ADMIN_PASSWORD_HASH



Server-side: client hashes, function compares to ADMIN_PASSWORD_HASH env





Token



Random 32-byte hex, no JWT



JWT signed with SUPABASE_JWT_SECRET





Row reads



Direct supabase.from('rsvps').select('*') with anon key



Edge function with service-role key, JWT-gated





RLS for select



Currently deny anon select (per DB.md) — would block local design



Bypassed by service-role key





Edge function



None — not in local tree





Both can work, but you must commit and deploy consistently. Right now neither the deployed site nor a fresh local build is right.

The 400 happens because:





The deployed frontend is calling the deployed function.



The function's ADMIN_PASSWORD_HASH env var is either unset, set to the wrong value, or was set with a different hash than what  computes (salt mismatch).

 computes: SHA-256(password) (no salt).
The .env.example comment says: SHA-256(YOUR_PASSWORD) (also no salt).
The function expects: Deno.env.get("ADMIN_PASSWORD_HASH") to equal the hex hash above.

If you generated the hash with the .env.example command and pasted it into the Supabase function's ADMIN_PASSWORD_HASH env var, it should work. So either:





The env var on the Supabase function was never set.



The env var was set with a different password / extra whitespace.



The deployed frontend is older and the hash format differs.



Concrete fixes (do these in order)

1. Verify the function env vars

Go to Supabase Dashboard → Edge Functions → admin-function → Secrets. Make sure these are all set:

SUPABASE_URL                  = https://vknvqkcocvluihibfnib.supabase.co
SUPABASE_SERVICE_ROLE_KEY     = <service_role key from Project Settings → API>
SUPABASE_JWT_SECRET           = <JWT secret from Project Settings → API → JWT Settings>
ADMIN_PASSWORD_HASH           = <SHA-256 of your password, lowercase hex>

Generate the hash correctly. The deployed  does:

const data = new TextEncoder().encode(password)   // NO salt
const buf = await crypto.subtle.digest('SHA-256', data)
const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')

In Node:

node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"

Take the 64-char lowercase hex output and paste it verbatim into the Supabase function secret ADMIN_PASSWORD_HASH. No newline, no 0x prefix, no spaces.

Test it before redeploying:

HASH=$(node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_PASSWORD').digest('hex'))")
curl -i -X POST "https://vknvqkcocvluihibfnib.supabase.co/functions/v1/admin-function" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$HASH\"}"

Expect 200 { token, rows }. If 401 { error: "Invalid password" }, the hash is wrong. If 400 { error: "Bad request" }, the env vars are missing and the function is hitting the catch block.

2. Fix the 400 (parse failure) independently

The 400 in your browser console is suspicious because the deployed function only returns 400 from the JSON-parse catch. To make the function more diagnostic, replace the catch in :

} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  return new Response(
    JSON.stringify({ error: "Bad request", detail: msg, contentType: req.headers.get("content-type") }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

Redeploy: npx supabase functions deploy admin-function --project-ref vknvqkcocvluihibfnib --no-verify-jwt. The next 400 will tell you exactly what failed.

3. Stop the architecture drift

You have two valid auth models. Pick one and commit to it. Recommendation: keep the edge function (the deployed one), because:





The anon key is safe-by-RLS but if you ever remove the deny anon select policy for any reason, RSVPs leak. The function keeps the service-role key off the bundle.



The function is the only place the service-role key lives. That's a clean security boundary.



The function's JWT + bearer gives you rate-limiting and session-revocation for free.

What to do:





Discard the local "client-side auth" rewrite. The files under src/components/admin/, , , and  in the working tree are a separate design that doesn't match the deployed function. If you want to ship that design, also delete , update the function name, and update RLS to allow anon SELECT (currently forbidden by DB.md). Then re-test.



If you keep the function (recommended): pull the deployed src/components/admin/* and  from origin/main so local matches remote. Then add only additive changes.



Set the env vars in the Supabase dashboard (not just .env). The function cannot read VITE_* from your local .env — it has its own secrets panel. This is the most common reason for "Bad request" with deployed Supabase functions.

4. Verify the deployed frontend matches origin/main

If you have a Vercel/Netlify/etc. deployment, force a redeploy of origin/main and confirm the bundle includes the function call. You can verify in the browser dev tools Network tab:





POST to https://vknvqkcocvluihibfnib.supabase.co/functions/v1/admin-function



Body: { "password": "<64-char hex>" }



Response: 200 { token, rows } on success, 401 { error } on bad password, 400 { error, detail } on parse/env failure

If the deployed bundle does NOT make that call, you have a stale build. Clear the deploy cache and rebuild.

5. Optional: remove the dead edge function if you switch to client-side auth

If you go with the local working tree design instead:





Delete supabase/functions/admin-function/.



Update DB.md §2 to allow anon SELECT (currently it says deny — see lines around "deny anon select" in the SQL).



Update .env.example to drop VITE_ADMIN_FUNCTION_URL.



Redeploy.



Preload warnings (separate, low-priority)

The browser console also shows:

The resource http://localhost:5173/hero/couple.webp was preloaded using link preload but not used within a few seconds from the window's load event.

 preloads hero images, but on the /admin route the <Hero /> component never mounts. Fix in  by gating the preload on path:

<link rel="preload" as="image" href="/hero/couple.webp" type="image/webp"
      media="(max-width: 640px)" />

Or move the preload into  via useEffect so it only runs on the wedding route. Cosmetic only — does not block login.



TL;DR





Open Supabase dashboard → admin-function secrets.



Set ADMIN_PASSWORD_HASH to the plain SHA-256 hex of your password (no salt, no prefix).



Test with the curl above. If 200, you're done. If 400, the function env vars are missing entirely.



Pick one auth model (function vs client-side) and commit to it — stop maintaining two parallel designs.



Force-redeploy the frontend from origin/main so the bundle matches the function.

