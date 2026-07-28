import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const siteUrl = site.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Credifácil — Compara y solicita tu crédito en Costa Rica",
    template: "%s | Credifácil",
  },
  description:
    "Compara créditos hipotecarios, personales, de vehículo y para tu negocio de los principales bancos y cooperativas de Costa Rica. Simula tu cuota y recibe asesoría gratis.",
  keywords: [
    "créditos Costa Rica",
    "crédito hipotecario",
    "préstamo personal",
    "crédito de vehículo",
    "comparador de créditos",
    "simulador de crédito",
  ],
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: siteUrl,
    siteName: "Credifácil",
    title: "Credifácil — Compara y solicita tu crédito en Costa Rica",
    description:
      "Compara créditos de los principales bancos y cooperativas de Costa Rica. Simula tu cuota en segundos y recibe asesoría gratis.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Credifácil — Compara tu crédito en Costa Rica",
    description:
      "Compara créditos de los principales bancos y cooperativas de Costa Rica. Simula tu cuota y recibe asesoría gratis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CR"
      className={`${inter.variable} ${jakarta.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
