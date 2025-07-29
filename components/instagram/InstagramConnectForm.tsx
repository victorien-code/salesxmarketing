'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Instagram, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Shield,
  Key,
  Video,
  FileText,
  Loader2,
  RefreshCw,
  User,
  Users,
  Calendar,
  Globe,
  Plus,
  Trash2,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  saveInstagramAccount, 
  getAllInstagramAccounts,
  removeInstagramAccount,
  refreshAccountInfo,
  isTokenExpiringSoon,
  InstagramAccountInfo 
} from '@/lib/instagram';

const steps = [
  {
    id: 1,
    title: 'Créer une application Meta',
    description: 'Créez une nouvelle application sur Meta for Developers',
    icon: FileText
  },
  {
    id: 2,
    title: 'Configurer Instagram Basic Display',
    description: 'Ajoutez le produit Instagram Basic Display à votre app',
    icon: Instagram
  },
  {
    id: 3,
    title: 'Obtenir le token d\'accès',
    description: 'Générez votre token d\'accès utilisateur',
    icon: Key
  },
  {
    id: 4,
    title: 'Connecter à SalesXMarketing',
    description: 'Collez votre token dans le formulaire ci-dessous',
    icon: CheckCircle
  }
];

interface ConnectedAccount {
  id: string;
  accountInfo: InstagramAccountInfo | null;
  token: string;
  connectedAt: Date;
  lastUpdated: Date;
  tokenExpiresAt?: Date;
  isExpiringSoon: boolean;
}

