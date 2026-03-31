import LegalPage from '../pages/Legalpage';

export default function CGUPage() {
  return (
    <LegalPage
      title="Conditions Générales d'Utilisation"
      subtitle="En utilisant HippocrateIA, vous acceptez les présentes conditions dans leur intégralité."
      lastUpdated="Mars 2026"
      sections={[
        {
          title: '⚕️ Avertissement médical — À lire impérativement',
          warning: true,
          content: [
            'HippocrateIA est un outil d\'aide à la compréhension médicale à usage ÉDUCATIF et INFORMATIF uniquement.',
            'HippocrateIA NE pose PAS de diagnostic médical.',
            'HippocrateIA NE prescrit PAS de traitement ou médicament.',
            'HippocrateIA NE remplace PAS une consultation médicale auprès d\'un professionnel de santé diplômé.',
            'Les réponses générées par l\'IA peuvent contenir des inexactitudes ou être incomplètes — elles ne constituent jamais un avis médical professionnel.',
            'En cas de doute sur votre santé, consultez toujours un médecin. En cas d\'urgence : appelez le 15, le 18 ou le 112.',
            'L\'utilisation de HippocrateIA à des fins de diagnostic ou de traitement médical est expressément interdite et engage la seule responsabilité de l\'utilisateur.',
          ],
        },
        {
          title: '1. Présentation du service',
          content: 'HippocrateIA est une application web d\'assistance médicale informative basée sur l\'intelligence artificielle, éditée par [TON NOM] [TON PRÉNOM], auto-entrepreneur. Le service propose un assistant conversationnel pour aider les étudiants en médecine et les professionnels de santé à comprendre des concepts médicaux, générer des QCM d\'entraînement, et analyser des documents médicaux à des fins pédagogiques.',
        },
        {
          title: '2. Accès au service',
          content: [
            'L\'accès à HippocrateIA nécessite la création d\'un compte avec une adresse email valide ou via Google.',
            'L\'utilisateur doit avoir au moins 18 ans ou être un professionnel de santé en formation.',
            'Le compte est strictement personnel et non transférable.',
            'L\'éditeur se réserve le droit de suspendre tout compte en cas de violation des présentes CGU.',
            'L\'offre gratuite est limitée à 10 prompts par session. L\'offre Premium donne accès à des prompts illimités.',
          ],
        },
        {
          title: '3. Abonnement Premium',
          content: [
            'L\'abonnement Premium est proposé au prix de 9,99€/mois TTC.',
            'Le paiement est prélevé mensuellement via Stripe.',
            'L\'abonnement est résiliable à tout moment depuis votre compte — l\'accès Premium reste actif jusqu\'à la fin de la période en cours.',
            'Conformément à l\'article L221-28 du Code de la consommation, le droit de rétractation de 14 jours ne s\'applique pas aux contenus numériques délivrés immédiatement avec accord de l\'utilisateur.',
            'En cas de litige de facturation, contactez : [TON EMAIL]',
          ],
        },
        {
          title: '4. Utilisation acceptable',
          content: [
            'HippocrateIA est réservé à un usage légal, éducatif et professionnel.',
            'Il est interdit d\'utiliser HippocrateIA pour obtenir des conseils médicaux personnels en lieu et place d\'une consultation médicale.',
            'Il est interdit de tenter de contourner les limitations du service ou d\'accéder aux systèmes informatiques de manière non autorisée.',
            'Il est interdit de reproduire, revendre ou exploiter commercialement le contenu généré par HippocrateIA.',
            'L\'utilisateur s\'engage à ne pas soumettre de données personnelles de tiers sans leur consentement.',
          ],
        },
        {
          title: '5. Limitation de responsabilité',
          content: [
            'L\'éditeur ne garantit pas l\'exactitude, l\'exhaustivité ou l\'actualité des informations fournies par HippocrateIA.',
            'L\'éditeur ne saurait être tenu responsable de tout dommage (direct, indirect, corporel, matériel) résultant de l\'utilisation ou de l\'impossibilité d\'utiliser le service.',
            'L\'éditeur ne saurait être tenu responsable de décisions médicales prises sur la base des réponses de HippocrateIA.',
            'La responsabilité de l\'éditeur est limitée au montant des sommes versées par l\'utilisateur au cours des 3 derniers mois.',
          ],
        },
        {
          title: '6. Propriété intellectuelle',
          content: 'L\'ensemble des éléments de HippocrateIA (interface, code, avatars, base de données médicale) est la propriété exclusive de l\'éditeur et protégé par le droit d\'auteur français et les conventions internationales. Le contenu généré par l\'IA est mis à disposition de l\'utilisateur pour un usage personnel et non commercial uniquement.',
        },
        {
          title: '7. Modification des CGU',
          content: 'L\'éditeur se réserve le droit de modifier les présentes CGU à tout moment. L\'utilisateur sera informé par email ou notification dans l\'application. La poursuite de l\'utilisation du service après modification vaut acceptation des nouvelles CGU.',
        },
        {
          title: '8. Droit applicable et juridiction',
          content: 'Les présentes CGU sont régies par le droit français. En cas de litige, les parties s\'efforceront de trouver une solution amiable. À défaut, les tribunaux français seront seuls compétents.',
        },
      ]}
    />
  );
}