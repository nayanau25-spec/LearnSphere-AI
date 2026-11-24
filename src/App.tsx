import {useEffect, useState} from 'react';
import {LandingPage} from './components/LandingPage';
import {StudentWorkspace} from './components/StudentWorkspace';
import {TeacherWorkspace} from './components/TeacherWorkspace';
import type {Language, TextScale, UserRole} from './domain/types';
import {
  DEFAULT_USER_PREFS,
  getUserPrefs,
  saveUserPrefs,
} from './storage/offlineDb';

type ActiveView = 'landing' | 'student' | 'teacher';

export default function App() {
  const [view, setView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return params.get('role') === 'teacher' ? 'teacher' : 'student';
      }
    }
    return 'landing';
  });

  const [language, setLanguage] = useState<Language>(
    DEFAULT_USER_PREFS.language,
  );
  const [textScale, setTextScale] = useState<TextScale>(
    DEFAULT_USER_PREFS.textScale,
  );
  const [simulateOffline, setSimulateOffline] = useState<boolean>(
    DEFAULT_USER_PREFS.simulateOffline,
  );
  const [liteMode, setLiteMode] = useState<boolean>(DEFAULT_USER_PREFS.lite3d);

  useEffect(() => {
    void getUserPrefs().then((prefs) => {
      setLanguage(prefs.language);
      setTextScale(prefs.textScale);
      setSimulateOffline(prefs.simulateOffline);
      setLiteMode(prefs.lite3d);
    });
  }, []);

  const persistPrefs = (patch: Partial<typeof DEFAULT_USER_PREFS>) => {
    const next = {
      language,
      textScale,
      simulateOffline,
      lite3d: liteMode,
      ...patch,
    };
    void saveUserPrefs(next);
  };

  const handleEnterDemo = async (role: UserRole) => {
    // Best-effort demo login call (works offline too if cached)
    if (!simulateOffline) {
      await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({role}),
      }).catch(() => {});
    }
    setView(role);
  };

  if (view === 'student') {
    return (
      <StudentWorkspace
        language={language}
        onChangeLanguage={(lang) => {
          setLanguage(lang);
          persistPrefs({language: lang});
        }}
        textScale={textScale}
        onChangeTextScale={(scale) => {
          setTextScale(scale);
          persistPrefs({textScale: scale});
        }}
        simulateOffline={simulateOffline}
        onToggleSimulateOffline={() => {
          const next = !simulateOffline;
          setSimulateOffline(next);
          persistPrefs({simulateOffline: next});
        }}
        onSwitchRole={(role) => setView(role)}
        onBackToLanding={() => setView('landing')}
      />
    );
  }

  if (view === 'teacher') {
    return (
      <TeacherWorkspace
        language={language}
        onChangeLanguage={(lang) => {
          setLanguage(lang);
          persistPrefs({language: lang});
        }}
        onSwitchRole={(role) => setView(role)}
        onBackToLanding={() => setView('landing')}
      />
    );
  }

  return (
    <LandingPage
      language={language}
      onChangeLanguage={(lang) => {
        setLanguage(lang);
        persistPrefs({language: lang});
      }}
      liteMode={liteMode}
      onToggleLiteMode={() => {
        const next = !liteMode;
        setLiteMode(next);
        persistPrefs({lite3d: next});
      }}
      onEnterDemo={(role) => void handleEnterDemo(role)}
    />
  );
}
