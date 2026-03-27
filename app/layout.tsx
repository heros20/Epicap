import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Epicap - Equipements de protection contre l\'amiante et polluants',
    template: '%s | Epicap',
  },
  description: 'Epicap, spécialiste du désamiantage et de la dépollution. Vente et location de matériel professionnel : EPI, aspirateurs, extracteurs d\'air, unités de décontamination.',
  keywords: ['désamiantage', 'amiante', 'EPI', 'équipement protection', 'dépollution', 'aspirateur amiante', 'extracteur air', 'location matériel'],
  authors: [{ name: 'Epicap' }],
  creator: 'Epicap',
  metadataBase: new URL('https://epicap.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://epicap.com',
    siteName: 'Epicap',
    title: 'Epicap - Equipements de protection contre l\'amiante',
    description: 'Spécialiste du désamiantage et de la dépollution. Vente et location de matériel professionnel.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Epicap - Equipements de protection contre l\'amiante',
    description: 'Spécialiste du désamiantage et de la dépollution.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#E53935',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
