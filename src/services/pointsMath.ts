/** Pure, deterministic progression math; no Firebase or UI dependencies. */
export function nextPointsAndLevel(current: number, delta: number): { totalPoints: number; level: number } {
  if (!Number.isSafeInteger(current) || !Number.isSafeInteger(delta)) {
    throw new Error('Số điểm không hợp lệ, chưa thể lưu thay đổi.');
  }
  const totalPoints = current + delta;
  if (!Number.isSafeInteger(totalPoints) || totalPoints < 0) {
    throw new Error('Không đủ sao để thực hiện thao tác này.');
  }
  return { totalPoints, level: Math.floor(totalPoints / 1000) + 1 };
}
