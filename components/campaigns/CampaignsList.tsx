'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  BarChart, 
  Edit, 
  Trash2,
  Users,
  MessageCircle,
  Trophy,
  AlertCircle,
  Loader2,
  Instagram,
  ExternalLink,
  Gift,
  Dice6
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCampaigns, updateCampaignStatus, deleteCampaign, Campaign, drawContestWinner } from '@/lib/campaigns';
import { hasInstagramToken } from '@/lib/instagram';
import CampaignsHeader from './CampaignsHeader';
import Link from 'next/link';

const getStatusBadge = (status: string) => {
  const variants = {
    active: { variant: 'default' as const, label: 'Actif', color: 'bg-green-100 text-green-800' },
    paused: { variant: 'secondary' as const, label: 'En pause', color: 'bg-yellow-100 text-yellow-800' },
    completed: { variant: 'outline' as const, label: 'Terminé', color: 'bg-blue-100 text-blue-800' },
    draft: { variant: 'outline' as const, label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
  };
  
  const config = variants[status as keyof typeof variants];
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
};

const getTypeLabel = (type: string) => {
  const types = {
    follower_engagement: 'Engagement Followers',
    interaction_trigger: 'Déclenchement par Interaction',
    contest_management: 'Gestion de Jeux Concours',
  };
  return types[type as keyof typeof types] || type;
};

const getTypeIcon = (type: string) => {
  const icons = {
    follower_engagement: Users,
    interaction_trigger: MessageCircle,
    contest_management: Trophy,
  };
  return icons[type as keyof typeof icons] || MessageCircle;
};

const getAudienceLabel = (audienceType: string) => {
  const labels = {
    new_followers: 'Nouveaux followers',
    all_followers: 'Tous les followers',
    post_responses: 'Réponses à un post',
    post_comments: 'Commentaires de post',
    new_friends: 'Nouveaux amis',
    friend_requests: 'Demandes d\'amis',
    contest_post: 'Participants au concours',
  };
  return labels[audienceType as keyof typeof labels] || audienceType;
};

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [drawingWinner, setDrawingWinner] = useState<string | null>(null);
  const { user } = useAuth();

  const totalCount = campaigns.length;
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const pausedCount = campaigns.filter(c => c.status === 'paused').length;
  const completedCount = campaigns.filter(c => c.status === 'completed').length;
  const draftCount = campaigns.filter(c => c.status === 'draft').length;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        const [userCampaigns, tokenExists] = await Promise.all([
          getUserCampaigns(user.uid),
          hasInstagramToken(user.uid)
        ]);
        
        setCampaigns(userCampaigns);
        setHasToken(tokenExists);
        
        if (!tokenExists) {
          const activeCampaigns = userCampaigns.filter(c => c.status === 'active');
          for (const campaign of activeCampaigns) {
            try {
              await updateCampaignStatus(campaign.id, 'paused');
            } catch (updateError) {
              console.error('Error updating campaign status:', updateError);
            }
          }
          
          if (activeCampaigns.length > 0) {
            const updatedCampaigns = await getUserCampaigns(user.uid);
            setCampaigns(updatedCampaigns);
          }
        }
      } catch (fetchError: unknown) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Impossible de charger les campagnes';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let filtered = campaigns;

    if (currentFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === currentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, currentFilter, searchTerm]);

  const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
    if (newStatus === 'active' && !hasToken) {
      setError('Vous devez connecter votre compte Instagram avant d\'activer une campagne');
      return;
    }

    try {
      await updateCampaignStatus(campaignId, newStatus);
      
      setCampaigns(campaigns.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: newStatus }
          : campaign
      ));
    } catch (updateError: unknown) {
      const errorMessage = updateError instanceof Error ? updateError.message : 'Impossible de mettre à jour le statut de la campagne';
      setError(errorMessage);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      return;
    }

    try {
      await deleteCampaign(campaignId);
      setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId));
    } catch (deleteError: unknown) {
      const errorMessage = deleteError instanceof Error ? deleteError.message : 'Impossible de supprimer la campagne';
      setError(errorMessage);
    }
  };

  const handleDrawWinner = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir effectuer le tirage au sort ? Cette action est irréversible.')) {
      return;
    }

    setDrawingWinner(campaignId);
    try {
      const winner = await drawContestWinner(campaignId);
      
      setCampaigns(campaigns.map(campaign => 
        campaign.id === campaignId 
          ? { 
              ...campaign, 
              contest: { 
                ...campaign.contest!, 
                winner, 
                isDrawn: true 
              } 
            }
          : campaign
      ));
      
      alert(`🎉 Félicitations ! Le gagnant est : @${winner}`);
    } catch (drawError: unknown) {
      const errorMessage = drawError instanceof Error ? drawError.message : 'Impossible d\'effectuer le tirage au sort';
      setError(errorMessage);
    } finally {
      setDrawingWinner(null);
    }
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CampaignsHeader 
          totalCount={0}
          activeCount={0}
          pausedCount={0}
          completedCount={0}
          draftCount={0}
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CampaignsHeader 
        totalCount={totalCount}
        activeCount={activeCount}
        pausedCount={pausedCount}
        completedCount={completedCount}
        draftCount={draftCount}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
      />

      {!hasToken && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Token Instagram manquant !</strong> Vous devez connecter votre compte Instagram 
              pour pouvoir lancer des campagnes d'engagement. Toutes les campagnes actives ont été mises en pause.
            </div>
            <Link href="/instagram-connect">
              <Button variant="outline" size="sm" className="ml-4">
                <Instagram className="h-4 w-4 mr-2" />
                Connecter Instagram
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {campaigns.length === 0 ? 'Aucune campagne d\'engagement' : 'Aucun résultat'}
              </h3>
              <p>
                {campaigns.length === 0 
                  ? 'Vous n\'avez pas encore créé de campagne d\'engagement.'
                  : 'Aucune campagne ne correspond à vos critères de recherche.'
                }
              </p>
            </div>
            {campaigns.length === 0 && (
              <Button asChild>
                <Link href="/campaigns/new">Créer ma première campagne d'engagement</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => {
            const TypeIcon = getTypeIcon(campaign.type);
            const progress = campaign.stats.scraped > 0 
              ? (campaign.stats.engaged / campaign.stats.scraped) * 100 
              : 0;

            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <TypeIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-xl">{campaign.name}</CardTitle>
                          {getStatusBadge(campaign.status)}
                          {campaign.status === 'paused' && !hasToken && (
                            <Badge variant="destructive" className="text-xs">
                              Token manquant
                            </Badge>
                          )}
                          {campaign.type === 'contest_management' && campaign.contest?.isDrawn && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Gift className="h-3 w-3 mr-1" />
                              Tirage effectué
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base mb-3">
                          {campaign.description}
                        </CardDescription>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {campaign.stats.scraped.toLocaleString()} ciblés
                          </span>
                          <span>{campaign.stats.engaged.toLocaleString()} engagements</span>
                          <span>{getTypeLabel(campaign.type)}</span>
                          <span>{getAudienceLabel(campaign.targeting.audienceType || '')}</span>
                          <span>{campaign.settings.actionsPerDay} messages/jour</span>
                        </div>
                        
                        {campaign.type === 'contest_management' && campaign.contest && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center">
                                  <Trophy className="h-4 w-4 mr-1 text-yellow-600" />
                                  {campaign.contest.participants?.length || 0} participants
                                </span>
                                {campaign.contest.isDrawn && campaign.contest.winner && (
                                  <span className="flex items-center font-medium text-yellow-800">
                                    <Gift className="h-4 w-4 mr-1" />
                                    Gagnant: @{campaign.contest.winner}
                                  </span>
                                )}
                              </div>
                              {!campaign.contest.isDrawn && campaign.contest.participants && campaign.contest.participants.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDrawWinner(campaign.id)}
                                  disabled={drawingWinner === campaign.id}
                                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                                >
                                  {drawingWinner === campaign.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Tirage...
                                    </>
                                  ) : (
                                    <>
                                      <Dice6 className="h-4 w-4 mr-2" />
                                      Tirer au sort
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart className="mr-2 h-4 w-4" />
                          Analyses
                        </DropdownMenuItem>
                        {campaign.status === 'draft' ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(campaign.id, 'active')}
                            disabled={!hasToken}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {!hasToken ? 'Lancer (Token requis)' : 'Lancer la campagne'}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(
                              campaign.id, 
                              campaign.status === 'active' ? 'paused' : 'active'
                            )}
                            disabled={campaign.status !== 'active' && campaign.status !== 'paused'}
                          >
                            {campaign.status === 'active' ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Mettre en pause
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                {!hasToken ? 'Reprendre (Token requis)' : 'Reprendre'}
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {campaign.status !== 'draft' && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progression</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                      {campaign.status !== 'draft' ? (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {campaign.stats.engagementRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Taux d'engagement</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              +{campaign.stats.followers}
                            </div>
                            <div className="text-xs text-muted-foreground">Nouveaux followers</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {campaign.stats.reach.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Portée totale</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center">
                            <div className="text-lg font-bold text-muted-foreground">
                              Prêt à lancer
                            </div>
                            <div className="text-xs text-muted-foreground">Statut</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {campaign.settings.actionsPerDay}
                            </div>
                            <div className="text-xs text-muted-foreground">Messages/jour</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {getAudienceLabel(campaign.targeting.audienceType || '')}
                            </div>
                            <div className="text-xs text-muted-foreground">Audience</div>
                          </div>
                        </>
                      )}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Créée le</div>
                        <div className="text-sm font-medium">
                          {campaign.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}