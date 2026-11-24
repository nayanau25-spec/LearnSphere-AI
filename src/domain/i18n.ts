import type {Language} from './types';

export interface Translations {
  brand: string;
  tagline: string;
  navHowItWorks: string;
  navDifferentiators: string;
  navOfflineSync: string;
  navEducators: string;
  ctaStartLearning: string;
  ctaExploreHow: string;
  heroHeadline: string;
  heroSubtitle: string;
  studentRole: string;
  teacherRole: string;
  dashboard: string;
  diagnostic: string;
  lessons: string;
  aiTutor: string;
  offlineSync: string;
  teacherInsights: string;
  welcomeBack: string;
  gradeLabel: string;
  learningStreak: string;
  dailyGoal: string;
  pendingOffline: string;
  syncNow: string;
  onlineStatus: string;
  offlineStatus: string;
  simulateOffline: string;
  goOnline: string;
  lastSynced: string;
  neverSynced: string;
  recommendedNext: string;
  whyRecommended: string;
  openLesson: string;
  startDiagnostic: string;
  downloadOffline: string;
  savedOffline: string;
  removeOffline: string;
  readAloud: string;
  stopReading: string;
  textSize: string;
  languageLabel: string;
  resetDemo: string;
  switchRole: string;
  backToLanding: string;
  sampleContentNote: string;
}

