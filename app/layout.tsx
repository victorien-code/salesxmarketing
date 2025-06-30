import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: {
    default: 'SalesXMarketing - Engagez votre communauté Instagram existante',
    template: '%s | SalesXMarketing'
  },
  description: 'Automatisez l\'engagement avec votre communauté Instagram existante grâce à SalesXMarketing. Messages directs personnalisés, vérification des followers, et gestion de jeux concours automatisée.',
  keywords: [
    'Instagram', 
    'engagement', 
    'communauté', 
    'messages directs', 
    'followers', 
    'jeux concours', 
    'automation', 
    'community management',
    'marketing digital',
    'réseaux sociaux'
  ],
  authors: [{ name: 'SalesXMarketing Team' }],
  creator: 'SalesXMarketing',
  publisher: 'SalesXMarketing',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://salesxmarketing.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'SalesXMarketing - Engagez votre communauté Instagram existante',
    description: 'Automatisez l\'engagement avec votre communauté Instagram existante grâce à SalesXMarketing. Messages directs personnalisés, vérification des followers, et gestion de jeux concours automatisée.',
    siteName: 'SalesXMarketing',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SalesXMarketing - Automatisation Instagram',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SalesXMarketing - Engagez votre communauté Instagram existante',
    description: 'Automatisez l\'engagement avec votre communauté Instagram existante grâce à SalesXMarketing. Messages directs personnalisés, vérification des followers, et gestion de jeux concours automatisée.',
    creator: '@salesxmarketing',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}