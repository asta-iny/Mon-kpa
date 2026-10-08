import { Router } from 'express';
import { getPrisma } from '../../infrastructure/prisma.js';

/**
 * M0-010 SSR/search spike — foundation only.
 * Not a product search UI. Renders HTML from a MySQL FULLTEXT query.
 */
export function createSpikeRouter(): Router {
  const router = Router();

  router.get('/spike/ssr-search', async (req, res, next) => {
    try {
      const q = String(req.query.q ?? 'mechanic').slice(0, 80);
      const started = Date.now();
      const rows = await getPrisma().$queryRaw<
        Array<{ id: string; title: string; body: string; score: number }>
      >`
        SELECT id, title, body,
               MATCH(title, body) AGAINST (${q} IN NATURAL LANGUAGE MODE) AS score
        FROM search_spike_documents
        WHERE MATCH(title, body) AGAINST (${q} IN NATURAL LANGUAGE MODE)
        ORDER BY score DESC
        LIMIT 20
      `;
      const elapsedMs = Date.now() - started;
      const items = rows
        .map(
          (r) =>
            `<li><strong>${escapeHtml(r.title)}</strong> <span>(${r.score.toFixed(3)})</span><p>${escapeHtml(r.body.slice(0, 160))}</p></li>`,
        )
        .join('\n');

      res.status(200).type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LibFind M0 SSR search spike</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 1rem; max-width: 40rem; }
    @media (max-width: 360px) { body { margin: 0.5rem; font-size: 14px; } }
  </style>
</head>
<body>
  <h1>LibFind</h1>
  <p>M0 SSR/search spike (not product search). q=${escapeHtml(q)} · ${elapsedMs}ms · ${rows.length} hits</p>
  <ul>${items || '<li>No matches — seed search spike documents first.</li>'}</ul>
</body>
</html>`);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
