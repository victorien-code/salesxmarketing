'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Filter, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Instagram,
  ExternalLink,
  Archive,
  Star,
  Reply,
  Forward,
  Trash2,
  RefreshCw,
  Info,
  Plus,
  User,
  AtSign,
  AlertTriangle,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { hasInstagramToken } from '@/lib/instagram';
import { 
  getUserMessageThreads,
  getThreadMessages,
  sendAndSaveMessage,
  syncConversationsWithFirebase,
  toggleThreadStar,
  archiveThread,
  markThreadAsRead,
  MessageThread,
  InstagramMessage,
  sendDirectMessage
} from '@/lib/messaging';
import Link from 'next/link';

export default function MessagingInterface() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<InstagramMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [indexWarning, setIndexWarning] = useState(false);
  const [apiWarning, setApiWarning] = useState(false);
  
  // États pour l'envoi direct
  const [directRecipient, setDirectRecipient] = useState('');
  const [directMessage, setDirectMessage] = useState('');
  const [sendingDirect, setSendingDirect] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    const initializeMessaging = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError('');
        
        // Vérifier le token Instagram
        const tokenExists = await hasInstagramToken(user.uid);
        setHasToken(tokenExists);
        
        if (tokenExists) {
          // Charger les conversations depuis Firebase
          await loadThreads();
        }
      } catch (error: any) {
        console.error('Erreur lors de l\'initialisation:', error);
        setError('Impossible de charger les conversations');
      } finally {
        setLoading(false);
      }
    };

    initializeMessaging();
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
      
      // Marquer comme lu si il y a des messages non lus
      if (selectedThread.unreadCount > 0) {
        handleMarkAsRead(selectedThread.id);
      }
    }
  }, [selectedThread]);

  // Effacer les messages de succès après 5 secondes
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadThreads = async () => {
    if (!user) return;

    try {
      setError('');
      const userThreads = await getUserMessageThreads(user.uid);
      setThreads(userThreads);
      setIndexWarning(false);
      
      // Vérifier si des threads sont simulés
      const hasSimulatedThreads = userThreads.some(thread => thread.isSimulated);
      if (hasSimulatedThreads) {
        setApiWarning(true);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des threads:', error);
      
      // Vérifier si c'est une erreur d'index
      if (error.message?.includes('index') || error.code === 'failed-precondition') {
        setIndexWarning(true);
        setError('Index Firestore manquant - les conversations sont triées côté client');
      } else {
        setError('Impossible de charger les conversations');
      }
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const threadMessages = await getThreadMessages(threadId);
      setMessages(threadMessages);
    } catch (error: any) {
      console.error('Erreur lors du chargement des messages:', error);
      setError('Impossible de charger les messages');
    }
  };

  const handleSyncConversations = async () => {
    if (!user || syncing) return;

    setSyncing(true);
    setError('');
    setApiWarning(false);

    try {
      // Synchroniser avec l'API Meta
      await syncConversationsWithFirebase(user.uid);
      
      // Recharger les threads
      await loadThreads();
      
      setSuccessMessage('Conversations synchronisées avec succès !');
      setError('');
    } catch (error: any) {
      console.error('Erreur lors de la synchronisation:', error);
      setError('Erreur lors de la synchronisation avec Instagram');
    } finally {
      setSyncing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || sending || !user) return;

    setSending(true);
    setError('');
    
    try {
      const message = await sendAndSaveMessage(
        user.uid,
        selectedThread.id,
        selectedThread.participant.id,
        newMessage.trim()
      );

      // Ajouter le message à la liste locale
      setMessages(prev => [...prev, message]);
      
      // Mettre à jour le thread local
      setThreads(prev => prev.map(thread => 
        thread.id === selectedThread.id 
          ? { 
              ...thread, 
              lastMessage: message,
              updatedAt: new Date()
            }
          : thread
      ));
      
      setNewMessage('');
      
      // Afficher un message de succès si le message est simulé
      if (message.isSimulated) {
        setSuccessMessage('Message envoyé en mode simulation (API Instagram non disponible)');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError('Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const handleSendDirectMessage = async () => {
    if (!directMessage.trim() || !directRecipient.trim() || sendingDirect || !user) return;

    setSendingDirect(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Nettoyer le nom d'utilisateur (enlever @ si présent)
      const cleanRecipient = directRecipient.replace('@', '').trim();
      
      const message = await sendDirectMessage(
        user.uid,
        cleanRecipient,
        directMessage.trim()
      );

      // Réinitialiser le formulaire
      setDirectRecipient('');
      setDirectMessage('');
      
      // Afficher un message de succès
      if (message.isSimulated) {
        setSuccessMessage(`Message envoyé à @${cleanRecipient} en mode simulation ! L'API Instagram actuelle ne supporte pas l'envoi de messages directs avec votre type de compte.`);
      } else {
        setSuccessMessage(`Message envoyé avec succès à @${cleanRecipient} !`);
      }
      
      setError('');
      
      // Optionnel : recharger les conversations pour voir le nouveau thread
      await loadThreads();
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message direct:', error);
      
      // Afficher des messages d'erreur plus informatifs
      if (error.message.includes('connexion')) {
        setError('Erreur de connexion. Vérifiez votre connexion internet et réessayez.');
      } else if (error.message.includes('Token')) {
        setError('Votre token Instagram a expiré. Veuillez reconnecter votre compte Instagram.');
      } else if (error.message.includes('API')) {
        setError('L\'API Instagram ne supporte pas cette fonctionnalité avec votre type de compte. Un compte Instagram Business connecté à une page Facebook est requis.');
      } else {
        setError(`Impossible d'envoyer le message: ${error.message}`);
      }
    } finally {
      setSendingDirect(false);
    }
  };

  const handleToggleStar = async (threadId: string, isStarred: boolean) => {
    try {
      await toggleThreadStar(threadId, isStarred);
      
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, isStarred: !isStarred }
          : thread
      ));
      
      if (selectedThread?.id === threadId) {
        setSelectedThread(prev => prev ? { ...prev, isStarred: !isStarred } : null);
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du favori:', error);
      setError('Impossible de mettre à jour le favori');
    }
  };

  const handleArchiveThread = async (threadId: string) => {
    try {
      await archiveThread(threadId);
      
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, isArchived: true }
          : thread
      ));
      
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'archivage:', error);
      setError('Impossible d\'archiver la conversation');
    }
  };

  const handleMarkAsRead = async (threadId: string) => {
    try {
      await markThreadAsRead(threadId);
      
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, unreadCount: 0 }
          : thread
      ));
    } catch (error: any) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const filteredThreads = threads.filter(thread => {
    if (filter === 'unread' && thread.unreadCount === 0) return false;
    if (filter === 'starred' && !thread.isStarred) return false;
    if (filter === 'archived' && !thread.isArchived) return false;
    if (filter !== 'archived' && thread.isArchived) return false;
    
    if (searchTerm) {
      return thread.participant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
             thread.participant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             thread.lastMessage.message.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasToken) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Messagerie Instagram</h1>
          <p className="text-muted-foreground">
            Consultez et gérez tous vos messages Instagram depuis une interface unifiée
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Compte Instagram non connecté !</strong> Vous devez connecter votre compte Instagram 
              pour accéder à votre messagerie.
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Messagerie Instagram</h1>
          <p className="text-muted-foreground">
            Consultez et répondez à vos messages directs Instagram
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <Badge variant="destructive">
              {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSyncConversations}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Synchroniser
          </Button>
        </div>
      </div>

      {/* Avertissement API Instagram */}
      {apiWarning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Mode simulation activé :</strong> L'API Instagram Basic Display ne supporte pas l'envoi de messages. 
            Pour une fonctionnalité complète, vous devez utiliser un compte Instagram Business connecté à une page Facebook 
            avec l'API Instagram Graph.
            <a 
              href="https://developers.facebook.com/docs/instagram-api/guides/messaging"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              En savoir plus →
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Avertissement index Firestore */}
      {indexWarning && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Index Firestore manquant :</strong> Pour optimiser les performances, créez l'index composite 
            requis dans la console Firebase. Les conversations sont actuellement triées côté client.
            <a 
              href="https://console.firebase.google.com/v1/r/project/salesxmarketing-56f8f/firestore/indexes?create_composite=Cl1wcm9qZWN0cy9zYWxlc3htYXJrZXRpbmctNTZmOGYvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL21lc3NhZ2VfdGhyZWFkcy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgl1cGRhdGVkQXQQAhoMCghfX25hbWVfXxAC"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Créer l'index →
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Message de succès */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Erreurs */}
      {error && !indexWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversations
            {totalUnread > 0 && (
              <Badge variant="destructive" className="text-xs">
                {totalUnread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau message
          </TabsTrigger>
        </TabsList>

        {/* Onglet Conversations */}
        <TabsContent value="conversations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Liste des conversations */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Badge variant="secondary">{filteredThreads.length}</Badge>
                </div>
                
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Filtres */}
                <div className="flex gap-1">
                  {[
                    { key: 'all', label: 'Toutes' },
                    { key: 'unread', label: 'Non lues' },
                    { key: 'starred', label: 'Favorites' },
                    { key: 'archived', label: 'Archivées' }
                  ].map((filterOption) => (
                    <Button
                      key={filterOption.key}
                      variant={filter === filterOption.key ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter(filterOption.key as any)}
                      className="text-xs"
                    >
                      {filterOption.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="max-h-[450px] overflow-y-auto">
                  {filteredThreads.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Aucune conversation trouvée</p>
                      {threads.length === 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={handleSyncConversations}
                          disabled={syncing}
                        >
                          {syncing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Synchroniser avec Instagram
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredThreads.map((thread) => (
                        <div
                          key={thread.id}
                          className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                            selectedThread?.id === thread.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedThread(thread)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={thread.participant.profilePicture} />
                            <AvatarFallback>
                              {thread.participant.name?.split(' ').map(n => n[0]).join('') || 
                               thread.participant.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm truncate">
                                  {thread.participant.name || `@${thread.participant.username}`}
                                </span>
                                {thread.participant.isVerified && (
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                )}
                                {thread.isStarred && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                )}
                                {thread.isSimulated && (
                                  <Zap className="h-3 w-3 text-orange-500" title="Mode simulation" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {thread.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {thread.unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(thread.updatedAt)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {thread.lastMessage.isFromMe && (
                                <span className="text-primary">Vous: </span>
                              )}
                              {thread.lastMessage.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Zone de conversation */}
            <Card className="lg:col-span-2">
              {selectedThread ? (
                <>
                  {/* Header de la conversation */}
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedThread.participant.profilePicture} />
                          <AvatarFallback>
                            {selectedThread.participant.name?.split(' ').map(n => n[0]).join('') || 
                             selectedThread.participant.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">
                              {selectedThread.participant.name || `@${selectedThread.participant.username}`}
                            </h3>
                            {selectedThread.participant.isVerified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                            {selectedThread.isSimulated && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Simulation
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            @{selectedThread.participant.username}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleStar(selectedThread.id, selectedThread.isStarred)}>
                            <Star className="mr-2 h-4 w-4" />
                            {selectedThread.isStarred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveThread(selectedThread.id)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archiver
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a 
                              href={`https://instagram.com/${selectedThread.participant.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Voir le profil
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  {/* Messages */}
                  <CardContent className="p-0">
                    <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${message.isFromMe ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                message.isFromMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                            </div>
                            <div className={`flex items-center mt-1 space-x-2 ${
                              message.isFromMe ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {message.isFromMe && (
                                <div className="text-xs text-muted-foreground">
                                  {message.isRead ? (
                                    <CheckCircle className="h-3 w-3 text-blue-500" />
                                  ) : (
                                    <Clock className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                              {message.isSimulated && (
                                <Zap className="h-3 w-3 text-orange-500" title="Message simulé" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Zone de saisie */}
                    <div className="border-t p-4">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Tapez votre message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="resize-none"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                          className="self-end"
                        >
                          {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
                      </p>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
                    <p>Choisissez une conversation dans la liste pour commencer à échanger</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Nouveau message */}
        <TabsContent value="compose" className="space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Envoyer un nouveau message
              </CardTitle>
              <CardDescription>
                Envoyez un message direct à n'importe quel utilisateur Instagram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Destinataire */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Destinataire</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="recipient"
                    placeholder="nom_utilisateur (sans @)"
                    className="pl-10"
                    value={directRecipient}
                    onChange={(e) => setDirectRecipient(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrez le nom d'utilisateur Instagram sans le symbole @
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tapez votre message..."
                  value={directMessage}
                  onChange={(e) => setDirectMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rédigez un message personnel et engageant</span>
                  <span>{directMessage.length}/1000</span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDirectRecipient('');
                    setDirectMessage('');
                  }}
                  disabled={sendingDirect}
                >
                  Effacer
                </Button>
                
                <Button 
                  onClick={handleSendDirectMessage}
                  disabled={!directMessage.trim() || !directRecipient.trim() || sendingDirect}
                  className="flex items-center gap-2"
                >
                  {sendingDirect ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </div>

              {/* Conseils */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Conseils pour un message efficace :</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Personnalisez votre message en mentionnant quelque chose de spécifique au profil</li>
                    <li>Soyez authentique et évitez les messages trop commerciaux</li>
                    <li>Proposez une valeur ou un bénéfice clair</li>
                    <li>Gardez un ton amical et professionnel</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informations sur l'API */}
      <Alert>
        <Instagram className="h-4 w-4" />
        <AlertDescription>
          <strong>Note :</strong> Cette interface utilise l'API Instagram pour récupérer et envoyer 
          vos messages directs. En mode simulation, les messages sont sauvegardés localement mais ne sont pas 
          réellement envoyés via Instagram. Pour une fonctionnalité complète, un compte Instagram Business 
          avec l'API Graph est requis.
        </AlertDescription>
      </Alert>
    </div>
  );
}