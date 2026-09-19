import Head from "next/head";
import {
  DEFAULT_META,
  SITE_NAME,
  resolveOgImage,
  toAbsoluteUrl,
} from "@/lib/siteMeta";

export type MetaTagsProps = {
  title?: string;
  description?: string;
  keywords?: string;
  /** Path or absolute URL (defaults to site root) */
  path?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
};

export default function MetaTags({
  title,
  description,
  keywords,
  path,
  ogImage,
  ogImageAlt,
  noIndex = false,
}: MetaTagsProps) {
  const finalTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_META.title;
  const finalDescription = description || DEFAULT_META.description;
  const finalKeywords = keywords || DEFAULT_META.keywords;
  const finalUrl = toAbsoluteUrl(path);
  const finalImage = resolveOgImage(ogImage);
  const finalImageAlt = ogImageAlt || DEFAULT_META.imageAlt;

  return (
    <Head>
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content={DEFAULT_META.imageWidth} />
      <meta property="og:image:height" content={DEFAULT_META.imageHeight} />
      <meta property="og:image:alt" content={finalImageAlt} />
      <meta property="og:url" content={finalUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={finalImageAlt} />
    </Head>
  );
}
