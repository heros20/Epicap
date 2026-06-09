import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Geist_Mono, Manrope, Space_Grotesk } from "next/font/google"

import { PostHogPageview } from "@/components/analytics/posthog-pageview"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/lib/cart/cart-provider"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Epicap - Matériel de désamiantage, vente, maintenance et location",
    template: "%s | Epicap",
  },
  description:
    "Epicap SAS, spécialiste de la fourniture, de la location et de la maintenance de matériel et d'équipements de protection contre l'amiante et les autres polluants.",
  keywords: [
    "désamiantage",
    "amiante",
    "EPI",
    "protection respiratoire",
    "décontamination",
    "extracteurs epiair",
    "location matériel",
    "maintenance systèmes respiratoires",
    "fit test",
  ],
  authors: [{ name: "Epicap" }],
  creator: "Epicap",
  metadataBase: new URL("https://epicap.com"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://epicap.com",
    siteName: "Epicap",
    title: "Epicap - Matériel de désamiantage, vente, maintenance et location",
    description:
      "Fourniture, location et maintenance d'équipements de protection contre l'amiante et les autres polluants.",
    images: [
      {
        url: "/images/logo-epicap.jpg",
        width: 903,
        height: 300,
        alt: "Logo Epicap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Epicap - Matériel de désamiantage, vente, maintenance et location",
    description:
      "Fourniture, location et maintenance d'équipements contre l'amiante et les autres polluants.",
    images: ["/images/logo-epicap.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff851c",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${spaceGrotesk.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
        <Suspense fallback={null}>
          <PostHogPageview />
        </Suspense>
      </body>
    </html>
  )
}
