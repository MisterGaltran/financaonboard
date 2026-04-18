const FLAGS = {
  US: '🇺🇸', BR: '🇧🇷', CN: '🇨🇳', JP: '🇯🇵', DE: '🇩🇪', GB: '🇬🇧', FR: '🇫🇷',
  IT: '🇮🇹', ES: '🇪🇸', CA: '🇨🇦', AU: '🇦🇺', NZ: '🇳🇿', CH: '🇨🇭', IN: '🇮🇳',
  MX: '🇲🇽', RU: '🇷🇺', ZA: '🇿🇦', KR: '🇰🇷', SG: '🇸🇬', HK: '🇭🇰', AR: '🇦🇷',
  CL: '🇨🇱', CO: '🇨🇴', PE: '🇵🇪', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮',
  NL: '🇳🇱', BE: '🇧🇪', PT: '🇵🇹', PL: '🇵🇱', TR: '🇹🇷', IL: '🇮🇱', SA: '🇸🇦',
  AE: '🇦🇪', TW: '🇹🇼', TH: '🇹🇭', ID: '🇮🇩', MY: '🇲🇾', PH: '🇵🇭', VN: '🇻🇳',
  EU: '🇪🇺', IE: '🇮🇪', GR: '🇬🇷', CZ: '🇨🇿', HU: '🇭🇺', AT: '🇦🇹', MM: '🇲🇲'
};

export const flagFor = (code) => FLAGS[String(code || '').toUpperCase()] || '🏳️';
