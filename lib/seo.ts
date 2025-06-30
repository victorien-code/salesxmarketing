import React from 'react';
import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = []
}: SEOProps = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://salesxmarketing.com';
  const defaultTitle = 'SalesXMarketing - Engagez votre communauté Instagram existante';
  const defaultDescription = 'Automatisez l\'engagement avec votre communauté Instagram existante grâce à SalesXMarketing. Messages directs personnalisés, vérification des followers, et gestion de jeux concours automatisée.';
  const defaultImage = '/og-image.jpg';

  const seoTitle = title ? `${title} | SalesXMarketing` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoUrl = url ? `${baseUrl}${url}` : baseUrl;

  const allKeywords = [
    'Instagram',
    'engagement',
    'communauté',
    'messages directs',
    'followers',
    'jeux concours',
    'automation',
    'community management',
    'marketing digital',
    'réseaux sociaux',
    ...keywords
  ];

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : [{ name: 'SalesXMarketing Team' }],
    creator: 'SalesXMarketing',
    publisher: 'SalesXMarketing',
    alternates: {
      canonical: seoUrl,
    },
    openGraph: {
      type,
      locale: 'fr_FR',
      url: seoUrl,
      title: seoTitle,
      description: seoDescription,
      siteName: 'SalesXMarketing',
      images: [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: title || 'SalesXMarketing',
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : ['SalesXMarketing Team'],
        section,
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      creator: '@salesxmarketing',
      images: [seoImage],
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
  };
}

// Schémas JSON-LD pour le SEO structuré
export const generateJSONLD = {
  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SalesXMarketing',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://salesxmarketing.com',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://salesxmarketing.com'}/logo.png`,
    description: 'Automatisez l\'engagement avec votre communauté Instagram existante',
    sameAs: [
      'https://twitter.com/salesxmarketing',
      'https://instagram.com/salesxmarketing',
      'https://linkedin.com/company/salesxmarketing'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33-1-23-45-67-89',
      contactType: 'customer service',
      availableLanguage: 'French'
    }
  }),

  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SalesXMarketing',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://salesxmarketing.com',
    description: 'Automatisez l\'engagement avec votre communauté Instagram existante',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://salesxmarketing.com'}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }),

  softwareApplication: () => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SalesXMarketing',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Automatisez l\'engagement avec votre communauté Instagram existante',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://salesxmarketing.com',
    author: {
      '@type': 'Organization',
      name: 'SalesXMarketing Team'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: '3 mois gratuits pour tous les nouveaux utilisateurs'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1'
    }
  }),

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://salesxmarketing.com'}${item.url}`
    }))
  }),

  faq: (questions: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(qa => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer
      }
    }))
  })
};

// Hook pour injecter les schémas JSON-LD
export const useJSONLD = (schema: object) => {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);
};