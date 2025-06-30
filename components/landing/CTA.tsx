import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Instagram, ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-violet-600 p-8 lg:p-16">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          
          <div className="relative text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Prêt à engager votre 
              <br />communauté Instagram ?
            </h2>
            
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Rejoignez des milliers de community managers qui automatisent déjà l'engagement 
              avec leur communauté existante. Commencez gratuitement dès aujourd'hui !
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth?mode=signup">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg font-medium">
                  <Instagram className="mr-2 h-5 w-5" />
                  Démarrer mes 3 mois gratuits
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <p className="text-sm opacity-75 mt-6">
              Aucune carte bancaire requise • Configuration en 2 minutes • Support 7j/7
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}