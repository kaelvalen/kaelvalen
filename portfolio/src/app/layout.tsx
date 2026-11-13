import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Spectral } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

// A map's two voices: a serif for names (italic for places, as on a survey sheet), a plain sans for the rest.
const display = Spectral({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

// Only for literal code: commands, hashes, formulas.
const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  // Readouts only: not worth competing with Archivo and the page for the first bytes.
  preload: false,
});

const DESCRIPTION =
  "I build instruments for language models: RELIC changes what a deployed model knows without retraining it, trainscope catches a training run before it fails.";

export const metadata: Metadata = {
  title: { default: "kael valen · Mehmet Arda Hakbilen, ML systems researcher", template: "%s · kael valen" },
  description: DESCRIPTION,
  metadataBase: new URL("https://kaelvalen.vercel.app"),
  openGraph: {
    title: "kael valen · Mehmet Arda Hakbilen, ML systems researcher",
    description: DESCRIPTION,
    url: "https://kaelvalen.vercel.app",
    siteName: "Mehmet Arda Hakbilen",
    locale: "en_US",
    alternateLocale: ["tr_TR"],
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "kael valen: a loss surface whose basins are RELIC, trainscope and the rest of the work" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
    title: "kael valen · Mehmet Arda Hakbilen, ML systems researcher",
    description: DESCRIPTION,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1ee" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1638" },
  ],
};

// Runs before first paint: the reader's chosen sky, or else the sky over Ankara right now
// (the same solar position as isDay in lib/landscape.ts, minified; unit-tested there).
const prePaint = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=null;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark'){var n=new Date(),r=Math.PI/180,y=(n-Date.UTC(n.getUTCFullYear(),0,0))/864e5,g=2*Math.PI/365*(y-1+(n.getUTCHours()-12)/24),c=Math.cos,s=Math.sin,de=.006918-.399912*c(g)+.070257*s(g)-.006758*c(2*g)+.000907*s(2*g)-.002697*c(3*g)+.00148*s(3*g),eq=229.18*(.000075+.001868*c(g)-.032077*s(g)-.014615*c(2*g)-.040849*s(2*g)),h=((n.getUTCHours()*60+n.getUTCMinutes()+eq+4*32.86)/4-180)*r,z=s(39.93*r)*s(de)+c(39.93*r)*c(de)*c(h);t=90-Math.acos(Math.max(-1,Math.min(1,z)))/r>-.833?'light':'dark'}d.dataset.theme=t;d.style.colorScheme=t}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaint }} />
      </head>
      <body className="bg-paper text-ink font-sans antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
