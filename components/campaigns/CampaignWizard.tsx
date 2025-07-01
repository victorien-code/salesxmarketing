'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  ArrowRight, 
  MessageCircle, 
  Users, 
  Target,
  Settings,
  CheckCircle,
  Upload,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  Trophy,
  Plus,
  Trash2,
  Clock,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createCampaign, Campaign } from '@/lib/campaigns';
import CSVImportDialog from './CSVImportDialog';

const steps = [
  { id: 1, title: 'Type de campagne', icon: Target },
  { id: 2, title: 'Audience', icon: Users },
  { id: 3, title: 'Configuration', icon: Settings },
  { id: 4, title: 'Révision', icon: CheckCircle },
];

const campaignTypes = [
  {
    id: 'follower_engagement',
    title: 'Engagement Followers',
    description: 'Envoi de messages directs à vos followers avec vérification automatique',
    icon: Users,
    features: ['Vérification des followers', 'Messages personnalisés', 'Respect des limites API', 'Engagement authentique']
  },
  {
    id: 'interaction_trigger',
    title: 'Déclenchement par Interaction',
    description: 'Messages automatiques aux utilisateurs qui interagissent avec vos contenus',
    icon: MessageCircle,
    features: ['Déclenchement automatique', 'Réponse aux interactions', 'Workflow intelligent', 'Engagement ciblé']
  },
  {
    id: 'contest_management',
    title: 'Gestion de Jeux Concours',
    description: 'Automatisation complète de vos jeux concours avec tirage au sort intégré',
    icon: Trophy,
    features: ['Messages de confirmation', 'Tirage au sort automatique', 'Messages de félicitations', 'Gestion complète']
  }
];

interface CSVAccount {
  account: string;
  firstName?: string;
  lastName?: string;
  [key: string]: string | undefined;
}

interface MessageConfig {
  id: string;
  content: string;
  delay: number; // en minutes
}

interface CampaignFormData {
  name: string;
  description: string;
  type: string;
  audience: {
    type: string;
    postUrl: string;
    csvAccounts: CSVAccount[];
  };
  settings: {
    actionsPerDay: number;
    delayBetweenMessages: number;
    verifyFollowers: boolean;
    respectApiLimits: boolean;
  };
  messages: MessageConfig[];
  winnerMessage: string;
}

