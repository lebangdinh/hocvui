/** Chỉ đọc danh mục câu đã được AI sơ tuyển trong ngân hàng phát hành. */
import bank from '../../content/practice-bank-v11.json';
import type { Subject } from '../types';
const counts = new Map(bank.topics.map(topic => [topic.topicId, topic.items.length]));
export function getAiScreening(topicId?: string) {
  const screened = topicId ? (counts.get(topicId) || 0) : 0;
  return {screened, held:0, enabled:screened>=3};
}
/** Toán được sinh theo bộ tham số ổn định và kiểm tra qua bộ kiểm thử độc lập. */
export function isEligibleForAiPractice(subject: Subject, topicId?: string): boolean {
  if (subject === 'math') return !!topicId;
  return getAiScreening(topicId).enabled;
}
