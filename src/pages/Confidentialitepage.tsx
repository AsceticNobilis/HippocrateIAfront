import LegalPage from '../pages/Legalpage';

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      subtitle="Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679)"
      lastUpdated="Mars 2026"
      sections={[
        {
          title: '⚕️ Rappel médical',
          warning: true,
          content: [
            'HippocrateIA est un outil informatif et éducatif uniquement — pas un outil de diagnostic médical.',
            'Ne partagez jamais d\'informations personnelles de santé sensibles dans vos conversations avec HippocrateIA.',
            'Vos conversations sont stockées uniquement pour améliorer votre expérience et ne sont pas utilisées à des fins médicales.',
          ],
        },
        {
          title: '1. Responsable du traitement',
          content: [
            'Responsable : [TON NOM] [TON PRÉNOM], Auto-entrepreneur',
            'Email DPO / contact RGPD : [TON EMAIL]',
            'Adresse : [TON ADRESSE]',
          ],
        },
        {
          title: '2. Données collectées',
          content: [
            'Données d\'identification : adresse email, nom d\'affichage (pseudo)',
            'Données de connexion : fournisseur d\'authentification (email/mot de passe ou Google), date de dernière connexion',
            'Données de personnalisation : choix d\'avatar, préférences d\'affichage',
            'Données de conversation : historique des messages échangés avec HippocrateIA (stockés dans votre compte)',
            'Données de paiement : traitées directement par Stripe — HippocrateIA ne stocke aucune donnée bancaire',
            'Données techniques : logs de connexion, adresse IP (gérés par Supabase)',
          ],
        },
        {
          title: '3. Finalités du traitement',
          content: [
            'Fourniture du service HippocrateIA et gestion de votre compte',
            'Authentification et sécurisation de votre accès',
            'Gestion des abonnements Premium via Stripe',
            'Sauvegarde de votre historique de conversations',
            'Amélioration du service (statistiques agrégées et anonymisées uniquement)',
            'Respect des obligations légales',
          ],
        },
        {
          title: '4. Base légale des traitements',
          content: [
            'Exécution du contrat (CGU) : fourniture du service, gestion du compte et de l\'abonnement',
            'Intérêt légitime : sécurité du service, prévention des abus',
            'Consentement : données de personnalisation (avatar, préférences)',
            'Obligation légale : conservation des données de facturation',
          ],
        },
        {
          title: '5. Durée de conservation',
          content: [
            'Données de compte : conservées pendant toute la durée de vie du compte, puis supprimées dans les 30 jours suivant la demande de suppression',
            'Historique des conversations : conservé tant que le compte est actif',
            'Données de facturation : 10 ans (obligation comptable légale)',
            'Logs techniques : 12 mois maximum',
          ],
        },
        {
          title: '6. Destinataires des données',
          content: [
            'Supabase Inc. (hébergement, authentification, base de données) — serveurs en Europe disponibles',
            'Stripe Inc. (paiements) — certifié PCI DSS niveau 1',
            'Aucune vente ou transmission de vos données à des tiers à des fins commerciales',
            'Aucune utilisation de vos données pour entraîner des modèles d\'IA tiers',
          ],
        },
        {
          title: '7. Vos droits (RGPD)',
          content: [
            'Droit d\'accès : obtenir une copie de vos données personnelles',
            'Droit de rectification : corriger des données inexactes',
            'Droit à l\'effacement : demander la suppression de votre compte et de vos données',
            'Droit à la portabilité : recevoir vos données dans un format structuré',
            'Droit d\'opposition : vous opposer à certains traitements',
            'Droit de limitation : demander la suspension temporaire d\'un traitement',
            'Pour exercer vos droits : [TON EMAIL] — réponse sous 30 jours',
            'Réclamation possible auprès de la CNIL : www.cnil.fr',
          ],
        },
        {
          title: '8. Cookies',
          content: [
            'HippocrateIA utilise uniquement des cookies strictement nécessaires au fonctionnement du service (session d\'authentification Supabase).',
            'Aucun cookie publicitaire ou de tracking tiers n\'est utilisé.',
            'Aucune régie publicitaire n\'est présente sur HippocrateIA.',
          ],
        },
        {
          title: '9. Sécurité',
          content: 'Les données sont transmises via HTTPS (chiffrement TLS). L\'authentification est gérée par Supabase avec chiffrement des mots de passe (bcrypt). Les données de paiement sont traitées directement par Stripe et ne transitent jamais par nos serveurs.',
        },
      ]}
    />
  );
}