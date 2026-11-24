import React, {Suspense, lazy, useState} from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  HardDriveDownload,
  RefreshCw,
  ShieldCheck,
  Users,
  WifiOff,
} from 'lucide-react';
import {COPY} from '../domain/i18n';
import {SUBJECT_METADATA} from '../domain/curriculum';
import type {Language, UserRole} from '../domain/types';
import {PWAInstallButton} from './PWAInstallButton';

const LearningUniverse3D = lazy(() =>
  import('./LearningUniverse3D').then((m) => ({default: m.LearningUniverse3D})),
);

interface Props {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  liteMode: boolean;
  onToggleLiteMode: () => void;
  onEnterDemo: (role: UserRole) => void;
}

const LOOP_STEPS = [
  {
    num: '01',
    title: 'Assess',
    detail:
      'Complete a focused multi-topic diagnostic check in Mathematics, Science, or English—even on a basic phone.',
  },
  {
    num: '02',
    title: 'Understand',
    detail:
      'See exact topic-wise accuracy and pinpoint specific concepts needing reinforcement instead of a single opaque score.',
  },
  {
    num: '03',
    title: 'Adapt',
    detail:
      'Our explainable rule-based engine adjusts target difficulty and shows why a lesson is recommended.',
  },
  {
    num: '04',
    title: 'Learn',
    detail:
      'Study structured, bilingual (English and Kannada) lessons with relatable rural examples and read-aloud support.',
  },
  {
    num: '05',
    title: 'Practise',
    detail:
      'Solve targeted practice questions matched to your current level—stepping up only after demonstrating understanding.',
  },
  {
    num: '06',
    title: 'Save Offline',
    detail:
      'Every downloaded lesson and quiz result is persisted immediately in local IndexedDB storage without needing internet.',
  },
  {
    num: '07',
    title: 'Sync',
    detail:
      'When connectivity returns, idempotent events with unique event IDs sync reliably to the school server without duplicates.',
  },
  {
    num: '08',
    title: 'Improve',
    detail:
      'Teachers review updated weak-topic reports and assign targeted follow-up exercises to support every student.',
  },
];

const COMPARISON_ROWS = [
  {
    dimension: 'When Internet Drops',
    conventional: 'Videos buffer, quizzes fail to submit, progress is lost.',
    learnsphere:
      'Cached lessons and quizzes run locally in IndexedDB; zero progress is lost.',
  },
  {
    dimension: 'Content Pacing',
    conventional: 'Every student in a grade gets the exact same static sequence.',
    learnsphere:
      'Difficulty and lesson sequence adapt based on per-topic mastery and repeat mistakes.',
  },
  {
    dimension: 'Recommendation Transparency',
    conventional: 'Opaque "next up" lists with no explanation for students.',
    learnsphere:
      'Shows exact accuracy, mastery score, and plain-language reason for every suggestion.',
  },
  {
    dimension: 'Teacher Visibility',
    conventional: 'Requires constant live connection to view student activity.',
    learnsphere:
      'Queued offline events sync upon reconnection so teachers spot weak topics accurately.',
  },
];

