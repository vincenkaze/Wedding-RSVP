Database (Supabase) + Admin Panel — RSVP Storage

Working doc for wiring the RSVP form to a real Supabase Postgres table and exposing a private /admin dashboard so responses are stored, browsed, and exported.



Why this stack





Supabase free tier is enough — 500 MB DB, 50k MAU, 2 GB egress. One wedding, ~200–500 guests → years of headroom. Region ap-south-1 (Mumbai) for low latency from Kerala.



No backend to write — direct insert from the browser using the Supabase JS client. The site stays a static SPA. No server cost, no cold starts.



Row Level Security (RLS) — guests can only INSERT, never read other guests' responses. Anon key in the bundle is safe because of RLS.



Private admin at /admin — single shared password (hashed, stored as env var). No auth flow, no signup. Couples just open the URL on the day.



Direct dashboard — supabase.com table editor is the system of record; the in-app admin is a pretty face on top of the same data.

Rejected: Firebase (lock-in, no-SQL awkward), Airtable (rate limits, awkward write API), Google Sheets (auth dance, fragile), custom backend (overkill).



Current state (before this change)





 did: open wa.me/<number>?text=... in a new tab, optionally POST to Web3Forms, show success.



No persistent record on our side. No master guest list, no catering count, no way to chase non-responders.

After this change: every form submission writes a row to Supabase. WhatsApp and Web3Forms paths are removed — the form is now self-contained, just a success screen after a one-second save.



What we built (final state)

1. Supabase project + table





Create project at supabase.com, region ap-south-1



Table editor → new table rsvps with:







Column



Type



Default



Notes





id



uuid



gen_random_uuid()



PK





created_at



timestamptz



now()



Auto





name



text



—



NOT NULL, trimmed





guests



int2



1



1–10





events



text[]



{}



From  rsvp.events





dietary



text



''



Free text





message



text



''



Free text





source



text



'web'



Future-proof





user_agent



text



''



For debugging WhatsApp in-app issues

SQL editor — constraints + indexes:

ALTER TABLE rsvps
  ADD CONSTRAINT guests_range CHECK (guests BETWEEN 1 AND 10),
  ADD CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0);

CREATE INDEX rsvps_name_lower_idx ON rsvps (lower(name));
CREATE INDEX rsvps_created_at_idx ON rsvps (created_at DESC);

2. RLS — default deny, public insert only

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow public insert" ON rsvps
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "deny anon select" ON rsvps
  FOR SELECT TO anon USING (false);

Admin reads are done with the service_role key in a tiny Cloudflare Worker / Supabase Edge Function. Anon key never has SELECT.

3. Edge function: admin read + export

:





POST { password } → returns 24-hour signed JWT + the rows.



GET with that JWT → returns all rows.



GET with ?format=csv → streams a CSV file.

The function:





Hashes the incoming password and compares to ADMIN_PASSWORD_HASH (env var on the function).



On match, mints a short-lived JWT (role: "admin") using SUPABASE_SERVICE_ROLE_KEY.



All real DB reads go through supabaseAdmin.from('rsvps').select('*') with the service role, bypassing RLS.

Why a function and not a route on our site: the anon key from the bundle cannot SELECT. The function is the only place the service_role key lives. We never put service_role in the SPA.

4. Env vars

.env.example:

# Supabase — RSVP storage. Without these the form still works, just doesn't persist.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Admin password hash. Generate with the node one-liner in the comment.
VITE_ADMIN_PASSWORD_HASH=

# Supabase Edge Function URL (deployed separately) for the admin dashboard reads.
VITE_ADMIN_FUNCTION_URL=

.env stays in .gitignore (already there — verify).

5. Code added

src/lib/supabase.ts          # typed client, exports null if env missing
src/lib/rsvp.ts              # persistRsvp() + RsvpRow / RsvpFormData types
src/lib/admin.ts             # session storage + password hashing + login
src/components/admin/
  AdminGate.tsx              # chooses between Login / Dashboard
  AdminLogin.tsx             # password screen, show/hide toggle
  AdminDashboard.tsx         # table + filters + stats + CSV export + delete

 reads window.location.pathname. If it starts with /admin, it mounts <AdminGate /> instead of the wedding site. The Preloader, EnvelopeIntro, MusicControl, CustomCursor, Lenis smooth scroll — none of those run on /admin. The wedding site is invisible to the admin URL.

6. UX





Guest side (unchanged): form → success animation. No WhatsApp redirect, no external link. Single-page, single-action.



Admin side:






Open https://<your-domain>/admin



Password prompt (show/hide toggle, single field, no email/username — couple doesn't need to remember anything else)



Dashboard: total count, attending vs. declined split, total guests, dietary breakdown, recent 5 messages



Sortable, searchable, filterable table of all responses



"Export CSV" button → downloads immediately



Delete row (with confirm modal) for spam / mistakes



Logout button clears the local session



No signup, no "create account", no admin link in the footer of the wedding site. Guests don't know /admin exists. Only the couple does.

7. Security





Password stored as a SHA-256 hash in .env. Source password never written to disk.



Session is a random 32-byte token in localStorage with 12-hour TTL. Not a JWT — there's nothing to forge; the token is opaque, validated server-side by the Edge Function.



Admin function rate-limited: max 5 failed attempts per IP per 15 min (Supabase built-in).



HTTPS only at the hosting layer.

8. Performance





@supabase/supabase-js: 12 KB gzipped, tree-shaken to actual usage.



Admin dashboard loads only when path is /admin — site bundle stays the same size for guests.



Edge Function cold-starts ~150 ms in ap-south-1. Acceptable for a dashboard you open twice a day.



CSV export streams server-side, no client-side memory spike even with 1000+ rows.



Definition of Done





Supabase project, region ap-south-1



rsvps table with exact schema, constraints, indexes



RLS enabled, only INSERT allowed for anon



Edge function admin-rsvps deployed, env vars set



.env.example updated



@supabase/supabase-js installed, noted in 



, ,  created



 created



 routes /admin to the gate



 calls persistRsvp, removed WhatsApp and Web3Forms paths



Local test: form submit → row in Supabase



/admin opens the login, password gates access



Dashboard shows real rows, export CSV works



Failed password returns error, doesn't crash



No console errors, no any



bun run build passes



Bundle: guest site ~135 KB gzipped, admin code lazy-loaded only on /admin



What NOT to do





❌ Don't put service_role key in the frontend bundle



❌ Don't expose any "admin" link in the guest-facing site



❌ Don't add a public sign-up flow — admin is shared password only



❌ Don't make the user wait for the Supabase insert before showing success (fire-and-forget)



❌ Don't change RSVPForm validation logic — Supabase constraints mirror it



❌ Don't commit .env — the password hash leaks brute-force resistance

