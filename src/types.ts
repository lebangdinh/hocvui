import type { Timestamp } from 'firebase/firestore';

export type Subject = 'math' | 'vietnamese' | 'english' | 'ethics' | 'nature' | 'science' | 'history_geo' | 'it' | 'physical' | 'arts' | 'experiential';

export interface UserProfile {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  grade: number;
  totalPoints: number;
  subjectPoints?: Record<Subject, number>;
  level: number;
  createdAt: string;
  badges?: string[];
  favoriteBadge?: string;
  deletedAt?: Timestamp;
  deleteAfter?: Timestamp;
}

export interface Activity {
  id?: string;
  userId: string;
  profileId?: string;
  subject: Subject;
  score: number;
  totalQuestions: number;
  grade: number;
  timestamp: string;
  wrongQuestions?: {
    text: string;
    topic?: string;
    userAnswer?: string;
    correctAnswer: string;
  }[];
  topics?: string[];
  topicId?: string;
  contentSource?: 'reviewed' | 'bank' | 'ai';
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic?: string;
  hint?: string;
}
