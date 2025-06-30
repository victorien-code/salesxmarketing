'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  MessageCircle, 
  UserPlus,
  Target,
  Clock,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateGlobalStats, GlobalStats } from '@/lib/analytics';

export default function AnalyticsStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const globalStats = await calculateGlobalStats(user.uid);
        setStats(globalStats);
      } catch (error: unknown) {
        console.error('Erreur lors du chargement des statistiques:', error);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error || 'Aucune donnée disponible'}</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Engagement Total',
      value: stats.totalEngagement.toLocaleString(),
      change: '+23.5%',
      trend: 'up',
      icon: Heart,
      description: 'Actions d\'engagement ce mois'
    },
    {
      title: 'Nouveaux Followers',
      value: stats.newFollowers.toLocaleString(),
      change: '+18.2%',
      trend: 'up',
      icon: UserPlus,
      description: 'Followers gagnés ce mois'
    },
    {
      title: 'Taux de Réponse DM',
      value: `${stats.responseRate.toFixed(1)}%`,
      change: '+2.1%',
      trend: 'up',
      icon: MessageCircle,
      description: 'Réponses aux messages directs'
    },
    {
      title: 'Portée Totale',
      value: `${(stats.totalReach / 1000).toFixed(1)}K`,
      change: '+31.7%',
      trend: 'up',
      icon: Users,
      description: 'Utilisateurs touchés'
    },
    {
      title: 'Campagnes Actives',
      value: stats.activeCampaigns.toString(),
      change: '+2',
      trend: 'up',
      icon: Target,
      description: 'Campagnes en cours'
    },
    {
      title: 'Temps Économisé',
      value: `${stats.timeSaved}h`,
      change: '+45h',
      trend: 'up',
      icon: Clock,
      description: 'Temps automatisé ce mois'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="bg-primary/10 rounded-full p-2">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={`${
                  stat.trend === 'up' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.change}
              </Badge>
            </div>
            <CardDescription className="text-xs mt-2">
              {stat.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}