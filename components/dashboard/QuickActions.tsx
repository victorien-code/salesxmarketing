import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Instagram, MessageCircle, BarChart3 } from 'lucide-react';

const actions = [
  {
    title: 'Nouvelle campagne d\'engagement',
    description: 'Créez une campagne pour engager votre communauté',
    icon: Plus,
    href: '/campaigns/new',
    variant: 'default' as const,
  },
  {
    title: 'Connecter Instagram',
    description: 'Ajoutez ou gérez vos comptes Instagram',
    icon: Instagram,
    href: '/instagram-connect',
    variant: 'outline' as const,
  },
  {
    title: 'Messagerie Instagram',
    description: 'Consultez et répondez à vos messages directs',
    icon: MessageCircle,
    href: '/messaging',
    variant: 'outline' as const,
  },
  {
    title: 'Voir les analyses',
    description: 'Consultez vos performances d\'engagement',
    icon: BarChart3,
    href: '/analytics',
    variant: 'outline' as const,
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
        <CardDescription>
          Accédez rapidement aux fonctionnalités d'engagement de votre communauté
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button 
                variant={action.variant} 
                className="w-full h-auto p-4 flex flex-col items-center space-y-2"
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}