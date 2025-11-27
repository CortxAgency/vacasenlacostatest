import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Vacas en la Costa | Alquileres Temporales',
    template: '%s | Vacas en la Costa'
  }, description: "La plataforma inmobiliaria más rápida y segura de Argentina. Dueño directo sin comisiones ocultas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-background">
          {children}
        </main>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
