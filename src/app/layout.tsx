import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SOS-NOW | 실시간 응급 의료 정보",
  description: "전국 응급실, 약국, 동물병원, AED 위치를 실시간으로 확인하세요. 1분 1초가 급한 순간, 가장 빠른 정보를 제공합니다.",
  keywords: ["응급실", "약국", "동물병원", "AED", "실시간", "의료정보", "응급의료"],
  authors: [{ name: "SOS-NOW" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SOS-NOW",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ef4444",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable}`} suppressHydrationWarning={true}>
      <head />
      <body
        className="font-sans antialiased selection:bg-red-100 selection:text-red-600"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
