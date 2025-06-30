'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  calculateCampaignPerformance,
  calculateOptimalTimeSlots,
  calculateConversionRates,
  getUserEngagementMetrics,
  CampaignPerformance,
  OptimalTimeSlot,
  ConversionRates,
  EngagementMetrics
} from '@/lib/analytics';

export default function AnalyticsCharts() {
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance[]>([]);
  const [optimalTimeSlots, setOptimalTimeSlots] = useState<OptimalTimeSlot[]>([]);
  const [conversionRates, setConversionRates] = useState<ConversionRates | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        const [
          performance,
          timeSlots,
          conversions,
          engagement
        ] = await Promise.all([
          calculateCampaignPerformance(user.uid),
          calculateOptimalTimeSlots(user.uid),
          calculateConversionRates(user.uid),
          getUserEngagementMetrics(user.uid, 7)
        ]);

        setCampaignPerformance(performance);
        setOptimalTimeSlots(timeSlots);
        setConversionRates(conversions);
        setEngagementData(engagement);
      } catch (error) {
        console.error('Erreur lors du chargement des données d\'analyse:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="growth">Croissance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution de l'Engagement</CardTitle>
              <CardDescription>
                Suivi quotidien des différents types d'engagement sur les 7 derniers jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-muted-foreground">Graphique d'engagement temporel</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Likes, commentaires, follows et messages par jour
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {engagementData.reduce((sum, data) => sum + data.metrics.likes, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Likes totaux</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {engagementData.reduce((sum, data) => sum + data.metrics.comments, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Commentaires</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {engagementData.reduce((sum, data) => sum + data.metrics.follows, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Follows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {engagementData.reduce((sum, data) => sum + data.metrics.messages, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Messages</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance par Campagne</CardTitle>
              <CardDescription>
                Comparaison des résultats de vos différentes campagnes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignPerformance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucune campagne avec des données de performance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaignPerformance.map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{campaign.campaignName}</h4>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground mt-1">
                          <span>{campaign.engagement.toLocaleString()} engagements</span>
                          <span>{campaign.reach.toLocaleString()} portée</span>
                          <span>+{campaign.followers} followers</span>
                          <span>{campaign.messagesCount} messages</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {campaign.engagementRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Taux d'engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Croissance des Followers</CardTitle>
              <CardDescription>
                Évolution du nombre de followers au fil du temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-muted-foreground">Graphique de croissance</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Suivi de l'évolution des followers
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    +{engagementData.reduce((sum, data) => sum + data.metrics.follows, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Cette semaine</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    +{Math.floor(engagementData.reduce((sum, data) => sum + data.metrics.follows, 0) * 4.3)}
                  </div>
                  <div className="text-sm text-muted-foreground">Ce mois</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    +{Math.floor(engagementData.reduce((sum, data) => sum + data.metrics.follows, 0) / 7)}
                  </div>
                  <div className="text-sm text-muted-foreground">Aujourd'hui</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Taux de Conversion</CardTitle>
                <CardDescription>
                  Efficacité de vos actions d'engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversionRates ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Likes → Followers</span>
                      <span className="font-medium">{conversionRates.likesToFollowers.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Comments → Réponses</span>
                      <span className="font-medium">{conversionRates.commentsToResponses.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">DM → Conversations</span>
                      <span className="font-medium">{conversionRates.dmToConversations.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Follows → Follow back</span>
                      <span className="font-medium">{conversionRates.followsToFollowBack.toFixed(1)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Aucune donnée de conversion disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Meilleurs Créneaux</CardTitle>
                <CardDescription>
                  Heures optimales pour l'engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {optimalTimeSlots.length > 0 ? (
                  <div className="space-y-4">
                    {optimalTimeSlots.map((slot, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{slot.hour}</span>
                        <Badge 
                          variant={
                            slot.performance === 'excellent' ? 'default' :
                            slot.performance === 'good' ? 'secondary' :
                            slot.performance === 'average' ? 'outline' : 'destructive'
                          }
                          className={
                            slot.performance === 'excellent' ? 'bg-green-100 text-green-800' :
                            slot.performance === 'good' ? 'bg-blue-100 text-blue-800' :
                            slot.performance === 'average' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {slot.performance === 'excellent' ? 'Excellent' :
                           slot.performance === 'good' ? 'Bon' :
                           slot.performance === 'average' ? 'Moyen' : 'Faible'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Aucune donnée de créneaux disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}