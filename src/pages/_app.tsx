import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { SPLASH_KEY, SPLASH_PENDING_CLASS } from "@/lib/splash";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

function scrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function clearSplashPending() {
  document.documentElement.classList.remove(SPLASH_PENDING_CLASS);
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // "boot" until client knows; CSS ::before covers first-visit paint in the meantime
  const [splash, setSplash] = useState<"boot" | "show" | "done">("boot");

  useEffect(() => {
    let prevPath = window.location.pathname;
    const onComplete = (url: string) => {
      const nextPath = url.split("?")[0];
      if (nextPath !== prevPath) {
        scrollToTop();
      }
      prevPath = nextPath;
    };
    router.events.on("routeChangeComplete", onComplete);
    return () => {
      router.events.off("routeChangeComplete", onComplete);
    };
  }, [router.events]);

  useEffect(() => {
    let cancelled = false;

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(SPLASH_KEY) === "1";
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      clearSplashPending();
      setSplash("done");
      return;
    }

    // Show branded splash immediately (CSS cover already hides the page)
    setSplash("show");

    const doneTimer = setTimeout(() => {
      if (cancelled) return;
      setSplash("done");
      clearSplashPending();
      try {
        sessionStorage.setItem(SPLASH_KEY, "1");
      } catch {
        // ignore
      }
    }, 1800);

    return () => {
      cancelled = true;
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className={`${inter.variable} font-sans`}>
      {splash === "show" ? <LoadingScreen isLoading /> : null}
      <Component {...pageProps} />
    </div>
  );
}
