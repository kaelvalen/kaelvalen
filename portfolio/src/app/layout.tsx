import type { Metadata } from "next";
import { IBM_Plex_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-plex-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Mehmet Arda Hakbilen · ML architecture researcher",
  description:
    "ML systems and sequence architecture research: Trainscope loss spike debugger, ENGRAM hybrid backbone, and empirical systems work.",
  metadataBase: new URL("https://kaelvalen.vercel.app"),
  openGraph: {
    title: "Mehmet Arda Hakbilen (kael valen) · ML architecture researcher",
    description:
      "ML systems and sequence architecture research: Trainscope loss spike debugger, ENGRAM hybrid backbone, and empirical systems work.",
    url: "https://kaelvalen.vercel.app",
    siteName: "Mehmet Arda Hakbilen",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehmet Arda Hakbilen · ML architecture researcher",
    description:
      "ML systems and sequence architecture research: Trainscope loss spike debugger, ENGRAM hybrid backbone, and empirical systems work.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plexSerif.variable} ${plexMono.variable}`}>
      <body className="bg-paper text-ink font-serif antialiased">{children}</body>
    </html>
  );
}
