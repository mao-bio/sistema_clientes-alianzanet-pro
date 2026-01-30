
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { MobileHeader, MobileBottomNav } from "@/components/MobileNav";

import AuthWrapper from "@/components/AuthWrapper";

export const metadata: Metadata = {
  title: "ALIANZANET | Pro Management System",
  description: "Sistema avanzado de gestión de clientes e infraestructura ISP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthWrapper>
          <div className="flex flex-col lg:flex-row min-h-screen relative">
            <div className="bg-mesh" />
            <MobileHeader />
            <Sidebar />
            <main className="flex-1 overflow-y-auto lg:max-h-screen relative z-10">
              <div className="p-4 md:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            <MobileBottomNav />
          </div>
        </AuthWrapper>
      </body>
    </html>
  );
}
