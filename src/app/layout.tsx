// file: app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    // Highlight: Add the suppressHydrationWarning prop here
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground transition-all">
        <Navbar />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}