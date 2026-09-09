import Document, { Html, Head, Main, NextScript } from "next/document";
import { SPLASH_KEY, SPLASH_PENDING_CLASS } from "@/lib/splash";

const splashBootCss = `html.${SPLASH_PENDING_CLASS}::before{content:"";position:fixed;inset:0;z-index:40;pointer-events:none;background:linear-gradient(to bottom right,#0f172a,#581c87,#1e293b)}`;

const splashBootScript = `(function(){try{if(sessionStorage.getItem(${JSON.stringify(SPLASH_KEY)})!=="1")document.documentElement.classList.add(${JSON.stringify(SPLASH_PENDING_CLASS)})}catch(e){document.documentElement.classList.add(${JSON.stringify(SPLASH_PENDING_CLASS)})}})();`;

export default class EarwormsDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#581c87" />
          <meta name="author" content="John" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link
            rel="icon"
            href="/favicon-16x16.svg"
            type="image/svg+xml"
            sizes="16x16"
          />
          <link
            rel="icon"
            href="/favicon.svg"
            type="image/svg+xml"
            sizes="32x32"
          />
          <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
          <link rel="shortcut icon" href="/favicon.svg" />
          {/* Inline so the cover exists before paint / before React hydrates */}
          <style dangerouslySetInnerHTML={{ __html: splashBootCss }} />
          <script dangerouslySetInnerHTML={{ __html: splashBootScript }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
