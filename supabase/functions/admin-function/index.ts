const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const adminHash = Deno.env.get("ADMIN_PASSWORD_HASH") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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

      return new Response(JSON.stringify({ token: "ok", rows }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(
        JSON.stringify({ error: "Bad request", detail: msg }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  // GET = fetch rows (requires bearer token)
  if (req.method === "GET") {
    if (!bearerToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);

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
      return new Response(JSON.stringify({ error: `DB error ${dbRes.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = await dbRes.json();

    // CSV export
    if (url.searchParams.get("format") === "csv") {
      if (rows.length === 0) {
        return new Response("No data", {
          headers: { ...corsHeaders, "Content-Type": "text/csv" },
        });
      }
      const keys = Object.keys(rows[0]);
      const lines = [keys.join(",")];
      for (const row of rows) {
        lines.push(
          keys
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

  // DELETE = remove row
  if (req.method === "DELETE") {
    if (!bearerToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { id } = await req.json();
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const dbRes = await fetch(
        `${supabaseUrl}/rest/v1/rsvps?id=eq.${id}`,
        {
          method: "DELETE",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        },
      );

      if (!dbRes.ok) {
        return new Response(JSON.stringify({ error: `Delete failed ${dbRes.status}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ error: "Bad request", detail: msg }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
