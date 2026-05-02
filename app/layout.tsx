import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Reveal — Privacy Risk Analyzer",
  description:
    "Browser-based privacy risk analysis tool for data schemas. Analyze re-identification risks, k-anonymity, and get remediation recommendations.",
  keywords: ["privacy", "HIPAA", "GDPR", "CCPA", "k-anonymity", "data privacy", "re-identification"],
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-bg-subtle">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
