// file: app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget"; // Keep this import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Norwood Empire",
  description: "Premium quality products with authenticity and taste.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 👇 Apply the font class name here 👇 */}
      <body className={`bg-background text-foreground transition-all ${inter.className}`}>
        <Navbar />
        <main className="pt-20">{children}</main>
        <Footer />
        <ChatbotWidget />
      </body>
    </html>
  );
}