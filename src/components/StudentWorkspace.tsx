import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  CloudOff,
  Flame,
  LayoutDashboard,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Users,
  Wifi,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  computeTopicMasteryMap,
  generateAdaptiveRecommendations,
} from '../domain/adaptiveEngine';
import {
  SAMPLE_LESSONS,
  SAMPLE_QUESTIONS,
  SUBJECT_METADATA,
} from '../domain/curriculum';
import {COPY} from '../domain/i18n';
import {createSyncEvent} from '../domain/syncLogic';
import type {
  AssessmentAttempt,
  GradeLevel,
  Language,
  Lesson,
  StudentProfile,
  SyncEvent,
  TeacherAssignment,
  TextScale,
  UserRole,
} from '../domain/types';
import {useBrowserOnline} from '../hooks/usePWA';
import {
  DEFAULT_DEMO_STUDENT_PROFILE,
  enqueueSyncEvent,
  getCachedLessons,
  getLocalAttempts,
  getLocalProfile,
  getSyncMeta,
  getPendingSyncQueue,
  removeLessonOffline,
  replaceLocalAttempts,
  resetDemoLocalStorageOnly,
  saveAttemptLocally,
  saveLessonOffline,
  saveLocalProfile,
  type CachedLessonRecord,
  type SyncMetaRecord,
} from '../storage/offlineDb';
import {flushSyncQueue} from '../storage/syncAdapter';
import {PWAInstallButton} from './PWAInstallButton';
import {AiTutorPanel} from './student/AiTutorPanel';
import {DiagnosticRunner} from './student/DiagnosticRunner';
import {LessonReader} from './student/LessonReader';
import {OfflineSyncInspector} from './student/OfflineSyncInspector';

type StudentTab =
  | 'dashboard'
  | 'diagnostic'
  | 'lessons'
  | 'tutor'
  | 'offline';

interface Props {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  textScale: TextScale;
  onChangeTextScale: (scale: TextScale) => void;
  simulateOffline: boolean;
  onToggleSimulateOffline: () => void;
  onSwitchRole: (role: UserRole) => void;
  onBackToLanding: () => void;
}

