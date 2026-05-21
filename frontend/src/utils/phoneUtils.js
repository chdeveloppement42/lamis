export const normalizePhoneNumber = (value) => {
  const compact = String(value || '').replace(/[\s().-]/g, '');

  if (!compact) return '';
  if (compact.startsWith('00')) return `+${compact.slice(2)}`;
  if (compact.startsWith('+')) return compact;
  if (compact.startsWith('213')) return `+${compact}`;
  if (compact.startsWith('0')) return `+213${compact.slice(1)}`;

  return compact;
};

export const getPhoneError = (value) => {
  const normalized = normalizePhoneNumber(value);

  if (!normalized) return 'Téléphone requis';
  if (!normalized.startsWith('+')) {
    return 'Ajoutez l’indicatif pays, ex: +213555000000 ou +33123456789';
  }
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    return 'Numéro invalide. Utilisez le format international avec indicatif pays.';
  }
  if (normalized.startsWith('+213') && !/^\+213[1-9]\d{8}$/.test(normalized)) {
    return 'Numéro algérien invalide. Exemple: +213555000000';
  }

  return '';
};
