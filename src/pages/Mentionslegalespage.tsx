import LegalPage from './Legalpage';

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      subtitle="Conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN)"
      lastUpdated="Mars 2026"
      sections={[
        {
          title: '⚕️ Avertissement médical important',
          warning: true,
          content: [
            'HippocrateIA est un outil d\'aide à la compréhension médicale à usage éducatif et informatif uniquement.',
            'HippocrateIA ne constitue en aucun cas un acte médical, un diagnostic, une prescription ou un traitement.',
            'HippocrateIA ne remplace pas l\'avis d\'un médecin, d\'un professionnel de santé qualifié ou d\'une consultation médicale.',
            'En cas d\'urgence médicale, appelez immédiatement le 15 (SAMU), le 18 (pompiers) ou le 112 (numéro européen d\'urgence).',
            'Les informations fournies par HippocrateIA peuvent contenir des erreurs et ne doivent jamais être utilisées pour prendre des décisions médicales sans l\'avis d\'un professionnel.',
          ],
        },
        {
          title: '1. Éditeur du site',
          content: [
            'Nom : [TON NOM] [TON PRÉNOM]',
            'Statut : Auto-entrepreneur',
            'Adresse : [TON ADRESSE]',
            'Email : [TON EMAIL]',
            'Numéro SIRET : [TON NUMÉRO SIRET]',
          ],
        },
        {
          title: '2. Hébergement',
          content: [
            'Le site HippocrateIA est hébergé par :',
            'Supabase Inc. — 970 Toa Payoh North, Singapour (base de données et authentification)',
            'Le modèle d\'intelligence artificielle est hébergé sur un serveur dédié dont les détails techniques sont disponibles sur demande.',
            'Les paiements sont traités par Stripe Inc. — 354 Oyster Point Blvd, South San Francisco, CA 94080, USA.',
          ],
        },
        {
          title: '3. Propriété intellectuelle',
          content: 'L\'ensemble du contenu de HippocrateIA (textes, graphismes, logiciels, avatars, interfaces) est protégé par le droit d\'auteur. Toute reproduction, représentation ou diffusion, en tout ou partie, est interdite sans autorisation écrite préalable de l\'éditeur.',
        },
        {
          title: '4. Responsabilité',
          content: [
            'L\'éditeur s\'efforce d\'assurer l\'exactitude des informations diffusées sur HippocrateIA, mais ne peut garantir leur exhaustivité ou leur mise à jour.',
            'L\'éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l\'utilisation des informations fournies par l\'outil.',
            'L\'utilisateur reconnaît utiliser HippocrateIA sous sa seule et entière responsabilité.',
            'HippocrateIA n\'est pas certifié comme dispositif médical au sens du règlement européen MDR 2017/745 et de l\'AI Act 2024, et ne prétend pas l\'être.',
          ],
        },
        {
          title: '5. Droit applicable',
          content: 'Le présent site est soumis au droit français. Tout litige relatif à son utilisation sera soumis à la compétence exclusive des tribunaux français.',
        },
      ]}
    />
  );
}