module.exports = async function handler(req: any, res: any) {
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
