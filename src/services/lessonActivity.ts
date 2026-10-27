import type { Activity } from '../types';

/**
 * Firestore rejects nested undefined fields unless special SDK settings are
 * enabled. Keep a strict, serializable activity shape at the write boundary.
 * Never mutate the caller's data or drop an incorrect-answer record.
 */
export function prepareLessonActivity(activity: Activity): Activity {
  return {
    userId: activity.userId,
    profileId: activity.profileId,
    subject: activity.subject,
    score: activity.score,
    totalQuestions: activity.totalQuestions,
    grade: activity.grade,
    timestamp: activity.timestamp,
    ...(activity.wrongQuestions
      ? { wrongQuestions: activity.wrongQuestions.map(wrong => ({
          text: wrong.text,
          correctAnswer: wrong.correctAnswer,
          ...(wrong.topic !== undefined ? { topic: wrong.topic } : {}),
          ...(wrong.userAnswer !== undefined ? { userAnswer: wrong.userAnswer } : {})
        })) }
      : {}),
    ...(activity.topics !== undefined ? { topics: activity.topics } : {}),
    ...(activity.topicId !== undefined ? { topicId: activity.topicId } : {}),
    ...(activity.contentSource !== undefined ? { contentSource: activity.contentSource } : {})
  };
}
