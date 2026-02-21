import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "דיווח שעות LeadersApp",
  description: "ניהול העבודה שלך בצורה הפשוטה ביותר",
  metadataBase: new URL("https://www.leaders-app-hours-report.club"),
  openGraph: {
    title: "דיווח שעות LeadersApp",
    description: "ניהול העבודה שלך בצורה הפשוטה ביותר",
    url: "https://www.leaders-app-hours-report.club",
    siteName: "LeadersApp Hours Report",
    images: [
      {
        url: "https://res.cloudinary.com/dyqjvjdlq/image/upload/v1771691001/logo_k40wzi.png",
        width: 1200,
        height: 630,
        alt: "דיווח שעות LeadersApp",
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "דיווח שעות LeadersApp",
    description: "ניהול העבודה שלך בצורה הפשוטה ביותר",
    images: ["https://res.cloudinary.com/dyqjvjdlq/image/upload/v1771691001/logo_k40wzi.png"], 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
