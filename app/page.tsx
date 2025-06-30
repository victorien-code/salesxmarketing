import { Metadata } from 'next';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Accueil - Engagez votre communauté Instagram existante',
  description: 'Découvrez SalesXMarketing, l\'outil ultime pour engager automatiquement vos followers et utilisateurs qui interagissent avec vos contenus Instagram. Parfait pour les jeux concours et l\'engagement communautaire.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}