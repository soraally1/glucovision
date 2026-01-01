import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileWrapper from "@/components/ui/MobileWrapper";
import { AuthProvider } from "@/components/providers/AuthProvider";
import BottomNav from "@/components/layout/BottomNav";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlucoVision Web-AI",
  description: "Non-invasive glucose monitoring via smartphone camera",
};

export const viewport = {
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
    <html lang="en">
      <body
        className={`${jakarta.variable} ${geistMono.variable} antialiased bg-gray-50 font-sans`}
      >
        <AuthProvider>
          <MobileWrapper>
            {children}
            <BottomNav />
          </MobileWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
