import { connection } from "@/db";

export function buildTsVector(title: string, body: string): string {
  return `${title} ${body}`;
}

export async function searchNotes(userId: string, query: string, limit = 20) {
  const rows = await connection`
    SELECT id, title, left(body, 400) AS body,
           ts_rank(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,'')),
                   plainto_tsquery('english', ${query})) AS rank
    FROM notes
    WHERE user_id = ${userId}
      AND to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''))
          @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC, updated_at DESC
    LIMIT ${limit}`;
  return rows.map((r) => ({ id: r.id, title: r.title, body: r.body }));
}
