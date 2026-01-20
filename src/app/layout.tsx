import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SOS-NOW | 실시간 응급 의료 지도",
  description: "전국 응급실, 약국, 동물병원, AED 위치를 실시간으로 확인하세요. 1분 1초가 급한 순간, 가장 빠른 정보를 제공합니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable}`} suppressHydrationWarning={true}>
      <head />
      <body className="font-sans antialiased selection:bg-red-100 selection:text-red-600">
        {children}
      </body>
    </html>
  );
}
