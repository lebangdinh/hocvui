/** Editorial review gate. No teacher approvals ship with V3 by default.
 * A public browser cannot confer a teacher/admin role; editorial approval is
 * performed offline and committed as a controlled content release. */
import type { Subject } from '../types';
import reviewQueue from '../../content/alignment-review-queue.json';
import fingerprint from '../../content/bank-fingerprint.json';

export interface ReviewSummary {
  status: 'approved' | 'pending';
  label: string;
  reviewer?: string;
  reviewedAt?: string;
  bookUnit?: string;
  bookLesson?: string;
  tocUrl?: string;
  tocStatus: string;
  outcomeDraft?: string;
  outcomeSource?: string;
  outcomeVerification?: string;
  note?: string;
}

export function getTopicReview(grade: number, subject: Subject, topicId?: string): ReviewSummary {
  const rec = reviewQueue.items.find(r => r.grade === grade && r.subject === subject && r.topicId === topicId);
  if (!rec) return { status: 'pending', label: 'Chưa lập hồ sơ thẩm định', tocStatus: 'not_checked' };
  // V4 requires a LIVE approval in Firebase; this local queue is informational only.
  const approved = false;
  return {
    status: approved ? 'approved' : 'pending',
    label: 'Chờ kiểm duyệt trên Firebase / kiểm tra hồ sơ hiện hành',
    reviewer: approved ? rec.reviewer! : undefined,
    reviewedAt: approved ? rec.reviewDate! : undefined,
    bookUnit: rec.sgkUnit || undefined,
    bookLesson: rec.sgkLesson || undefined,
    tocUrl: rec.sgkEvidence?.url,
    tocStatus: rec.sgkTocVerification || 'not_checked',
    outcomeDraft: rec.yccdTextDraft || undefined,
    outcomeSource: rec.yccdEvidence?.url || undefined,
    outcomeVerification: rec.yccdVerification || 'not_checked',
    note: rec.alignmentNote || undefined
  };
}

export function isTopicApproved(grade: number, subject: Subject, topicId?: string): boolean {
  return getTopicReview(grade, subject, topicId).status === 'approved';
}
