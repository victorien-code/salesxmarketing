'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Instagram, 
  Bell, 
  Shield, 
  CreditCard,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Users,
  Calendar,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAllInstagramAccounts,
  removeInstagramAccount,
  refreshAccountInfo,
  isTokenExpiringSoon,
  InstagramAccountInfo 
} from '@/lib/instagram';
import Link from 'next/link';

interface ConnectedAccount {
  id: string;
  accountInfo: InstagramAccountInfo | null;
  token: string;
  connectedAt: Date;
  lastUpdated: Date;
  tokenExpiresAt?: Date;
  isExpiringSoon: boolean;
}

export default function SettingsTabs() {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadConnectedAccounts();
  }, [user]);

  const loadConnectedAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const accounts = await getAllInstagramAccounts(user.uid);
      const accountsArray: ConnectedAccount[] = [];

      for (const [accountId, accountData] of Object.entries(accounts)) {
        const expiringSoon = await isTokenExpiringSoon(user.uid, accountId);
        accountsArray.push({
          id: accountId,
          accountInfo: accountData.accountInfo,
          token: accountData.token,
          connectedAt: accountData.connectedAt,
          lastUpdated: accountData.lastUpdated,
          tokenExpiresAt: accountData.tokenExpiresAt,
          isExpiringSoon: expiringSoon
        });
      }

      // Trier par date de connexion (plus récent en premier)
      accountsArray.sort((a, b) => new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime());
      
      setConnectedAccounts(accountsArray);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAccount = async (accountId: string) => {
    if (!user) return;

    setIsRefreshing(accountId);
    try {
      await refreshAccountInfo(user.uid, accountId);
      await loadConnectedAccounts();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsRefreshing(null);
    }
  };

  const handleDisconnectAccount = async (accountId: string, username: string) => {
    if (!user) return;
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter le compte @${username} ?`)) return;

    try {
      await removeInstagramAccount(user.uid, accountId);
      await loadConnectedAccounts();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch {
      return 'N/A';
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="instagram">Instagram</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Sécurité</TabsTrigger>
        <TabsTrigger value="billing">Facturation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du Profil
            </CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et préférences de compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback>
                  {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">Changer la photo</Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou GIF. Taille maximale 2MB.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input 
                  id="firstName" 
                  defaultValue={user?.displayName?.split(' ')[0] || ''} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input 
                  id="lastName" 
                  defaultValue={user?.displayName?.split(' ').slice(1).join(' ') || ''} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue={user?.email || ''} 
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Parlez-nous de vous..."
                defaultValue="Community manager passionné par l'engagement Instagram et l'automatisation."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <Input id="timezone" defaultValue="Europe/Paris" />
            </div>
            
            <Button>Sauvegarder les modifications</Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="instagram" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              Comptes Instagram Connectés
            </CardTitle>
            <CardDescription>
              Gérez vos comptes Instagram connectés et leurs paramètres d'engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : connectedAccounts.length > 0 ? (
              <div className="space-y-4">
                {/* Alertes d'expiration */}
                {connectedAccounts.some(account => account.isExpiringSoon) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Attention !</strong> Un ou plusieurs tokens Instagram expirent bientôt. 
                      <Link href="/instagram-connect" className="ml-2 underline">
                        Cliquez ici pour les renouveler
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Liste des comptes */}
                {connectedAccounts.map((account) => (
                  <div key={account.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                    account.isExpiringSoon ? 'border-yellow-300 bg-yellow-50' : 'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={account.accountInfo?.profile_picture_url} 
                          alt={account.accountInfo?.username}
                        />
                        <AvatarFallback>
                          <Instagram className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-lg">@{account.accountInfo?.username || 'Compte inconnu'}</h4>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          {account.accountInfo?.account_type && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              {account.accountInfo.account_type}
                            </Badge>
                          )}
                          {account.isExpiringSoon && (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Expire bientôt
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{account.accountInfo?.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {account.accountInfo?.media_count && (
                            <span className="flex items-center">
                              <Instagram className="h-4 w-4 mr-1" />
                              {formatNumber(account.accountInfo.media_count)} posts
                            </span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Connecté le {formatDate(account.connectedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefreshAccount(account.id)}
                        disabled={isRefreshing === account.id}
                      >
                        {isRefreshing === account.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={`https://instagram.com/${account.accountInfo?.username}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectAccount(account.id, account.accountInfo?.username || 'compte')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Bouton pour ajouter un compte */}
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <Button asChild>
                    <Link href="/instagram-connect">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un compte Instagram
                    </Link>
                  </Button>
                </div>

                {/* Informations détaillées du premier compte */}
                {connectedAccounts[0] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                    <div className="space-y-2">
                      <Label>ID du compte principal</Label>
                      <Input value={connectedAccounts[0].accountInfo?.id || 'N/A'} readOnly className="bg-muted font-mono text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label>Type de compte</Label>
                      <Input value={connectedAccounts[0].accountInfo?.account_type || 'Non spécifié'} readOnly className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Dernière mise à jour</Label>
                      <Input value={formatDate(connectedAccounts[0].lastUpdated)} readOnly className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration du token</Label>
                      <Input 
                        value={formatDate(connectedAccounts[0].tokenExpiresAt)} 
                        readOnly 
                        className={`bg-muted ${connectedAccounts[0].isExpiringSoon ? 'border-red-300 text-red-700' : ''}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Instagram className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Aucun compte Instagram connecté</h3>
                <p className="text-muted-foreground mb-4">
                  Connectez votre compte Instagram pour commencer à créer des campagnes d'engagement.
                </p>
                <Button asChild>
                  <Link href="/instagram-connect">
                    <Instagram className="h-4 w-4 mr-2" />
                    Connecter Instagram
                  </Link>
                </Button>
              </div>
            )}
            
            {/* Paramètres d'engagement */}
            {connectedAccounts.length > 0 && (
              <div className="space-y-4 pt-6 border-t">
                <h4 className="font-medium">Paramètres d'engagement</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Messages par jour (max)</Label>
                    <Input type="number" defaultValue="50" />
                    <p className="text-xs text-muted-foreground">
                      Limite quotidienne pour éviter les restrictions Instagram
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Délai entre messages (minutes)</Label>
                    <Input defaultValue="60" />
                    <p className="text-xs text-muted-foreground">
                      Délai pour un comportement naturel
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mode sécurisé</Label>
                      <p className="text-sm text-muted-foreground">
                        Réduit la vitesse d'engagement pour maximiser la sécurité
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Vérification des followers</Label>
                      <p className="text-sm text-muted-foreground">
                        Vérifie automatiquement le statut de follower avant envoi
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Respect des limites API</Label>
                      <p className="text-sm text-muted-foreground">
                        Respecte strictement les limitations de l'API Meta
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Button>Sauvegarder les paramètres</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Préférences de Notification
            </CardTitle>
            <CardDescription>
              Choisissez comment et quand vous souhaitez être notifié
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Notifications par email</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rapports de campagne</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des rapports quotidiens sur vos campagnes d'engagement
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertes de sécurité</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications en cas de problème de sécurité ou d'expiration de token
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nouvelles fonctionnalités</Label>
                    <p className="text-sm text-muted-foreground">
                      Soyez informé des nouvelles fonctionnalités d'engagement
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Conseils d'engagement</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des conseils pour optimiser vos campagnes d'engagement
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Notifications push</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Campagne terminée</Label>
                    <p className="text-sm text-muted-foreground">
                      Quand une campagne d'engagement se termine
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Erreurs critiques</Label>
                    <p className="text-sm text-muted-foreground">
                      En cas d'erreur nécessitant votre attention
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jeux concours</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications pour les tirages au sort et gagnants
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            <Button>Sauvegarder les préférences</Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité du Compte
            </CardTitle>
            <CardDescription>
              Protégez votre compte avec des mesures de sécurité avancées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Authentification à deux facteurs</h4>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">Activé</Badge>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Changer le mot de passe</Label>
                <div className="space-y-2">
                  <Input type="password" placeholder="Mot de passe actuel" />
                  <Input type="password" placeholder="Nouveau mot de passe" />
                  <Input type="password" placeholder="Confirmer le nouveau mot de passe" />
                </div>
                <Button variant="outline">Mettre à jour le mot de passe</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Sessions actives</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Session actuelle</p>
                    <p className="text-sm text-muted-foreground">Paris, France • Chrome sur Windows</p>
                  </div>
                  <Badge variant="outline">Actuelle</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">iPhone</p>
                    <p className="text-sm text-muted-foreground">Lyon, France • Safari sur iOS</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button variant="outline">Déconnecter toutes les autres sessions</Button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Recommandation de sécurité</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Nous recommandons de changer votre mot de passe régulièrement et d'activer 
                    l'authentification à deux facteurs pour une sécurité optimale.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="billing" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Facturation et Abonnement
            </CardTitle>
            <CardDescription>
              Gérez votre abonnement et vos informations de facturation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Plan Freemium</h3>
                  <p className="opacity-90">Profitez de 3 mois gratuits</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  85 jours restants
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm opacity-90">
                  Votre période d'essai gratuite se termine le 15 avril 2024
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Plans disponibles</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium">Starter</h5>
                  <p className="text-2xl font-bold mt-2">€29<span className="text-sm font-normal">/mois</span></p>
                  <ul className="text-sm text-muted-foreground mt-3 space-y-1">
                    <li>• 1 compte Instagram</li>
                    <li>• 3 campagnes actives</li>
                    <li>• 1000 messages/jour</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">Choisir</Button>
                </div>
                
                <div className="border-2 border-primary rounded-lg p-4 relative">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Populaire
                  </Badge>
                  <h5 className="font-medium">Pro</h5>
                  <p className="text-2xl font-bold mt-2">€79<span className="text-sm font-normal">/mois</span></p>
                  <ul className="text-sm text-muted-foreground mt-3 space-y-1">
                    <li>• 3 comptes Instagram</li>
                    <li>• Campagnes illimitées</li>
                    <li>• 5000 messages/jour</li>
                  </ul>
                  <Button className="w-full mt-4">Choisir</Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium">Enterprise</h5>
                  <p className="text-2xl font-bold mt-2">€199<span className="text-sm font-normal">/mois</span></p>
                  <ul className="text-sm text-muted-foreground mt-3 space-y-1">
                    <li>• Comptes illimités</li>
                    <li>• Support prioritaire</li>
                    <li>• Messages illimités</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">Choisir</Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Historique de facturation</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Période d'essai gratuite</p>
                    <p className="text-sm text-muted-foreground">15 Jan 2024 - 15 Avr 2024</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Gratuit</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}