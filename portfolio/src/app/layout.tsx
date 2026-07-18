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
  title: "Mehmet Arda Hakbilen — ML architecture researcher",
  description:
    "Sequence architectures studied from first principles: PRISM, a modality-portable SSD + Gated Delta Rule backbone, and the systems work around it.",
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
