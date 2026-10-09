import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const sans = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mehmet Arda Hakbilen · ML architecture researcher",
  description:
    "ML systems and sequence architecture research: Trainscope loss spike debugger, Cerata learning after deployment, and empirical systems work.",
  metadataBase: new URL("https://kaelvalen.vercel.app"),
  openGraph: {
    title: "Mehmet Arda Hakbilen (kael valen) · ML architecture researcher",
    description:
      "ML systems and sequence architecture research: Trainscope loss spike debugger, Cerata learning after deployment, and empirical systems work.",
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
      "ML systems and sequence architecture research: Trainscope loss spike debugger, Cerata learning after deployment, and empirical systems work.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0b" },
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
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
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
