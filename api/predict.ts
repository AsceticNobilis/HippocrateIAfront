module.exports = async function handler(req: any, res: any) {
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