export const COPY: Record<Language, Translations> = {
  en: {
    brand: 'LearnSphere AI',
    tagline: 'Learn Anywhere. Grow Everywhere.',
    navHowItWorks: 'How It Works',
    navDifferentiators: 'Why LearnSphere',
    navOfflineSync: 'Offline Sync',
    navEducators: 'For Teachers',
    ctaStartLearning: 'Start Learning',
    ctaExploreHow: 'Explore How It Works',
    heroHeadline: 'Learning Should Never Stop When the Internet Does.',
    heroSubtitle:
      'LearnSphere AI brings personalised, adaptive learning to students in low-connectivity communities—helping every learner progress, online or offline.',
    studentRole: 'Student Workspace',
    teacherRole: 'Teacher Insights',
    dashboard: 'Dashboard',
    diagnostic: 'Diagnostic Quiz',
    lessons: 'Offline Library',
    aiTutor: 'AI Tutor',
    offlineSync: 'Offline & Sync',
    teacherInsights: 'Class Insights',
    welcomeBack: 'Welcome back',
    gradeLabel: 'Grade',
    learningStreak: 'Learning Streak',
    dailyGoal: 'Daily Goal',
    pendingOffline: 'Pending Sync Events',
    syncNow: 'Sync Now',
    onlineStatus: 'Online · Sync Ready',
    offlineStatus: 'Offline Mode · Saving Locally',
    simulateOffline: 'Simulate Offline',
    goOnline: 'Restore Connection',
    lastSynced: 'Last synced',
    neverSynced: 'Not synced yet',
    recommendedNext: 'Recommended Next Step',
    whyRecommended: 'Why this was recommended',
    openLesson: 'Open Lesson',
    startDiagnostic: 'Start Diagnostic Assessment',
    downloadOffline: 'Save for Offline',
    savedOffline: 'Saved Offline',
    removeOffline: 'Remove Local Copy',
    readAloud: 'Read Aloud',
    stopReading: 'Stop Reading',
    textSize: 'Text Size',
    languageLabel: 'Language',
    resetDemo: 'Reset Demo Data',
    switchRole: 'Switch Role',
    backToLanding: 'Home',
    sampleContentNote:
      'Sample educational curriculum content (Grades 6–8) for demonstration.',
  },
  kn: {
    brand: 'LearnSphere AI',
    tagline: 'ಎಲ್ಲಿಯಾದರೂ ಕಲಿಯಿರಿ. ಎಲ್ಲೆಡೆ ಬೆಳೆಯಿರಿ.',
    navHowItWorks: 'ಕಾರ್ಯವಿಧಾನ',
    navDifferentiators: 'ವಿಶೇಷತೆಗಳು',
    navOfflineSync: 'ಆಫ್‌ಲೈನ್ ಸಿಂಕ್',
    navEducators: 'ಶಿಕ್ಷಕರಿಗಾಗಿ',
    ctaStartLearning: 'ಕಲಿಕೆ ಆರಂಭಿಸಿ',
    ctaExploreHow: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ನೋಡಿ',
    heroHeadline: 'ಇಂಟರ್ನೆಟ್ ನಿಂತಾಗಲೂ ಕಲಿಕೆ ನಿಲ್ಲಬಾರದು.',
    heroSubtitle:
      'ಕಡಿಮೆ ನೆಟ್‌ವರ್ಕ್ ಇರುವ ಗ್ರಾಮೀಣ ಶಾಲಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಆಫ್‌ಲೈನ್ ಮತ್ತು ಆನ್‌ಲೈನ್ ಎರಡರಲ್ಲೂ ವೈಯಕ್ತಿಕ ಕಲಿಕೆಯ ಮಾರ್ಗದರ್ಶನ.',
    studentRole: 'ವಿದ್ಯಾರ್ಥಿ ವಿಭಾಗ',
    teacherRole: 'ಶಿಕ್ಷಕರ ವಿಭಾಗ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    diagnostic: 'ಪರೀಕ್ಷೆ',
    lessons: 'ಆಫ್‌ಲೈನ್ ಪಾಠಗಳು',
    aiTutor: 'ಎಐ ಶಿಕ್ಷಕ',
    offlineSync: 'ಆಫ್‌ಲೈನ್ ಮತ್ತು ಸಿಂಕ್',
    teacherInsights: 'ತರಗತಿ ವರದಿ',
    welcomeBack: 'ಮತ್ತೆ ಸ್ವಾಗತ',
    gradeLabel: 'ತರಗತಿ',
    learningStreak: 'ಕಲಿಕೆಯ ಸರಣಿ',
    dailyGoal: 'ದೈನಂದಿನ ಗುರಿ',
    pendingOffline: 'ಬಾಕಿ ಇರುವ ಸಿಂಕ್',
    syncNow: 'ಈಗ ಸಿಂಕ್ ಮಾಡಿ',
    onlineStatus: 'ಆನ್‌ಲೈನ್ · ಸಿಂಕ್ ಸಿದ್ಧವಾಗಿದೆ',
    offlineStatus: 'ಆಫ್‌ಲೈನ್ · ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗುತ್ತಿದೆ',
    simulateOffline: 'ಆಫ್‌ಲೈನ್ ಪರೀಕ್ಷಿಸಿ',
    goOnline: 'ಸಂಪರ್ಕ ಮರುಸ್ಥಾಪಿಸಿ',
    lastSynced: 'ಕೊನೆಯ ಸಿಂಕ್',
    neverSynced: 'ಇನ್ನೂ ಸಿಂಕ್ ಆಗಿಲ್ಲ',
    recommendedNext: 'ಮುಂದಿನ ಶಿಫಾರಸು ಮಾಡಿದ ಪಾಠ',
    whyRecommended: 'ಈ ಶಿಫಾರಸಿಗೆ ಕಾರಣ',
    openLesson: 'ಪಾಠ ತೆರೆಯಿರಿ',
    startDiagnostic: 'ಮೌಲ್ಯಮಾಪನ ಪರೀಕ್ಷೆ ಆರಂಭಿಸಿ',
    downloadOffline: 'ಆಫ್‌ಲೈನ್‌ಗಾಗಿ ಉಳಿಸಿ',
    savedOffline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
    removeOffline: 'ಸ್ಥಳೀಯ ಪ್ರತಿ ತೆಗೆಯಿರಿ',
    readAloud: 'ಗಟ್ಟಿಯಾಗಿ ಓದಿ',
    stopReading: 'ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    textSize: 'ಅಕ್ಷರದ ಗಾತ್ರ',
    languageLabel: 'ಭಾಷೆ',
    resetDemo: 'ಡೆಮೊ ಡೇಟಾ ಮರುಹೊಂದಿಸಿ',
    switchRole: 'ಪಾತ್ರ ಬದಲಿಸಿ',
    backToLanding: 'ಮುಖಪುಟ',
    sampleContentNote: 'ಪ್ರದರ್ಶನಕ್ಕಾಗಿ ಮಾದರಿ ಶಾಲಾ ಪಠ್ಯಕ್ರಮ (6–8ನೇ ತರಗತಿ).',
  },
};
