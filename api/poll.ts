import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL manquante' });

  const response = await fetch(url as string, {
    headers: {
      'Authorization': `Bearer ${process.env.REPLICATE_TOKEN}`,
    },
  });

  const data = await response.json();
  res.status(response.status).json(data);
}