/**
 * Format a number as Algerian Dinar price string.
 * Example: 12000000 → "12 000 000 DA"
 */
export function formatPrice(value) {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toLocaleString('fr-FR').replace(/,/g, ' ') + ' DA';
}
