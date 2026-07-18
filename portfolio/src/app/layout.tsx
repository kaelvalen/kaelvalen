import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
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
    <html lang="en" className={`${newsreader.variable} ${jbmono.variable}`}>
      <body className="bg-paper text-ink font-serif antialiased">{children}</body>
    </html>
  );
}
