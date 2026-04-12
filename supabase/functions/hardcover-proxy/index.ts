import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HARDCOVER_GRAPHQL_URL = "https://api.hardcover.app/v1/graphql";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPERATIONS: Record<string, {
  query: string;
  mapVariables: (v: Record<string, any>) => Record<string, any>;
}> = {
  searchBooks: {
    query: `
      query SearchBooks($query: String!, $perPage: Int!, $page: Int!) {
        search(
          query: $query
          query_type: "Book"
          per_page: $perPage
          page: $page
          sort: "_text_match:desc,users_count:desc"
        ) {
          results
        }
      }
    `,
    mapVariables: (v = {}) => ({
      query: String(v.query || "").trim(),
      perPage: Math.min(Number(v.limit || 20), 50),
      page: Math.max(Number(v.page || 1), 1),
    }),
  },
  discoverBooks: {
    query: `
      query DiscoverBooks($query: String!, $perPage: Int!) {
        search(
          query: $query
          query_type: "Book"
          per_page: $perPage
          page: 1
          sort: "users_count:desc,_text_match:desc"
        ) {
          results
        }
      }
    `,
    mapVariables: (v = {}) => ({
      query: String(v.query || "fiction").trim(),
      perPage: Math.min(Number(v.limit || 40), 50),
    }),
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const token = Deno.env.get("HARDCOVER_API_TOKEN");
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing HARDCOVER_API_TOKEN" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { operation, variables } = await req.json();
    const selectedOp = OPERATIONS[operation];
    if (!selectedOp) {
      return new Response(JSON.stringify({ error: "Unsupported operation" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch(HARDCOVER_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: token,
        "user-agent": "cozy-corner-lovable-proxy",
      },
      body: JSON.stringify({
        query: selectedOp.query,
        variables: selectedOp.mapVariables(variables),
      }),
    });

    const json = await upstream.json();
    if (!upstream.ok || json?.errors) {
      return new Response(JSON.stringify({
        error: json?.errors?.[0]?.message || "Hardcover API request failed",
      }), {
        status: upstream.status || 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = json?.data?.search?.results || [];
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unexpected proxy error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
