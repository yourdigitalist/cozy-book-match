const HARDCOVER_GRAPHQL_URL = "https://api.hardcover.app/v1/graphql";

const OPERATIONS = {
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
    mapVariables: (variables = {}) => ({
      query: String(variables.query || "").trim(),
      perPage: Math.min(Number(variables.limit || 20), 50),
      page: Math.max(Number(variables.page || 1), 1),
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
    mapVariables: (variables = {}) => ({
      query: String(variables.query || "fiction").trim(),
      perPage: Math.min(Number(variables.limit || 40), 50),
    }),
  },
};

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.HARDCOVER_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Missing HARDCOVER_API_TOKEN" });
  }

  const { operation, variables } = parseBody(req.body);
  const selectedOperation = OPERATIONS[operation];
  if (!selectedOperation) {
    return res.status(400).json({ error: "Unsupported Hardcover operation" });
  }

  const body = {
    query: selectedOperation.query,
    variables: selectedOperation.mapVariables(variables),
  };

  try {
    const upstream = await fetch(HARDCOVER_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: token,
        "user-agent": "cozy-book-match-vercel-proxy",
      },
      body: JSON.stringify(body),
    });

    const json = await upstream.json();
    if (!upstream.ok || json?.errors) {
      return res.status(upstream.status || 500).json({
        error: json?.errors?.[0]?.message || "Hardcover API request failed",
      });
    }

    const results = json?.data?.search?.results || [];
    return res.status(200).json({ results });
  } catch {
    return res.status(500).json({ error: "Unexpected proxy error" });
  }
}

