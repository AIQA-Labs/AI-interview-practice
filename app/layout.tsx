import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIQA: AI-Powered Real-Time Interview Platform for Smarter Hiring",
  description:
    "AIQA is an intelligent voice-driven interview platform that helps companies assess candidates in real time using conversational AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased pattern`}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>

        <Toaster />
      </body>
    </html>
  );
}
