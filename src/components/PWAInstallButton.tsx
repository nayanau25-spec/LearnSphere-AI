import React, {useState} from 'react';
import {Download} from 'lucide-react';
import {usePWAInstall} from '../hooks/usePWA';

interface Props {
  variant?: 'dark' | 'light';
}

export const PWAInstallButton: React.FC<Props> = ({variant = 'light'}) => {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
          variant === 'dark'
            ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        Install Offline App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            variant === 'dark'
              ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Install Offline App
        </button>

        {showGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
              <h3 id="ios-install-title" className="text-base font-semibold">
                Install LearnSphere AI on iOS
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                1. Tap the <strong>Share</strong> icon in Safari.
                <br />
                2. Choose <strong>Add to Home Screen</strong> for full offline
                lesson caching.
              </p>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
