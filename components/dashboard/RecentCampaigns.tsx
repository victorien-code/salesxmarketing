'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoreHorizontal, Play, Pause, BarChart, Users, MessageCircle, Trophy, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCampaigns, Campaign } from '@/lib/campaigns';

const getStatusBadge = (status: string) => {
  const variants = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800',
  };
  
  const labels = {
    active: 'Actif',
    paused: 'En pause',
    completed: 'Terminé',
    draft: 'Brouillon',
  };

  return (
    <Badge className={variants[status as keyof typeof variants]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
};

const getTypeIcon = (type: string) => {
  const icons = {
    follower_engagement: Users,
    interaction_trigger: MessageCircle,
    contest_management: Trophy,
  };
  return icons[type as keyof typeof icons] || MessageCircle;
};

const getTypeLabel = (type: string) => {
  const types = {
    follower_engagement: 'Engagement Followers',
    interaction_trigger: 'Déclenchement par Interaction',
    contest_management: 'Gestion de Jeux Concours',
  };
  return types[type as keyof typeof types] || type;
};

export default function RecentCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadCampaigns = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userCampaigns = await getUserCampaigns(user.uid);
        // Prendre seulement les 4 campagnes les plus récentes
        setCampaigns(userCampaigns.slice(0, 4));
      } catch (error) {
        console.error('Erreur lors du chargement des campagnes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Campagnes d'engagement récentes</CardTitle>
            <CardDescription>
              Gérez vos campagnes d'engagement avec votre communauté
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Campagnes d'engagement récentes</CardTitle>
          <CardDescription>
            Gérez vos campagnes d'engagement avec votre communauté
          </CardDescription>
        </div>
        <Link href="/campaigns">
          <Button variant="outline" size="sm">
            Voir tout
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="mb-2">Aucune campagne créée</p>
            <Link href="/campaigns/new">
              <Button size="sm">
                Créer ma première campagne
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const TypeIcon = getTypeIcon(campaign.type);
              const progress = campaign.stats.scraped > 0 
                ? (campaign.stats.engaged / campaign.stats.scraped) * 100 
                : 0;

              return (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <TypeIcon className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      {getStatusBadge(campaign.status)}
                      <span className="text-sm text-muted-foreground">{getTypeLabel(campaign.type)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span>{campaign.stats.scraped} ciblés</span>
                      <span>{campaign.stats.engaged} engagements</span>
                      <span>Progression: {Math.round(progress)}%</span>
                      <span>
                        Créée le: {campaign.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </span>
                    </div>
                    
                    {campaign.status !== 'draft' && (
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      {campaign.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <BarChart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}