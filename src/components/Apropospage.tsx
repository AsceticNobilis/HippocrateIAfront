import LegalPage from '../pages/Legalpage';
import { useTranslation } from '../lib/useTranslation';

export default function AProposPage() {
  const { tr } = useTranslation();
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <LegalPage
      isDarkMode={isDarkMode}
      title={tr('aboutTitle')}
      subtitle={tr('aboutSubtitle')}
      lastUpdated={tr('lastUpdatedDate')}
      sections={[
        {
          title: tr('aboutMedicalCommitmentTitle'),
          warning: true,
          content: [
            tr('aboutMedicalCommitment1'),
            tr('aboutMedicalCommitment2'),
            tr('aboutMedicalCommitment3'),
          ],
        },
        { title: tr('aboutMissionTitle'),   content: tr('aboutMissionContent') },
        { title: tr('aboutTechTitle'),      content: [tr('aboutTech1'), tr('aboutTech2'), tr('aboutTech3'), tr('aboutTech4')] },
        { title: tr('aboutRegulatoryTitle'), content: [tr('aboutRegulatory1'), tr('aboutRegulatory2'), tr('aboutRegulatory3'), tr('aboutRegulatory4')] },
        { title: tr('aboutAudienceTitle'),  content: [tr('aboutAudience1'), tr('aboutAudience2'), tr('aboutAudience3'), tr('aboutAudience4')] },
        { title: tr('aboutContactTitle'),   content: [tr('aboutContactEmail'), tr('aboutContactDesc')] },
      ]}
    />
  );
}