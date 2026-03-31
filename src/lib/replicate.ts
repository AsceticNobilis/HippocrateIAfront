const REPLICATE_API_URL = 'https://api.replicate.com/v1/deployments/asceticnobilis/hippocrateia/predictions';
const REPLICATE_TOKEN = import.meta.env.VITE_REPLICATE_TOKEN;

export const callReplicate = async (input: object): Promise<any> => {
  // 1. Lance la prédiction
  const res = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input })
  });

  const prediction = await res.json();
  if (!res.ok) throw new Error(prediction.detail || 'Erreur Replicate');

  // 2. Poll jusqu'à completion
  const pollUrl = prediction.urls?.get;
  if (!pollUrl) throw new Error('URL de polling manquante');

  while (true) {
    await new Promise(r => setTimeout(r, 2000));

    const pollRes = await fetch(pollUrl, {
      headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` }
    });

    const pollData = await pollRes.json();

    if (pollData.status === 'succeeded') {
      return JSON.parse(pollData.output);
    }

    if (pollData.status === 'failed' || pollData.status === 'canceled') {
      throw new Error(pollData.error || 'Prédiction échouée');
    }
    // 'starting' ou 'processing' → on continue
  }
};