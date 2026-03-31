import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const response = await fetch(
    'https://api.replicate.com/v1/deployments/asceticnobilis/hippocrateia/predictions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
}