// src/app/(dashboard)/layout.tsx
import { ReactNode } from "react";

export default function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
