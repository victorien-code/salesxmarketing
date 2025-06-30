import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageCircle, 
  Users, 
  Shield, 
  Trophy, 
  FileText, 
  Link as LinkIcon,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'Messages Directs Intelligents',
    description: 'Envoyez automatiquement des messages personnalisés aux utilisateurs qui interagissent avec vos contenus ou à vos followers existants.',
  },
  {
    icon: Users,
    title: 'Vérification des Followers',
    description: 'Vérifiez automatiquement si un utilisateur vous suit avant d\'envoyer un message pour respecter les bonnes pratiques.',
  },
  {
    icon: Trophy,
    title: 'Gestion de Jeux Concours',
    description: 'Automatisez vos jeux concours en envoyant des messages de confirmation aux participants qui interagissent avec vos posts.',
  },
  {
    icon: FileText,
    title: 'Import CSV Avancé',
    description: 'Importez vos listes d\'utilisateurs via CSV et vérifiez automatiquement leur statut de follower avant engagement.',
  },
  {
    icon: LinkIcon,
    title: 'Déclenchement par URL',
    description: 'Lancez des workflows d\'engagement en entrant simplement l\'URL d\'un post Instagram spécifique.',
  },
  {
    icon: CheckCircle,
    title: 'Workflows Automatisés',
    description: 'Créez des séquences d\'engagement qui se déclenchent automatiquement selon les interactions des utilisateurs.',
  },
  {
    icon: Shield,
    title: 'Conformité API Meta',
    description: 'Respecte toutes les limitations de l\'API Meta en se concentrant uniquement sur vos followers et utilisateurs engagés.',
  },
  {
    icon: BarChart3,
    title: 'Analyses d\'Engagement',
    description: 'Suivez les performances de vos campagnes d\'engagement avec des métriques détaillées et des rapports en temps réel.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Fonctionnalités 
            <span className="text-gradient"> d'Engagement</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez tous les outils dont vous avez besoin pour engager efficacement 
            votre communauté Instagram existante et maximiser vos interactions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}