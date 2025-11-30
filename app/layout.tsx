import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vacasenlacosta.com'),
  title: {
    default: "Vacas en la Costa | Alquileres Temporales",
    template: "%s | Vacas en la Costa"
  },
  description: "Encontrá tu alojamiento ideal en la costa argentina. Departamentos, casas y cabañas para tus vacaciones.",
  openGraph: {
    title: "Vacas en la Costa | Alquileres Temporales",
    description: "La mejor plataforma para encontrar tu alojamiento en la costa. Seguro, rápido y directo.",
    url: 'https://vacasenlacosta.com',
    siteName: 'Vacas en la Costa',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Vacas en la Costa",
    description: "Encontrá tu alojamiento ideal en la costa argentina.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