export default function CampaignWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableFields, setAvailableFields] = useState<string[]>(['account']);
  const [selectedAudience, setSelectedAudience] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const [campaignData, setCampaignData] = useState<CampaignFormData>({
    name: '',
    description: '',
    type: '',
    audience: {
      type: '',
      postUrl: '',
      csvAccounts: [],
    },
    settings: {
      actionsPerDay: 50,
      delayBetweenMessages: 60,
      verifyFollowers: true,
      respectApiLimits: true,
    },
    messages: [
      { id: '1', content: '', delay: 0 }
    ],
    winnerMessage: '',
  });

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addMessage = () => {
    const newMessage: MessageConfig = {
      id: Date.now().toString(),
      content: '',
      delay: 60
    };
    setCampaignData({
      ...campaignData,
      messages: [...campaignData.messages, newMessage]
    });
  };

  const removeMessage = (messageId: string) => {
    if (campaignData.messages.length > 1) {
      setCampaignData({
        ...campaignData,
        messages: campaignData.messages.filter(msg => msg.id !== messageId)
      });
    }
  };

  const updateMessage = (messageId: string, field: 'content' | 'delay', value: string | number) => {
    setCampaignData({
      ...campaignData,
      messages: campaignData.messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, [field]: value }
          : msg
      )
    });
  };

  const handleCreateCampaign = async () => {
    if (!user) {
      setError('Vous devez être connecté pour créer une campagne');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newCampaign: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        name: campaignData.name,
        description: campaignData.description,
        type: selectedType as Campaign['type'],
        status: 'draft',
        settings: {
          actionsPerDay: campaignData.settings.actionsPerDay,
          delayBetweenActions: `${campaignData.settings.delayBetweenMessages}`,
          safeMode: true,
          verifyFollowers: campaignData.settings.verifyFollowers,
          respectApiLimits: campaignData.settings.respectApiLimits,
        },
        targeting: {
          audienceType: campaignData.audience.type,
          postUrl: campaignData.audience.postUrl,
          csvAccounts: campaignData.audience.csvAccounts,
        },
        messages: {
          templates: campaignData.messages.map(msg => msg.content),
          confirmationMessages: [],
          winnerMessage: campaignData.winnerMessage,
          delayBetweenMessages: campaignData.messages[1]?.delay || 0,
        },
        stats: {
          scraped: campaignData.audience.csvAccounts.length,
          engaged: 0,
          followers: 0,
          reach: 0,
          engagementRate: 0
        }
      };

      const campaignId = await createCampaign(user.uid, newCampaign);
      
      router.push('/campaigns');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la création de la campagne';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVImport = (accounts: CSVAccount[]) => {
    const invalidAccounts = accounts.filter(acc => !acc.account || acc.account.trim() === '');
    if (invalidAccounts.length > 0) {
      setError(`${invalidAccounts.length} compte(s) n'ont pas de nom d'utilisateur valide. Le champ 'account' est obligatoire.`);
      return;
    }

    const allFields = new Set<string>();
    accounts.forEach(account => {
      Object.keys(account).forEach(key => {
        if (account[key] && account[key]!.trim() !== '') {
          allFields.add(key);
        }
      });
    });

    setAvailableFields(Array.from(allFields));

    setCampaignData({
      ...campaignData,
      audience: {
        ...campaignData.audience,
        csvAccounts: accounts
      }
    });

    setError('');
  };

  const getAudienceOptions = () => {
    switch (selectedType) {
      case 'follower_engagement':
        return [
          { 
            value: 'new_followers', 
            label: 'Nouveaux followers', 
            description: 'Déclenchement automatique pour chaque nouveau follower',
            isTrigger: true
          },
          { 
            value: 'csv_followers', 
            label: 'Liste spécifique de followers', 
            description: 'Import CSV de comptes qui vous suivent ou sont amis avec votre compte business',
            isTrigger: false
          },
          { 
            value: 'post_responses', 
            label: 'Réponses à un post', 
            description: 'Utilisateurs qui ont répondu à un post spécifique',
            isTrigger: false
          },
        ];
      case 'interaction_trigger':
        return [
          { 
            value: 'post_comments', 
            label: 'Nouveaux commentaires', 
            description: 'Déclenchement pour chaque nouveau commentaire sur vos posts',
            isTrigger: true
          },
          { 
            value: 'post_likes', 
            label: 'Nouveaux likes', 
            description: 'Déclenchement pour chaque nouveau like sur vos posts',
            isTrigger: true
          },
        ];
      case 'contest_management':
        return [
          { 
            value: 'contest_post', 
            label: 'Post de jeu concours', 
            description: 'Participants qui interagissent avec votre post de concours',
            isTrigger: false
          },
        ];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choisissez le type de campagne</h2>
              <p className="text-muted-foreground">
                Sélectionnez le type d'engagement qui correspond à vos objectifs
              </p>
            </div>
            
            <div className="grid gap-4">
              {campaignTypes.map((type) => (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedType === type.id ? 'ring-2 ring-primary border-primary' : ''
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <type.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="flex items-center justify-between">
                          {type.title}
                          {selectedType === type.id && (
                            <Badge variant="default">Sélectionné</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {type.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {type.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Sélectionnez votre audience</h2>
              <p className="text-muted-foreground">
                Choisissez qui recevra vos messages d'engagement
              </p>
            </div>
            
            <div className="space-y-4">
              {getAudienceOptions().map((option) => (
                <Card 
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedAudience === option.value ? 'ring-2 ring-primary border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedAudience(option.value);
                    setCampaignData({
                      ...campaignData,
                      audience: { ...campaignData.audience, type: option.value }
                    });
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {option.isTrigger && (
                          <div className="bg-yellow-100 rounded-full p-1">
                            <Zap className="h-4 w-4 text-yellow-600" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {option.label}
                            {option.isTrigger && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                <Zap className="h-3 w-3 mr-1" />
                                Trigger
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{option.description}</CardDescription>
                        </div>
                      </div>
                      {selectedAudience === option.value && (
                        <Badge variant="default">Sélectionné</Badge>
                      )}
                    </div>
                    
                    {selectedAudience === option.value && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        {(option.value === 'post_responses' || 
                          option.value === 'post_comments' || 
                          option.value === 'post_likes' ||
                          option.value === 'contest_post') && (
                          <div className="space-y-2">
                            <Label>URL du post Instagram</Label>
                            <div className="relative">
                              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="https://www.instagram.com/p/..."
                                className="pl-10"
                                value={campaignData.audience.postUrl}
                                onChange={(e) => setCampaignData({
                                  ...campaignData,
                                  audience: { ...campaignData.audience, postUrl: e.target.value }
                                })}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Collez l'URL de votre post Instagram
                            </p>
                          </div>
                        )}

                        {option.value === 'csv_followers' && (
                          <div className="space-y-4">
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Important :</strong> La liste CSV doit contenir des comptes Instagram qui 
                                <strong> suivent ou sont amis</strong> avec votre compte business connecté. 
                                Cela garantit le respect des bonnes pratiques Instagram et l'efficacité de vos messages.
                              </AlertDescription>
                            </Alert>

                            <CSVImportDialog 
                              onImport={handleCSVImport}
                              trigger={
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-start h-auto p-4"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  <div className="text-left">
                                    <div className="font-medium">Importer une liste CSV</div>
                                    <div className="text-xs text-muted-foreground">
                                      Comptes qui suivent votre compte business
                                    </div>
                                  </div>
                                </Button>
                              }
                            />
                            
                            {campaignData.audience.csvAccounts && campaignData.audience.csvAccounts.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label>Comptes importés</Label>
                                  <Badge variant="secondary">
                                    {campaignData.audience.csvAccounts.length} compte{campaignData.audience.csvAccounts.length > 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                <div className="max-h-32 overflow-y-auto border rounded-lg p-3">
                                  <div className="space-y-1">
                                    {campaignData.audience.csvAccounts.slice(0, 5).map((account, index) => (
                                      <div key={index} className="flex items-center gap-2 text-sm">
                                        <Users className="h-3 w-3 text-muted-foreground" />
                                        <span>@{account.account}</span>
                                        {(account.firstName || account.lastName) && (
                                          <span className="text-muted-foreground">
                                            ({account.firstName} {account.lastName})
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                    {campaignData.audience.csvAccounts.length > 5 && (
                                      <div className="text-xs text-muted-foreground">
                                        ... et {campaignData.audience.csvAccounts.length - 5} autres
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <Alert className="border-green-200 bg-green-50">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <AlertDescription className="text-green-800">
                                    <strong>Liste importée !</strong> {campaignData.audience.csvAccounts.length} comptes 
                                    sont prêts pour l'engagement. Assurez-vous qu\'ils suivent votre compte business.
                                  </AlertDescription>
                                </Alert>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Configuration de la campagne</h2>
              <p className="text-muted-foreground">
                Définissez le nom, les messages et les paramètres de votre campagne
              </p>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Nom de la campagne</Label>
                    <Input
                      id="campaign-name"
                      placeholder="Ex: Jeu Concours Été 2024"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="campaign-description">Description (optionnel)</Label>
                    <Textarea
                      id="campaign-description"
                      placeholder="Décrivez l'objectif de votre campagne..."
                      value={campaignData.description}
                      onChange={(e) => setCampaignData({...campaignData, description: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Paramètres d'envoi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Messages par jour</Label>
                      <Input 
                        type="number" 
                        value={campaignData.settings.actionsPerDay}
                        onChange={(e) => setCampaignData({
                          ...campaignData,
                          settings: {
                            ...campaignData.settings,
                            actionsPerDay: parseInt(e.target.value) || 50
                          }
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Nombre maximum de messages par jour (recommandé: 20-50)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Délai entre messages (minutes)</Label>
                      <Input 
                        type="number"
                        value={campaignData.settings.delayBetweenMessages}
                        onChange={(e) => setCampaignData({
                          ...campaignData,
                          settings: {
                            ...campaignData.settings,
                            delayBetweenMessages: parseInt(e.target.value) || 60
                          }
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Délai entre chaque message pour un engagement naturel
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Séquence de messages</CardTitle>
                  <CardDescription>
                    Créez une séquence de messages personnalisés avec des délais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaignData.messages.map((message, index) => (
                    <Card key={message.id} className="border-2 border-dashed border-muted">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Message {index + 1}
                            {index === 0 && <Badge variant="outline" className="ml-2">Premier message</Badge>}
                          </CardTitle>
                          {campaignData.messages.length > 1 && index > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMessage(message.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {index > 0 && (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Délai avant envoi (minutes) - Optionnel
                            </Label>
                            <Input 
                              type="number"
                              placeholder="60"
                              value={message.delay}
                              onChange={(e) => updateMessage(message.id, 'delay', parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Temps d'attente avant l'envoi de ce message
                            </p>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label>Contenu du message</Label>
                          <Textarea
                            placeholder="Salut {prenom:ami} ! Merci pour ton interaction..."
                            value={message.content}
                            onChange={(e) => updateMessage(message.id, 'content', e.target.value)}
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Utilisez {`{prenom:ami}`} pour personnaliser avec une valeur par défaut
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addMessage}
                    className="w-full border-2 border-dashed border-primary/50 text-primary hover:bg-primary/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un message
                  </Button>
                </CardContent>
              </Card>

              {selectedType === 'contest_management' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      Message pour le gagnant
                    </CardTitle>
                    <CardDescription>
                      Message envoyé automatiquement au gagnant du tirage au sort
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Message de félicitations</Label>
                      <Textarea
                        placeholder="🎉 Félicitations {prenom:participant} ! Tu as gagné notre jeu concours..."
                        value={campaignData.winnerMessage}
                        onChange={(e) => setCampaignData({
                          ...campaignData,
                          winnerMessage: e.target.value
                        })}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ce message sera envoyé automatiquement après le tirage au sort
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {availableFields.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Champs de personnalisation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {availableFields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {`{${field}}`}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Utilisez la syntaxe {`{champ:valeur_par_defaut}`} pour personnaliser vos messages
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Révision et lancement</h2>
              <p className="text-muted-foreground">
                Vérifiez les paramètres de votre campagne avant le lancement
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Résumé de la campagne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nom</Label>
                    <p className="text-sm text-muted-foreground">{campaignData.name || 'Non défini'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {campaignTypes.find(t => t.id === selectedType)?.title || 'Non sélectionné'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Audience</Label>
                    <p className="text-sm text-muted-foreground">
                      {getAudienceOptions().find(o => o.value === campaignData.audience.type)?.label || 'Non sélectionnée'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Messages/jour</Label>
                    <p className="text-sm text-muted-foreground">{campaignData.settings.actionsPerDay}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaignData.description || 'Aucune description fournie'}
                  </p>
                </div>

                {campaignData.audience.csvAccounts && campaignData.audience.csvAccounts.length > 0 && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium">Comptes ciblés</Label>
                    <div className="flex items-center gap-3 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{campaignData.audience.csvAccounts.length} comptes importés</p>
                        <p className="text-sm text-muted-foreground">
                          Comptes qui suivent ou sont amis avec votre compte business
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Séquence de messages</Label>
                  <div className="mt-2 space-y-2">
                    {campaignData.messages.map((message, index) => (
                      <div key={message.id} className="p-3 bg-muted rounded text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <strong>Message {index + 1}</strong>
                          {index > 0 && message.delay > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              +{message.delay}min
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {message.content.substring(0, 100)}
                          {message.content.length > 100 && '...'}
                        </p>
                      </div>
                    ))}
                    
                    {campaignData.winnerMessage && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <strong className="text-yellow-800">Message gagnant</strong>
                        </div>
                        <p className="text-yellow-700">
                          {campaignData.winnerMessage.substring(0, 100)}
                          {campaignData.winnerMessage.length > 100 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedType === 'contest_management' && (
                  <div className="pt-4 border-t">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Fonctionnalité Jeu Concours</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Cette campagne inclut un système de tirage au sort. Vous pourrez lancer le tirage 
                        directement depuis l'interface de la campagne une fois qu'elle sera active.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🚀 Prêt pour le lancement !</h4>
              <p className="text-sm text-blue-700">
                Votre campagne sera sauvegardée en brouillon. 
                {campaignData.audience.csvAccounts.length > 0 && ` ${campaignData.audience.csvAccounts.length} comptes ont été importés et sont prêts pour l'engagement.`}
                Vous pourrez la lancer, la modifier ou la supprimer depuis le tableau de bord.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Créer une nouvelle campagne</h1>
        <p className="text-muted-foreground">
          Suivez l'assistant pour configurer votre campagne d'engagement
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Étape {currentStep} sur {steps.length}</span>
          <span>{Math.round(progress)}% complété</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        
        {currentStep === steps.length ? (
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleCreateCampaign}
            disabled={isLoading || !campaignData.name || !selectedType || !campaignData.audience.type}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Créer la campagne
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={nextStep}
            disabled={
              (currentStep === 1 && !selectedType) ||
              (currentStep === 2 && !campaignData.audience.type) ||
              (currentStep === 2 && campaignData.audience.type === 'csv_followers' && campaignData.audience.csvAccounts.length === 0)
            }
          >
            Suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}