const DEFAULT_COVER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1200&auto=format&fit=crop";

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function pickCover(result) {
  return (
    result?.image?.url ||
    result?.cover?.url ||
    result?.cover_url ||
    DEFAULT_COVER
  );
}

function normalizeBook(result) {
  const authorFromContributions = toArray(result?.contributions)
    .map((c) => c?.author?.name)
    .filter(Boolean);
  const author =
    result?.author_name ||
    toArray(result?.author_names)[0] ||
    authorFromContributions[0] ||
    "Unknown";

  const categories = toArray(result?.genres)
    .map((g) => (typeof g === "string" ? g : g?.name))
    .filter(Boolean);
  const mood = toArray(result?.moods)
    .map((m) => (typeof m === "string" ? m : m?.name))
    .filter(Boolean);

  const isbn = toArray(result?.isbns)[0] || "";
  const cover = isbn
    ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
    : pickCover(result);

  return {
    id: String(result?.id || result?.slug || `${result?.title}-${author}`),
    title: result?.title || "Untitled",
    author,
    cover,
    description: result?.description || "A captivating read waiting to be discovered.",
    categories: categories.slice(0, 5),
    mood: mood.slice(0, 5),
    rating: Number(result?.rating || 4),
    pages: Number(result?.pages || 300),
    isbn,
    usersCount: Number(result?.users_count || 0),
  };
}

async function callHardcover(operation, variables) {
  const res = await fetch("/api/hardcover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, variables }),
  });

  if (!res.ok) {
    throw new Error(`Hardcover proxy request failed with ${res.status}`);
  }

  const payload = await res.json();
  if (payload?.error) {
    throw new Error(payload.error);
  }

  return payload;
}

export async function searchHardcoverBooks(query, limit = 20) {
  const payload = await callHardcover("searchBooks", { query, limit });
  return toArray(payload?.results).map(normalizeBook);
}

export async function discoverHardcoverBooks({
  query = "fiction",
  minPopularity = 0,
  maxPopularity = 500000,
  limit = 40,
} = {}) {
  const payload = await callHardcover("discoverBooks", { query, limit });
  return toArray(payload?.results)
    .map(normalizeBook)
    .filter((book) => book.usersCount >= minPopularity && book.usersCount <= maxPopularity);
}

