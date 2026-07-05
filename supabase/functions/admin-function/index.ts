const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const jwtSecret = Deno.env.get("SUPABASE_JWT_SECRET") ?? "";
  const adminHash = Deno.env.get("ADMIN_PASSWORD_HASH") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const url = new URL(req.url);

  const authHeader = req.headers.get("Authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  // POST = login
  if (req.method === "POST") {
    try {
      const { password } = await req.json();

      if (!password || password !== adminHash) {
        return new Response(JSON.stringify({ error: "Invalid password" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Sign a simple JWT
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const now = Math.floor(Date.now() / 1000);
      const payload = btoa(
        JSON.stringify({ role: "admin", iat: now, exp: now + 86400 }),
      );
      const signingData = `${header}.${payload}`;
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(signingData),
      );
      const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
      const jwt = `${signingData}.${signature}`;

      // Fetch rows via REST API
      const dbRes = await fetch(
        `${supabaseUrl}/rest/v1/rsvps?order=created_at.desc`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        },
      );
      const rows = dbRes.ok ? await dbRes.json() : [];

      return new Response(JSON.stringify({ token: jwt, rows }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return new Response(
        JSON.stringify({ error: "Bad request", detail: msg }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  // GET = fetch rows
  if (req.method === "GET") {
    // Verify JWT
    if (!bearerToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const parts = bearerToken.split(".");
      if (parts.length !== 3) throw new Error("bad token");
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      );
      const sigBytes = Uint8Array.from(
        atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0),
      );
      const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        sigBytes,
        new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
      );
      if (!valid) throw new Error("invalid sig");
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error("expired");
      }
    } catch {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch rows
    const dbRes = await fetch(
      `${supabaseUrl}/rest/v1/rsvps?order=created_at.desc`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      },
    );

    if (!dbRes.ok) {
      return new Response(
        JSON.stringify({ error: `DB error ${dbRes.status}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const rows = await dbRes.json();

    // CSV export
    if (url.searchParams.get("format") === "csv") {
      if (rows.length === 0) {
        return new Response("No data", {
          headers: { ...corsHeaders, "Content-Type": "text/csv" },
        });
      }
      const headers = Object.keys(rows[0]);
      const lines = [headers.join(",")];
      for (const row of rows) {
        lines.push(
          headers
            .map((h) => {
              const val = String(row[h] ?? "");
              return val.includes(",") || val.includes('"') || val.includes("\n")
                ? `"${val.replace(/"/g, '""')}"`
                : val;
            })
            .join(","),
        );
      }
      return new Response(lines.join("\n"), {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="rsvps-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return new Response(JSON.stringify({ rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
