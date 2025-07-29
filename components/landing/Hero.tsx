import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Instagram, MessageCircle, Users, Trophy } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 hero-gradient opacity-10"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            🎉 Offre Freemium Exclusive - 3 mois offerts pour tous les nouveaux utilisateurs
          </Badge>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Engagez automatiquement votre 
            <span className="text-gradient"> communauté Instagram</span> 
            <br />existante
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Envoyez des messages directs personnalisés à vos followers et aux utilisateurs qui 
            interagissent avec vos contenus. Parfait pour les jeux concours et l'engagement communautaire.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/auth?mode=signup">
              <Button size="lg" className="px-8 py-3 text-lg font-medium">
                <Instagram className="mr-2 h-5 w-5" />
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg font-medium">
                Se connecter
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="feature-card text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Messages Directs Automatisés</h3>
              <p className="text-muted-foreground">
                Envoyez des messages personnalisés à vos followers et utilisateurs engagés
              </p>
            </div>
            
            <div className="feature-card text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Vérification des Followers</h3>
              <p className="text-muted-foreground">
                Vérifiez automatiquement le statut de follower avant d'envoyer des messages
              </p>
            </div>
            
            <div className="feature-card text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Jeux Concours Automatisés</h3>
              <p className="text-muted-foreground">
                Gérez automatiquement vos jeux concours avec des messages de confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}