import LegalPage from '../pages/Legalpage';

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      subtitle="Une question, un signalement ou une demande RGPD ? Nous vous répondons sous 72h."
      lastUpdated="Mars 2026"
      sections={[
        {
          title: '⚕️ Urgence médicale',
          warning: true,
          content: [
            'Si vous avez une urgence médicale, n\'utilisez PAS ce formulaire de contact.',
            'Appelez immédiatement le 15 (SAMU), le 18 (pompiers) ou le 112 (urgences européennes).',
            'HippocrateIA n\'est pas un service médical d\'urgence.',
          ],
        },
        {
          title: '📧 Contact général',
          content: [
            'Email : [TON EMAIL]',
            'Objet recommandé : précisez le motif (Support, Facturation, RGPD, Partenariat...)',
            'Délai de réponse : 72h ouvrées maximum',
          ],
        },
        {
          title: '🔒 Demandes RGPD',
          content: [
            'Pour toute demande relative à vos données personnelles (accès, rectification, suppression, portabilité), envoyez un email à : [TON EMAIL]',
            'Objet : "Demande RGPD — [type de demande]"',
            'Joignez une pièce d\'identité pour les demandes d\'accès ou de suppression.',
            'Délai de traitement : 30 jours maximum conformément au RGPD.',
            'En cas de non-réponse, vous pouvez saisir la CNIL : www.cnil.fr',
          ],
        },
        {
          title: '🐛 Signalement de bug ou problème de sécurité',
          content: [
            'Pour signaler un bug : [TON EMAIL] avec l\'objet "Bug — [description courte]"',
            'Pour signaler une faille de sécurité (responsible disclosure) : [TON EMAIL] avec l\'objet "Sécurité — CONFIDENTIEL"',
            'Merci de ne pas divulguer publiquement une faille avant résolution.',
          ],
        },
        {
          title: '💼 Partenariats et presse',
          content: [
            'Pour toute demande de partenariat, de collaboration ou de presse : [TON EMAIL]',
            'Objet : "Partenariat" ou "Presse"',
          ],
        },
      ]}
    />
  );
}