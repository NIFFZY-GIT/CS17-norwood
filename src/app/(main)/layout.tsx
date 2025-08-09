// src/app/(main)/layout.tsx
import { ReactNode } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
      <ChatbotWidget />
    </>
  );
}
