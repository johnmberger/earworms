import "@/styles/globals.css";
import { inter } from "@/styles/font";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useScrollToTop, useSplash } from "@/hooks";

export default function App({ Component, pageProps }: AppProps) {
  const splash = useSplash();
  useScrollToTop();

  return (
    <div className={`${inter.variable} font-sans`}>
      {splash === "show" ? <LoadingScreen isLoading /> : null}
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
