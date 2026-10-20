import { useRouter } from "next/router";
import { useEffect } from "react";

function scrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Scroll to the top when the pathname changes. Query-only updates stay put. */
export function useScrollToTop() {
  const router = useRouter();

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
}
