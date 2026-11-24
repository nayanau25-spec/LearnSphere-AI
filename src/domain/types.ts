export type UserRole = 'student' | 'teacher';

export type Language = 'en' | 'kn';

export type TextScale = 'sm' | 'md' | 'lg';

export type SubjectId = 'mathematics' | 'science' | 'english';

export type GradeLevel = 6 | 7 | 8;

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LocalizedText {
  en: string;
  kn: string;
}

export interface Question {
  id: string;
  subject: SubjectId;
  grade: GradeLevel;
  topicId: string;
  topicName: LocalizedText;
  difficulty: DifficultyLevel;
  prompt: LocalizedText;
  options: LocalizedText[];
  correctIndex: number;
  explanation: LocalizedText;
  isSampleContent: true;
}

export interface LessonSection {
  heading: LocalizedText;
  body: LocalizedText;
  example?: LocalizedText;
}

export interface Lesson {
  id: string;
  subject: SubjectId;
  grade: GradeLevel;
  topicId: string;
  topicName: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  sections: LessonSection[];
  keyTakeaways: LocalizedText[];
  isSampleContent: true;
}

export interface AnsweredQuestion {
  questionId: string;
  topicId: string;
  difficulty: DifficultyLevel;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
}

export interface AssessmentAttempt {
  id: string;
  studentId: string;
  subject: SubjectId;
  grade: GradeLevel;
  mode: 'diagnostic' | 'practice';
  topicFilter?: string;
  answers: AnsweredQuestion[];
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  createdAt: string;
  savedOffline: boolean;
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  subject: SubjectId;
  masteryScore: number; // 0 to 100
  recentAccuracy: number; // 0 to 100
  cumulativeAccuracy: number; // 0 to 100
  difficultyWeightedAccuracy: number; // 0 to 100
  repeatWrongCount: number;
  attemptsCount: number;
  improvementDelta: number; // percentage points vs prior attempt
  recommendedDifficulty: DifficultyLevel;
  status: 'weak' | 'developing' | 'proficient' | 'mastered';
  lastUpdatedAt: string;
}

export type RecommendationAction =
  | 'foundation_lesson'
  | 'revision_practice'
  | 'challenge_advance'
  | 'mastered_skip';

export interface AdaptiveRecommendation {
  id: string;
  topicId: string;
  topicName: string;
  subject: SubjectId;
  lessonId: string;
  lessonTitle: string;
  action: RecommendationAction;
  targetDifficulty: DifficultyLevel;
  masteryScore: number;
  priority: number; // higher means more urgent
  explanation: LocalizedText;
  formulaBreakdown: {
    recentAccuracy: number;
    cumulativeAccuracy: number;
    difficultyWeightedAccuracy: number;
    repeatPenalty: number;
    finalMasteryScore: number;
  };
}

export type SyncEventType =
  | 'ASSESSMENT_COMPLETED'
  | 'LESSON_PROGRESS'
  | 'PROFILE_UPDATED';

export interface SyncEvent {
  eventId: string;
  studentId: string;
  type: SyncEventType;
  createdAt: string;
  payload: Record<string, unknown>;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  lastError?: string;
}

export interface AchievementBadge {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  earnedAt?: string;
  rule: string;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  targetStudentId: string | 'all';
  subject: SubjectId;
  topicId: string;
  title: string;
  note: string;
  createdAt: string;
  isDemoData?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: GradeLevel;
  schoolName: string;
  points: number;
  streakDays: number;
  dailyGoalMinutes: number;
  todayMinutes: number;
  completedLessonIds: string[];
  earnedBadgeIds: string[];
  isDemoUser: boolean;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'gemini' | 'rule_based_fallback';
  model?: string;
  reason?: string;
  language: Language;
  createdAt: string;
}
