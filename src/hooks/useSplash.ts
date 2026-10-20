import { useEffect, useState } from "react";
import { SPLASH_KEY, SPLASH_PENDING_CLASS } from "@/lib/site";

const SPLASH_MS = 1800;

export type SplashPhase = "boot" | "show" | "done";

function clearSplashPending() {
  document.documentElement.classList.remove(SPLASH_PENDING_CLASS);
}

function splashAlreadySeen() {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === "1";
  } catch {
    return false;
  }
}

function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH_KEY, "1");
  } catch {
    // sessionStorage can throw in private mode
  }
}

/**
 * First-visit splash for this tab.
 * Stays "boot" through hydration so returning visits never flash the screen.
 * The pre-paint CSS cover hides the page until the client decides.
 */
export function useSplash(): SplashPhase {
  const [splash, setSplash] = useState<SplashPhase>("boot");

  useEffect(() => {
    let cancelled = false;

    if (splashAlreadySeen()) {
      clearSplashPending();
      // Defer setState — sync updates in effects trip react-hooks/set-state-in-effect
      const doneTimer = setTimeout(() => {
        if (!cancelled) setSplash("done");
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(doneTimer);
      };
    }

    // CSS cover already hides the page; defer show for the same lint rule
    const showTimer = setTimeout(() => {
      if (!cancelled) setSplash("show");
    }, 0);
    const doneTimer = setTimeout(() => {
      if (cancelled) return;
      setSplash("done");
      clearSplashPending();
      markSplashSeen();
    }, SPLASH_MS);

    return () => {
      cancelled = true;
      clearTimeout(showTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return splash;
}
