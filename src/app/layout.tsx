import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keeping these for now, eventually check fonts
import "./globals.css";
import MobileWrapper from "@/components/ui/MobileWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlucoVision Web-AI",
  description: "Non-invasive glucose monitoring via smartphone camera",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Critical for mobile app feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <MobileWrapper>
          {children}
        </MobileWrapper>
      </body>
    </html>
  );
}
