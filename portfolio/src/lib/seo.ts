import type { Metadata } from "next";

export const SITE_URL = "https://kaelvalen.vercel.app";
export const SITE_TITLE = "kael valen · Mehmet Arda Hakbilen, ML systems researcher";
export const SITE_DESCRIPTION =
  "I build instruments for language models: RELIC changes what a deployed model knows without retraining it, trainscope catches a training run before it fails.";

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "kael valen: a loss surface whose basins are RELIC, trainscope and the rest of the work",
};

export const OG_BASE: NonNullable<Metadata["openGraph"]> = {
  siteName: "Mehmet Arda Hakbilen",
  locale: "en_US",
  alternateLocale: ["tr_TR"],
  type: "website",
  images: [OG_IMAGE],
};

export const TWITTER_BASE: NonNullable<Metadata["twitter"]> = {
  card: "summary_large_image",
  images: ["/og.png"],
};