export default function InstagramConnectForm() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadConnectedAccounts();
  }, [user]);

  const loadConnectedAccounts = async () => {
    if (!user) return;

    try {
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
      
      // Afficher le formulaire d'ajout si aucun compte connecté
      if (accountsArray.length === 0) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!token.trim()) {
        throw new Error('Veuillez entrer votre token d\'accès');
      }

      if (token.length < 50) {
        throw new Error('Le token semble trop court. Vérifiez que vous avez copié le token complet.');
      }

      console.log('Tentative de connexion avec le token...');
      
      // Sauvegarder le nouveau compte
      const retrievedAccountInfo = await saveInstagramAccount(user.uid, token.trim());
      
      if (retrievedAccountInfo) {
        setSuccess(`Compte Instagram @${retrievedAccountInfo.username} connecté avec succès !`);
        setToken('');
        setShowAddForm(false);
        await loadConnectedAccounts(); // Recharger la liste
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      setError(error.message || 'Une erreur est survenue lors de la connexion du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (accountId: string, username: string) => {
    if (!user) return;
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter le compte @${username} ?`)) return;

    try {
      await removeInstagramAccount(user.uid, accountId);
      setSuccess(`Compte @${username} déconnecté avec succès.`);
      await loadConnectedAccounts();
    } catch (error: any) {
      setError('Erreur lors de la déconnexion.');
    }
  };

  const handleRefreshAccount = async (accountId: string) => {
    if (!user) return;

    setIsRefreshing(accountId);
    try {
      await refreshAccountInfo(user.uid, accountId);
      setSuccess('Informations du compte mises à jour avec succès.');
      await loadConnectedAccounts();
    } catch (error: any) {
      setError('Erreur lors de la mise à jour des informations du compte.');
    } finally {
      setIsRefreshing(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-8">
      {/* Comptes connectés */}
      {connectedAccounts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Comptes Instagram connectés</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un compte
            </Button>
          </div>

          <div className="grid gap-4">
            {connectedAccounts.map((account) => (
              <Card key={account.id} className={`${account.isExpiringSoon ? 'border-yellow-300 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
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
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">
                            @{account.accountInfo?.username || 'Compte inconnu'}
                          </h3>
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
                        <p className="text-muted-foreground">{account.accountInfo?.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
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
                        onClick={() => handleDisconnect(account.id, account.accountInfo?.username || 'compte')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Informations détaillées */}
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">ID du compte</Label>
                      <p className="text-sm font-mono">{account.accountInfo?.id}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Dernière mise à jour</Label>
                      <p className="text-sm">{formatDate(account.lastUpdated)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Expiration du token</Label>
                      <p className={`text-sm ${account.isExpiringSoon ? 'text-red-600 font-medium' : ''}`}>
                        {account.tokenExpiresAt ? formatDate(account.tokenExpiresAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Alertes */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Formulaire d'ajout de compte */}
      {showAddForm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vidéo tutoriel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Guide vidéo étape par étape
              </CardTitle>
              <CardDescription>
                Suivez cette vidéo pour obtenir votre token Meta Instagram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/cHsamsv8Rg4"
                  title="Comment obtenir un token Meta Instagram"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Cette vidéo vous montre comment :
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Créer une application Meta</li>
                  <li>• Configurer Instagram Basic Display</li>
                  <li>• Générer votre token d'accès</li>
                  <li>• Tester votre token</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de connexion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Connecter un nouveau compte
              </CardTitle>
              <CardDescription>
                Ajoutez un compte Instagram à votre liste de comptes connectés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token d'accès Meta Instagram</Label>
                  <Textarea
                    id="token"
                    placeholder="Collez votre token d'accès ici..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    rows={4}
                    className="resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Le token commence généralement par "IGQVd..." et fait plusieurs centaines de caractères
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Sécurité de vos données</h4>
                      <p className="text-sm text-blue-700">
                        Votre token est chiffré et stocké de manière sécurisée. Nous récupérons automatiquement 
                        les informations de votre compte pour une meilleure expérience utilisateur.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <Instagram className="mr-2 h-4 w-4" />
                        Connecter le compte
                      </>
                    )}
                  </Button>
                  {connectedAccounts.length > 0 && (
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Étapes détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Étapes détaillées</CardTitle>
          <CardDescription>
            Guide complet pour obtenir votre token Meta Instagram
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="step1" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {steps.map((step) => (
                <TabsTrigger key={step.id} value={`step${step.id}`} className="text-xs">
                  Étape {step.id}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="step1" className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">1. Créer une application Meta</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>• Rendez-vous sur <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">developers.facebook.com <ExternalLink className="h-3 w-3" /></a></p>
                    <p>• Cliquez sur "Mes apps" puis "Créer une app"</p>
                    <p>• Choisissez "Consommateur" comme type d'application</p>
                    <p>• Donnez un nom à votre application (ex: "Mon App Instagram")</p>
                    <p>• Remplissez les informations requises</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step2" className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <Instagram className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">2. Configurer Instagram Basic Display</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>• Dans votre app, allez dans "Ajouter des produits"</p>
                    <p>• Trouvez "Instagram Basic Display" et cliquez sur "Configurer"</p>
                    <p>• Cliquez sur "Créer une nouvelle app"</p>
                    <p>• Ajoutez les URLs de redirection :</p>
                    <div className="bg-muted p-3 rounded font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span>https://localhost/</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard('https://localhost/')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step3" className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">3. Obtenir le token d'accès</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>• Allez dans "Instagram Basic Display" &gt; "Basic Display"</p>
                    <p>• Ajoutez un utilisateur de test (votre compte Instagram)</p>
                    <p>• Cliquez sur "Générer un token" pour cet utilisateur</p>
                    <p>• Autorisez l'application sur Instagram</p>
                    <p>• Copiez le token généré (il commence par "IGQVd...")</p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-yellow-800 text-xs">
                        <strong>Important :</strong> Ce token expire après 60 jours. Vous devrez le renouveler régulièrement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step4" className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">4. Connecter à SalesXMarketing</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>• Copiez votre token d'accès depuis Meta for Developers</p>
                    <p>• Collez-le dans le formulaire ci-dessus</p>
                    <p>• Cliquez sur "Connecter le compte"</p>
                    <p>• Vos informations de compte seront automatiquement récupérées</p>
                    <p>• Vous pourrez maintenant créer des campagnes d'engagement !</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Puis-je connecter plusieurs comptes Instagram ?</h4>
            <p className="text-sm text-muted-foreground">
              Oui, vous pouvez connecter autant de comptes Instagram que vous le souhaitez. 
              Chaque compte aura son propre token et ses propres paramètres.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Comment déconnecter un compte ?</h4>
            <p className="text-sm text-muted-foreground">
              Cliquez sur l'icône de corbeille à côté du compte que vous souhaitez déconnecter. 
              Cette action supprimera le token et toutes les données associées.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Que se passe-t-il si mon token expire ?</h4>
            <p className="text-sm text-muted-foreground">
              Vous recevrez une notification 7 jours avant l'expiration. Les campagnes utilisant 
              ce compte seront automatiquement mises en pause jusqu'au renouvellement du token.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Les informations sont-elles mises à jour automatiquement ?</h4>
            <p className="text-sm text-muted-foreground">
              Vous pouvez rafraîchir manuellement les informations de chaque compte en cliquant 
              sur l'icône de rafraîchissement. Cela récupère les dernières données depuis Instagram.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}