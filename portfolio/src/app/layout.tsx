import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

// One family carries the page; its width axis separates drawing lettering from titles.
const sans = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Only for literal code: commands, hashes, formulas.
const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mehmet Arda Hakbilen · ML architecture researcher",
  description:
    "ML systems research: trainscope, a loss-spike flight recorder, and CERATA, transactional knowledge updates for frozen language models.",
  metadataBase: new URL("https://kaelvalen.vercel.app"),
  openGraph: {
    title: "Mehmet Arda Hakbilen (kael valen) · ML architecture researcher",
    description:
      "ML systems research: trainscope, a loss-spike flight recorder, and CERATA, transactional knowledge updates for frozen language models.",
    url: "https://kaelvalen.vercel.app",
    siteName: "Mehmet Arda Hakbilen",
    locale: "en_US",
    alternateLocale: ["tr_TR"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehmet Arda Hakbilen · ML architecture researcher",
    description:
      "ML systems research: trainscope, a loss-spike flight recorder, and CERATA, transactional knowledge updates for frozen language models.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f9" },
    { media: "(prefers-color-scheme: dark)", color: "#13365f" },
  ],
};

// Runs before first paint: applies the saved/system theme and enables scroll-reveal styling.
const prePaint = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t;d.style.colorScheme=t}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
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
