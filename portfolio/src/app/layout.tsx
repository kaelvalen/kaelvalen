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
    "Sequence architectures studied from first principles: ENGRAM, a modality-portable SSD + Gated Delta Rule backbone, and the systems work around it.",
  metadataBase: new URL("https://kaelvalen.vercel.app"),
  openGraph: {
    title: "Mehmet Arda Hakbilen (kael valen) · ML architecture researcher",
    description:
      "Efficient sequence architectures & systems research: ENGRAM backbone, Trainscope debugger, and open systems.",
    url: "https://kaelvalen.vercel.app",
    siteName: "Mehmet Arda Hakbilen",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehmet Arda Hakbilen · ML architecture researcher",
    description:
      "Efficient sequence architectures & systems research: ENGRAM backbone, Trainscope debugger, and open systems.",
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
