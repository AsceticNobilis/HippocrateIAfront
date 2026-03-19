interface AdBannerProps {
  isDarkMode: boolean;
}

export default function AdBanner({ isDarkMode }: AdBannerProps) {
  return (
    <div className={`border rounded-lg p-4 text-center mx-4 my-2 ${
      isDarkMode
        ? 'bg-[#2a2a2d] border-[#3a3a3d]'
        : 'bg-white border-[#e0e0e0]'
    }`}>
      <div className={`text-xs mb-1 ${isDarkMode ? 'text-[#6e6e73]' : 'text-[#aaaaaa]'}`}>
        PUBLICITÉ
      </div>
      <div className={`text-sm ${isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]'}`}>
        Espace publicitaire - 728x90
      </div>
    </div>
  );
}