export const StudentWorkspace: React.FC<Props> = ({
  language,
  onChangeLanguage,
  textScale,
  onChangeTextScale,
  simulateOffline,
  onToggleSimulateOffline,
  onSwitchRole,
  onBackToLanding,
}) => {
  const t = COPY[language];
  const browserOnline = useBrowserOnline();
  const isEffectiveOnline = browserOnline && !simulateOffline;

  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const [profile, setProfile] = useState<StudentProfile>(
    DEFAULT_DEMO_STUDENT_PROFILE,
  );
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [cachedLessons, setCachedLessons] = useState<CachedLessonRecord[]>([]);
  const [pendingQueue, setPendingQueue] = useState<SyncEvent[]>([]);
  const [syncMeta, setSyncMeta] = useState<SyncMetaRecord>({
    lastSyncedAt: null,
    lastSyncError: null,
    totalSyncedEvents: 0,
  });

  const hydrateFromStorageAndServer = useCallback(async () => {
    setLoading(true);
    try {
      const [localProf, localCached, localQueue, localMeta] =
        await Promise.all([
          getLocalProfile(),
          getCachedLessons(),
          getPendingSyncQueue(),
          getSyncMeta(),
        ]);

      const localAtts = await getLocalAttempts(localProf.id);
      setProfile(localProf);
      setAttempts(localAtts);
      setCachedLessons(localCached);
      setPendingQueue(localQueue);
      setSyncMeta(localMeta);

      if (isEffectiveOnline) {
        const res = await fetch(
          `/api/student/${encodeURIComponent(localProf.id)}/state`,
        );
        if (res.ok) {
          const data = (await res.json()) as {
            profile: StudentProfile;
            attempts: AssessmentAttempt[];
            assignments: TeacherAssignment[];
          };
          // Merge local unsynced attempts with server attempts without losing offline data
          const mergedMap = new Map<string, AssessmentAttempt>();
          for (const a of data.attempts) mergedMap.set(a.id, a);
          for (const a of localAtts) mergedMap.set(a.id, a);
          const mergedAttempts = Array.from(mergedMap.values()).sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
          );

          setAssignments(data.assignments);
          setAttempts(mergedAttempts);
          await replaceLocalAttempts(localProf.id, mergedAttempts);

          // Preserve higher local points/completed lessons if unsynced
          if (localQueue.length === 0) {
            setProfile(data.profile);
            await saveLocalProfile(data.profile);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isEffectiveOnline]);

  useEffect(() => {
    void hydrateFromStorageAndServer();
  }, [hydrateFromStorageAndServer]);

  const handleSyncNow = useCallback(async () => {
    setSyncing(true);
    const outcome = await flushSyncQueue(isEffectiveOnline);
    const [nextQueue, nextMeta] = await Promise.all([
      getPendingSyncQueue(),
      getSyncMeta(),
    ]);
    setPendingQueue(nextQueue);
    setSyncMeta(nextMeta);
    setSyncing(false);

    if (outcome.ok && outcome.syncedCount > 0) {
      setStatusBanner(
        `Synchronised ${outcome.syncedCount} offline event(s) to classroom database.`,
      );
    } else if (!outcome.ok && outcome.error) {
      setStatusBanner(outcome.error);
    }
  }, [isEffectiveOnline]);

  // Auto-sync when connectivity returns and queue has items
  useEffect(() => {
    if (isEffectiveOnline && pendingQueue.length > 0 && !syncing) {
      void handleSyncNow();
    }
  }, [isEffectiveOnline, pendingQueue.length, syncing, handleSyncNow]);

  const masteryList = useMemo(
    () => computeTopicMasteryMap(attempts, SAMPLE_QUESTIONS),
    [attempts],
  );

  const recommendations = useMemo(
    () => generateAdaptiveRecommendations(masteryList, SAMPLE_LESSONS),
    [masteryList],
  );

  const subjectProgress = useMemo(() => {
    return (['mathematics', 'science', 'english'] as const).map((subId) => {
      const subMastery = masteryList.filter((m) => m.subject === subId);
      const avg =
        subMastery.length > 0
          ? Math.round(
              subMastery.reduce((sum, m) => sum + m.masteryScore, 0) /
                subMastery.length,
            )
          : 0;
      return {
        subject: subId,
        name: SUBJECT_METADATA[subId].name[language],
        mastery: avg,
        topicsAssessed: subMastery.length,
      };
    });
  }, [masteryList, language]);

  const handleReadAloud = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStatusBanner('Read-aloud speech synthesis is unavailable in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    if (speechActive) {
      setSpeechActive(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
    utter.rate = 0.95;
    utter.onend = () => setSpeechActive(false);
    utter.onerror = () => setSpeechActive(false);
    setSpeechActive(true);
    window.speechSynthesis.speak(utter);
  };

  const awardEarnedBadges = (
    currentProfile: StudentProfile,
    nextAttempts: AssessmentAttempt[],
    cachedCount: number,
    syncedOffline: boolean,
  ): StudentProfile => {
    const badges = new Set(currentProfile.earnedBadgeIds);
    if (nextAttempts.some((a) => a.mode === 'diagnostic')) {
      badges.add('badge-first-diagnostic');
    }
    if (cachedCount > 0) {
      badges.add('badge-offline-ready');
    }
    if (syncedOffline) {
      badges.add('badge-continuity-hero');
    }
    const nextMastery = computeTopicMasteryMap(nextAttempts, SAMPLE_QUESTIONS);
    if (nextMastery.some((m) => m.masteryScore >= 85)) {
      badges.add('badge-topic-master');
    }
    return {
      ...currentProfile,
      earnedBadgeIds: Array.from(badges),
    };
  };

  const handleCompleteAttempt = async (
    attempt: AssessmentAttempt,
    completedLessonId?: string,
  ) => {
    await saveAttemptLocally(attempt);
    const nextAttempts = [attempt, ...attempts];
    setAttempts(nextAttempts);

    const completedSet = new Set(profile.completedLessonIds);
    if (completedLessonId) completedSet.add(completedLessonId);

    const gainedPoints = Math.max(15, attempt.correctCount * 15);
    const updatedProfile = awardEarnedBadges(
      {
        ...profile,
        points: profile.points + gainedPoints,
        todayMinutes: profile.todayMinutes + 6,
        completedLessonIds: Array.from(completedSet),
      },
      nextAttempts,
      cachedLessons.length,
      false,
    );

    await saveLocalProfile(updatedProfile);
    setProfile(updatedProfile);

    const evt = createSyncEvent(profile.id, 'ASSESSMENT_COMPLETED', {
      attempt,
      profile: updatedProfile,
    });
    await enqueueSyncEvent(evt);
    const nextQueue = await getPendingSyncQueue();
    setPendingQueue(nextQueue);

    if (isEffectiveOnline) {
      const outcome = await flushSyncQueue(true);
      setPendingQueue(await getPendingSyncQueue());
      setSyncMeta(outcome.meta);
      if (outcome.ok && attempt.savedOffline) {
        const syncedProf = awardEarnedBadges(
          updatedProfile,
          nextAttempts,
          cachedLessons.length,
          true,
        );
        await saveLocalProfile(syncedProf);
        setProfile(syncedProf);
      }
    } else {
      setStatusBanner(
        'Saved locally to IndexedDB. Will sync automatically when internet returns.',
      );
    }
  };

  const handleDownloadOffline = async (lesson: Lesson) => {
    await saveLessonOffline(lesson);
    const updatedCached = await getCachedLessons();
    setCachedLessons(updatedCached);

    const updatedProfile = awardEarnedBadges(
      profile,
      attempts,
      updatedCached.length,
      false,
    );
    await saveLocalProfile(updatedProfile);
    setProfile(updatedProfile);
    setStatusBanner(`"${lesson.title.en}" saved to IndexedDB for offline use.`);
  };

  const handleRemoveOffline = async (lessonId: string) => {
    await removeLessonOffline(lessonId);
    setCachedLessons(await getCachedLessons());
  };

  const handleChangeGrade = async (nextGrade: GradeLevel) => {
    const nextProf = {...profile, grade: nextGrade};
    setProfile(nextProf);
    await saveLocalProfile(nextProf);
  };

  const handleResetDemo = async () => {
    await resetDemoLocalStorageOnly(profile.id);
    if (isEffectiveOnline) {
      await fetch('/api/student/reset-demo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({studentId: profile.id}),
      }).catch(() => {});
    }
    setActiveLessonId(null);
    setActiveTab('dashboard');
    await hydrateFromStorageAndServer();
    setStatusBanner('Demo student progress has been reset.');
  };

  const openLessonInReader = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveTab('lessons');
  };

  const scaleClass =
    textScale === 'sm'
      ? 'text-scale-sm'
      : textScale === 'lg'
        ? 'text-scale-lg'
        : 'text-scale-md';

  const navItems: Array<{
    id: StudentTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'diagnostic',
      label: t.diagnostic,
      icon: <ClipboardCheck className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'lessons',
      label: t.lessons,
      icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'tutor',
      label: t.aiTutor,
      icon: <Bot className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'offline',
      label: t.offlineSync,
      icon: <RefreshCw className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 ${scaleClass}`}>
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full border-b border-slate-800 bg-[#0A1128] text-white lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <button
              type="button"
              onClick={onBackToLanding}
              className="font-display text-base font-bold tracking-tight text-white hover:text-cyan-300"
            >
              LearnSphere AI
            </button>
            <span className="text-xs text-slate-400">Student Demo</span>
          </div>

          <nav
            aria-label="Student workspace sections"
            className="flex gap-1 overflow-x-auto p-3 lg:flex-col"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.id === 'offline' && pendingQueue.length > 0 && (
                    <span className="ml-auto font-mono text-xs text-amber-300 tabular-nums">
                      ({pendingQueue.length})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Accessibility & Role Controls in Sidebar Footer */}
          <div className="hidden space-y-4 border-t border-slate-800 p-4 text-xs text-slate-300 lg:block">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-slate-400">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                {t.textSize}
              </p>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-900 p-1">
                {(['sm', 'md', 'lg'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onChangeTextScale(sz)}
                    className={`rounded py-1 font-medium ${
                      textScale === sz
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : 'A+'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => onSwitchRole('teacher')}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-medium text-slate-200 hover:bg-slate-800"
              >
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {t.teacherRole}
              </button>
              <button
                type="button"
                onClick={() => void handleResetDemo()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {t.resetDemo}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Workspace Top Bar */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3.5">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-slate-900">
                {profile.name}
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <label htmlFor="grade-selector" className="sr-only">
                Select Grade
              </label>
              <select
                id="grade-selector"
                value={profile.grade}
                onChange={(e) =>
                  void handleChangeGrade(Number(e.target.value) as GradeLevel)
                }
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
              >
                <option value={6}>{t.gradeLabel} 6</option>
                <option value={7}>{t.gradeLabel} 7</option>
                <option value={8}>{t.gradeLabel} 8</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Connection Status + Toggle */}
              <button
                type="button"
                onClick={onToggleSimulateOffline}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isEffectiveOnline
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                {isEffectiveOnline ? (
                  <>
                    <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.onlineStatus}
                  </>
                ) : (
                  <>
                    <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.offlineStatus}
                  </>
                )}
              </button>

              {pendingQueue.length > 0 && isEffectiveOnline && (
                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => void handleSyncNow()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  Sync ({pendingQueue.length})
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  onChangeLanguage(language === 'en' ? 'kn' : 'en')
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
              </button>

              <PWAInstallButton variant="light" />

              <button
                type="button"
                onClick={() => onSwitchRole('teacher')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 lg:hidden whitespace-nowrap shrink-0"
              >
                Teacher View
              </button>
            </div>
          </header>

          {statusBanner && (
            <div className="flex items-center justify-between border-b border-blue-200 bg-blue-50 px-6 py-2.5 text-xs font-medium text-blue-900">
              <span>{statusBanner}</span>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="font-semibold text-blue-700 hover:text-blue-950"
              >
                Dismiss
              </button>
            </div>
          )}

          <main className="mx-auto w-full max-w-6xl flex-1 p-6">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                Loading local IndexedDB state...
              </div>
            ) : activeTab === 'dashboard' ? (
              <div className="space-y-6">
                {/* First-Time Student Experience Banner when no attempts yet */}
                {attempts.length === 0 && (
                  <div className="flex flex-col justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/70 p-6 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-semibold text-blue-700">
                        First-Time Guide · Step 1 of the Learning Loop
                      </p>
                      <h2 className="font-display mt-1 text-xl font-bold text-slate-900">
                        {t.welcomeBack}, {profile.name}
                      </h2>
                      <p className="mt-1.5 max-w-2xl text-sm text-slate-700">
                        Start with a short Mathematics diagnostic assessment.
                        Answer honestly—LearnSphere AI will identify weak topics,
                        explain why a lesson is recommended, and let you study
                        offline.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('diagnostic')}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0"
                    >
                      {t.startDiagnostic}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {/* 4 KPI Summary Row */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <span className="text-xs text-slate-500">
                      {t.learningStreak}
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <Flame
                        className="h-4 w-4 text-amber-600"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                        {profile.streakDays} days
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
                      {profile.points} pts earned
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <span className="text-xs text-slate-500">
                      {t.dailyGoal}
                    </span>
                    <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                      {profile.todayMinutes} / {profile.dailyGoalMinutes}m
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (profile.todayMinutes /
                                profile.dailyGoalMinutes) *
                                100,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <span className="text-xs text-slate-500">
                      Offline Library
                    </span>
                    <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                      {cachedLessons.length} saved
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Ready in IndexedDB
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <span className="text-xs text-slate-500">
                      {t.pendingOffline}
                    </span>
                    <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                      {pendingQueue.length}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 tabular-nums">
                      {syncMeta.lastSyncedAt
                        ? `Synced ${new Date(
                            syncMeta.lastSyncedAt,
                          ).toLocaleTimeString()}`
                        : t.neverSynced}
                    </p>
                  </div>
                </div>

                {/* Recommended Next Lesson + Subject Progress */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        {t.recommendedNext}
                      </h3>
                      <span className="text-xs font-medium text-blue-700">
                        Explainable Engine
                      </span>
                    </div>

                    {recommendations.length > 0 ? (
                      <div className="mt-4">
                        <h4 className="font-display text-lg font-bold text-slate-900">
                          {recommendations[0].lessonTitle}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          {recommendations[0].topicName} · Target:{' '}
                          <span className="capitalize font-semibold text-slate-700">
                            {recommendations[0].targetDifficulty}
                          </span>{' '}
                          · Mastery{' '}
                          <span className="font-mono tabular-nums">
                            {recommendations[0].masteryScore}%
                          </span>
                        </p>
                        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3.5 text-sm text-slate-800">
                          <span className="block text-xs font-semibold text-blue-800">
                            {t.whyRecommended}
                          </span>
                          <p className="mt-1">
                            {recommendations[0].explanation[language]}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              openLessonInReader(recommendations[0].lessonId)
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                          >
                            {t.openLesson}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('tutor')}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Ask AI Tutor
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 text-sm text-slate-600">
                        Complete a diagnostic quiz to generate personalised
                        lesson recommendations with transparent explanations.
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setActiveTab('diagnostic')}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Take Diagnostic Quiz
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subject-Wise Progress */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Subject-Wise Progress
                    </h3>
                    <div className="mt-4 space-y-4">
                      {subjectProgress.map((sp) => (
                        <div key={sp.subject}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-800">
                              {sp.name}
                            </span>
                            <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
                              {sp.topicsAssessed > 0
                                ? `${sp.mastery}% mastery`
                                : 'Not assessed'}
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-blue-600 transition-all"
                              style={{width: `${sp.mastery}%`}}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Topic Mastery Chart + Recent Quizzes & Teacher Assignments */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Topic Mastery Breakdown
                    </h3>
                    {masteryList.length === 0 ? (
                      <p className="mt-4 text-sm text-slate-500">
                        Your topic mastery bars will appear here immediately
                        after completing your first diagnostic or practice quiz.
                      </p>
                    ) : (
                      <div className="mt-4 h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={masteryList.map((m) => ({
                              topic: m.topicName,
                              mastery: m.masteryScore,
                            }))}
                            margin={{top: 10, right: 16, left: 24, bottom: 36}}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#E2E8F0"
                            />
                            <XAxis
                              dataKey="topic"
                              tick={{fontSize: 11, fill: '#475569'}}
                              interval={0}
                              angle={-12}
                              textAnchor="end"
                              height={54}
                            />
                            <YAxis
                              domain={[0, 100]}
                              width={36}
                              tick={{fontSize: 11, fill: '#475569'}}
                            />
                            <Tooltip />
                            <Bar
                              dataKey="mastery"
                              fill="#2563EB"
                              radius={[4, 4, 0, 0]}
                              isAnimationActive={false}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6 lg:col-span-5">
                    {/* Recent Quiz Results */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Recent Quiz Results
                      </h3>
                      {attempts.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                          No quizzes completed yet.
                        </p>
                      ) : (
                        <ul className="mt-3 divide-y divide-slate-100 text-sm">
                          {attempts.slice(0, 4).map((att) => (
                            <li
                              key={att.id}
                              className="flex items-center justify-between py-2.5"
                            >
                              <div>
                                <span className="font-medium capitalize text-slate-900">
                                  {att.subject} ({att.mode})
                                </span>
                                <p className="text-xs text-slate-500">
                                  {att.savedOffline
                                    ? 'Saved Offline'
                                    : 'Online'}
                                </p>
                              </div>
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                {att.scorePercent}%
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Teacher Assignments */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Teacher Assignments
                      </h3>
                      {assignments.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                          No active assignments from your teacher.
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-3 text-sm">
                          {assignments.slice(0, 3).map((asg) => {
                            const matchedLesson = SAMPLE_LESSONS.find(
                              (l) => l.topicId === asg.topicId,
                            );
                            return (
                              <li
                                key={asg.id}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-3.5"
                              >
                                <p className="font-semibold text-slate-900">
                                  {asg.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-600">
                                  {asg.note}
                                </p>
                                {matchedLesson && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openLessonInReader(matchedLesson.id)
                                    }
                                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                  >
                                    Open Assigned Lesson
                                    <ArrowRight
                                      className="h-3 w-3"
                                      aria-hidden="true"
                                    />
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Award
                      className="h-4 w-4 text-violet-600"
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-slate-900">
                      Earned Badges: {profile.earnedBadgeIds.length} / 4
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('offline')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Inspect Offline Queue & Badges
                  </button>
                </div>
              </div>
            ) : activeTab === 'diagnostic' ? (
              <DiagnosticRunner
                studentId={profile.id}
                grade={profile.grade}
                language={language}
                isEffectiveOnline={isEffectiveOnline}
                existingAttempts={attempts}
                onCompleteAttempt={(att) => handleCompleteAttempt(att)}
                onOpenLesson={openLessonInReader}
                onReadAloud={handleReadAloud}
              />
            ) : activeTab === 'lessons' ? (
              <LessonReader
                studentId={profile.id}
                grade={profile.grade}
                language={language}
                isEffectiveOnline={isEffectiveOnline}
                cachedLessons={cachedLessons}
                masteryList={masteryList}
                activeLessonId={activeLessonId}
                onSelectLesson={setActiveLessonId}
                onDownloadOffline={handleDownloadOffline}
                onRemoveOffline={handleRemoveOffline}
                onCompletePractice={(att, lessonId) =>
                  handleCompleteAttempt(att, lessonId)
                }
                onReadAloud={handleReadAloud}
              />
            ) : activeTab === 'tutor' ? (
              <AiTutorPanel
                grade={profile.grade}
                language={language}
                isEffectiveOnline={isEffectiveOnline}
                masteryList={masteryList}
                onReadAloud={handleReadAloud}
              />
            ) : (
              <OfflineSyncInspector
                language={language}
                isEffectiveOnline={isEffectiveOnline}
                simulateOffline={simulateOffline}
                onToggleSimulateOffline={onToggleSimulateOffline}
                cachedLessons={cachedLessons}
                pendingQueue={pendingQueue}
                syncMeta={syncMeta}
                syncing={syncing}
                onSyncNow={handleSyncNow}
                earnedBadgeIds={profile.earnedBadgeIds}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