export const LandingPage: React.FC<Props> = ({
  language,
  onChangeLanguage,
  liteMode,
  onToggleLiteMode,
  onEnterDemo,
}) => {
  const t = COPY[language];
  const [activeLoopIdx, setActiveLoopIdx] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0A1128] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            {t.brand}
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex"
          >
            <a
              href="#how-it-works"
              className="transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              {t.navHowItWorks}
            </a>
            <a
              href="#differentiators"
              className="transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              {t.navDifferentiators}
            </a>
            <a
              href="#offline-architecture"
              className="transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              {t.navOfflineSync}
            </a>
            <a
              href="#educators"
              className="transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              {t.navEducators}
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onEnterDemo('student')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 whitespace-nowrap shrink-0"
            >
              {t.ctaStartLearning}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section (Deep Navy Foundation + 3D Learning Orbit) */}
      <section
        id="top"
        className="border-b border-slate-800 bg-[#0A1128] text-white"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-10 px-6 py-16 lg:grid-cols-12 lg:py-20">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-medium tracking-wide text-cyan-300">
              UnlockED Track · Low-Bandwidth Adaptive Learning for Rural Schools
            </p>
            <h1 className="font-display mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white text-balance sm:text-5xl">
              {t.heroHeadline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              {t.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onEnterDemo('student')}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 whitespace-nowrap shrink-0"
              >
                {t.ctaStartLearning}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white whitespace-nowrap shrink-0"
              >
                {t.ctaExploreHow}
              </a>
              <PWAInstallButton variant="dark" />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-slate-800 pt-6 text-sm text-slate-300">
              <button
                type="button"
                onClick={() => onEnterDemo('student')}
                className="font-medium text-cyan-300 underline-offset-4 hover:underline whitespace-nowrap shrink-0"
              >
                Demo: Student Workspace (Asha, Grade 7)
              </button>
              <button
                type="button"
                onClick={() => onEnterDemo('teacher')}
                className="font-medium text-slate-200 underline-offset-4 hover:text-white hover:underline whitespace-nowrap shrink-0"
              >
                Demo: Teacher Insights Dashboard
              </button>
              <button
                type="button"
                onClick={() =>
                  onChangeLanguage(language === 'en' ? 'kn' : 'en')
                }
                className="font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline whitespace-nowrap shrink-0"
              >
                {language === 'en' ? 'ಕನ್ನಡದಲ್ಲಿ ನೋಡಿ' : 'View in English'}
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-6">
            <Suspense
              fallback={
                <div className="flex h-[340px] w-full items-center justify-center rounded-2xl border border-blue-400/20 bg-[#0F172A] text-sm text-slate-300 lg:h-[420px]">
                  Loading 3D Learning Orbit...
                </div>
              }
            >
              <LearningUniverse3D
                liteMode={liteMode}
                onToggleLiteMode={onToggleLiteMode}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Problem-to-Solution Section */}
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
              <p className="text-xs font-semibold tracking-wide text-slate-500">
                The Real-World Challenge
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold text-slate-900">
                Two connected barriers in rural classrooms
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Students in rural communities routinely encounter intermittent
                mobile coverage, shared family devices, and limited one-on-one
                academic support. Conventional platforms freeze when connectivity
                drops and serve identical static material even when a learner
                repeatedly struggles with foundational topics like fractions.
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-8">
              <p className="text-xs font-semibold tracking-wide text-blue-700">
                The LearnSphere AI Approach
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold text-slate-900">
                Continuity + Explainable Adaptation together
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                LearnSphere AI caches lessons and quizzes locally in IndexedDB
                while running a transparent, explainable adaptive engine on the
                device. Every recommendation explains why it was chosen, and
                completed quizzes queue safely for deduplicated server sync as
                soon as internet returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 8-Step LearnSphere Learning Loop */}
      <section id="how-it-works" className="border-b border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
              The LearnSphere Learning Loop
            </h2>
            <p className="mt-3 text-base text-slate-600">
              A complete end-to-end learning cycle built to survive
              disconnection while adapting to each student’s pace.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {LOOP_STEPS.map((step, idx) => {
              const isActive = idx === activeLoopIdx;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveLoopIdx(idx)}
                  className={`flex flex-col items-start rounded-xl border p-4 text-left transition-colors ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span className="mt-1.5 text-sm font-semibold">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-mono text-xs font-medium text-blue-700 tabular-nums">
                Step {LOOP_STEPS[activeLoopIdx].num} ·{' '}
                {LOOP_STEPS[activeLoopIdx].title}
              </p>
              <p className="mt-1.5 max-w-2xl text-base text-slate-700">
                {LOOP_STEPS[activeLoopIdx].detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEnterDemo('student')}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              Try This Step Live
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Curriculum Subject Cards (Generated Illustrations) */}
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
                Core Curriculum Modules (Grades 6–8)
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {t.sampleContentNote} Bilingual English and Kannada support
                included.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEnterDemo('student')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0"
            >
              Open Diagnostic Quiz →
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {(['mathematics', 'science', 'english'] as const).map((subId) => {
              const meta = SUBJECT_METADATA[subId];
              return (
                <div
                  key={subId}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                    <img
                      src={meta.image}
                      alt={`${meta.name.en} visual diagram`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        {meta.name[language]}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-600">
                        {meta.subtitle[language]}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterDemo('student')}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Start {meta.name.en} Diagnostic
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Four Unique Differentiators & Honest Comparison */}
      <section id="differentiators" className="border-b border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Four Implemented Differentiators
          </h2>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Built directly into the student and teacher workflows—not marketing
            claims.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <WifiOff className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h3 className="font-display mt-4 text-base font-bold text-slate-900">
                01. Continuity-First Learning
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Download lessons to IndexedDB and complete quizzes smoothly even
                with zero signal.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <Compass className="h-5 w-5 text-cyan-600" aria-hidden="true" />
              <h3 className="font-display mt-4 text-base font-bold text-slate-900">
                02. Explainable Personalisation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Transparent mastery formula shows students why a lesson and
                difficulty tier are chosen.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <RefreshCw
                className="h-5 w-5 text-violet-600"
                aria-hidden="true"
              />
              <h3 className="font-display mt-4 text-base font-bold text-slate-900">
                03. Progress Survives Disconnection
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Event-based sync queue persists across page refreshes and
                prevents duplicate submissions.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h3 className="font-display mt-4 text-base font-bold text-slate-900">
                04. Teacher-Focused Insights
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Teachers spot struggling topics across the classroom and assign
                targeted follow-ups.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-6 py-3.5">Capability</th>
                  <th className="px-6 py-3.5">
                    Conventional Online Platforms
                  </th>
                  <th className="px-6 py-3.5 text-blue-700">LearnSphere AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.dimension}>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {row.dimension}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.conventional}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {row.learnsphere}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Offline Architecture & Teacher CTA */}
      <section
        id="offline-architecture"
        className="border-b border-slate-200 bg-[#0A1128] py-16 text-white"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-wide text-cyan-300">
              Offline-First Engineering
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-white">
              Online → Offline → Local Save → Reconnect → Sync
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Built as an installable Progressive Web App with Workbox caching
              and IndexedDB persistence. Every offline quiz generates a unique
              timestamped sync event (
              <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-xs text-cyan-300">
                eventId
              </code>
              ) so reconnection updates the SQLite classroom database cleanly
              with zero duplicates.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <HardDriveDownload
                  className="mt-0.5 h-4 w-4 text-cyan-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Download lessons individually to IndexedDB with exact storage
                  footprint visibility.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 text-cyan-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Transparent AI Tutor uses Gemini on the server when connected,
                  and clearly switches to a local rule-based curriculum tutor
                  offline.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 text-cyan-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Zero API keys in browser bundles; role-protected teacher
                  insights.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-xl border border-blue-400/20 bg-slate-900">
              <img
                src="/src/assets/images/offline_sync_architecture_1795542145996.jpg"
                alt="Isometric diagram showing rural student tablet storing offline lessons and syncing with school hub"
                referrerPolicy="no-referrer"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Educators Section */}
      <section id="educators" className="bg-white py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
              Built for rural teachers managing multi-level classrooms
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Inspect class-wide topic weak areas, spot students needing extra
              support, and assign targeted offline lessons directly from the
              Teacher Dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onEnterDemo('teacher')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Open Teacher Demo
            </button>
            <button
              type="button"
              onClick={() => onEnterDemo('student')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 whitespace-nowrap shrink-0"
            >
              Open Student Demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <div>
            <span className="font-semibold text-slate-800">LearnSphere AI</span>{' '}
            · {t.tagline} · wHACKiest 2026 (UnlockED Track)
          </div>
          <div className="flex items-center gap-4">
            <span>Demo auth enabled for immediate evaluation</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => onChangeLanguage(language === 'en' ? 'kn' : 'en')}
              className="font-medium text-slate-700 hover:text-slate-950"
            >
              {language === 'en' ? 'ಕನ್ನಡ (Kannada)' : 'English'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
