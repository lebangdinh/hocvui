/** Compact visual aids for comparing numbers in primary-school math.
 * Only numbers up to 20 use one dot per unit. Larger numbers use digit
 * positions, so a five-digit number never creates thousands of DOM nodes.
 */
export type ComparisonVisual = {
  display: string;
  digits: string[];
  digitCount: number;
  dots: number;
  useDots: boolean;
};

export function getComparisonVisual(raw: string): ComparisonVisual | null {
  if (!/^\d{1,12}$/.test(raw)) return null;
  const number = Number(raw);
  if (!Number.isSafeInteger(number) || number < 0) return null;
  const digits = String(number).split('');
  return {
    display: number.toLocaleString('vi-VN'),
    digits,
    digitCount: digits.length,
    dots: number <= 20 ? number : 0,
    useDots: number <= 20
  };
}
