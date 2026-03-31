export const callReplicate = async (input: object): Promise<any> => {
  // 1. Lance la prédiction via le proxy Vercel
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });

  const prediction = await res.json();
  if (!res.ok) throw new Error(prediction.detail || 'Erreur Replicate');

  const pollUrl = prediction.urls?.get;
  if (!pollUrl) throw new Error('URL de polling manquante');

  // 2. Poll via le proxy Vercel
  while (true) {
    await new Promise(r => setTimeout(r, 2000));

    const pollRes = await fetch(`/api/poll?url=${encodeURIComponent(pollUrl)}`);
    const pollData = await pollRes.json();

    if (pollData.status === 'succeeded') return JSON.parse(pollData.output);
    if (pollData.status === 'failed' || pollData.status === 'canceled') {
      throw new Error(pollData.error || 'Prédiction échouée');
    }
  }
};