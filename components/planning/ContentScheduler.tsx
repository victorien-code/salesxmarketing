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
  Calendar,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Instagram,
  Image as ImageIcon,
  Video,
  FileText,
  Eye,
  Edit,
  Trash2,
  Copy,
  Send,
  CalendarDays,
  Grid3X3,
  List,
  Upload,
  X,
  Save,
  RefreshCw,
  Download,
  Settings,
  Users,
  Hash,
  AtSign,
  MapPin,
  Link as LinkIcon,
  Zap,
  Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { getAllInstagramAccounts } from '@/lib/instagram';
import { 
  createScheduledPost,
  getUserScheduledPosts,
  updateScheduledPost,
  deleteScheduledPost,
  duplicateScheduledPost,
  publishScheduledPost,
  ScheduledPost,
  PostStatus,
  PostType,
  MediaFile
} from '@/lib/scheduling';
import ContentPostDialog from './ContentPostDialog';
import ContentCalendarView from './ContentCalendarView';

interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profilePicture?: string;
  accountType?: string;
}

export default function ContentScheduler() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<ScheduledPost[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'calendar'>('table');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, statusFilter, accountFilter]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Charger les comptes Instagram et les posts planifiés en parallèle
      const [accountsData, userPosts] = await Promise.all([
        getAllInstagramAccounts(user.uid),
        getUserScheduledPosts(user.uid)
      ]);

      // Transformer les données des comptes
      const accounts: InstagramAccount[] = Object.entries(accountsData).map(([id, data]) => ({
        id,
        username: data.accountInfo?.username || 'Compte inconnu',
        name: data.accountInfo?.name,
        profilePicture: data.accountInfo?.profile_picture_url,
        accountType: data.accountInfo?.account_type
      }));

      setInstagramAccounts(accounts);
      setPosts(userPosts);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Impossible de charger les données de planification');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Filtrer par compte
    if (accountFilter !== 'all') {
      filtered = filtered.filter(post => post.instagramAccountId === accountFilter);
    }

    setFilteredPosts(filtered);
  };

  const handleCreatePost = async (postData: Omit<ScheduledPost, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const newPost = await createScheduledPost(user.uid, postData);
      setPosts(prev => [newPost, ...prev]);
      setShowCreateDialog(false);
    } catch (error: any) {
      console.error('Erreur lors de la création du post:', error);
      setError('Impossible de créer le post planifié');
    }
  };

  const handleUpdatePost = async (postId: string, updates: Partial<ScheduledPost>) => {
    try {
      await updateScheduledPost(postId, updates);
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      ));
      setEditingPost(null);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du post:', error);
      setError('Impossible de mettre à jour le post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post planifié ?')) return;

    try {
      await deleteScheduledPost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error: any) {
      console.error('Erreur lors de la suppression du post:', error);
      setError('Impossible de supprimer le post');
    }
  };

  const handleDuplicatePost = async (post: ScheduledPost) => {
    try {
      const duplicatedPost = await duplicateScheduledPost(post.id);
      setPosts(prev => [duplicatedPost, ...prev]);
    } catch (error: any) {
      console.error('Erreur lors de la duplication du post:', error);
      setError('Impossible de dupliquer le post');
    }
  };

  const handlePublishPost = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir publier ce post maintenant ?')) return;

    try {
      await publishScheduledPost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, status: 'published' as PostStatus, publishedAt: new Date() }
          : post
      ));
    } catch (error: any) {
      console.error('Erreur lors de la publication du post:', error);
      setError('Impossible de publier le post');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPosts.length === 0) return;

    try {
      switch (bulkAction) {
        case 'delete':
          if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedPosts.length} post(s) ?`)) return;
          
          await Promise.all(selectedPosts.map(postId => deleteScheduledPost(postId)));
          setPosts(prev => prev.filter(post => !selectedPosts.includes(post.id)));
          break;

        case 'draft':
          await Promise.all(selectedPosts.map(postId => 
            updateScheduledPost(postId, { status: 'draft' as PostStatus })
          ));
          setPosts(prev => prev.map(post => 
            selectedPosts.includes(post.id) 
              ? { ...post, status: 'draft' as PostStatus }
              : post
          ));
          break;

        case 'scheduled':
          await Promise.all(selectedPosts.map(postId => 
            updateScheduledPost(postId, { status: 'scheduled' as PostStatus })
          ));
          setPosts(prev => prev.map(post => 
            selectedPosts.includes(post.id) 
              ? { ...post, status: 'scheduled' as PostStatus }
              : post
          ));
          break;
      }

      setSelectedPosts([]);
      setBulkAction('');
    } catch (error: any) {
      console.error('Erreur lors de l\'action groupée:', error);
      setError('Impossible d\'effectuer l\'action groupée');
    }
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const selectAllPosts = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(post => post.id));
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    const variants = {
      draft: { variant: 'outline' as const, label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
      scheduled: { variant: 'default' as const, label: 'Planifié', color: 'bg-blue-100 text-blue-800' },
      published: { variant: 'secondary' as const, label: 'Publié', color: 'bg-green-100 text-green-800' },
      failed: { variant: 'destructive' as const, label: 'Échec', color: 'bg-red-100 text-red-800' },
    };
    
    const config = variants[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: PostType) => {
    const icons = {
      image: ImageIcon,
      video: Video,
      carousel: Grid3X3,
      story: Zap,
    };
    return icons[type] || FileText;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccountInfo = (accountId: string) => {
    return instagramAccounts.find(acc => acc.id === accountId);
  };

  const statusCounts = {
    all: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
    failed: posts.filter(p => p.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Planification de contenu</h1>
          <p className="text-muted-foreground">
            Planifiez et gérez vos publications Instagram avec notre système avancé
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau post
          </Button>
        </div>
      </div>

      {/* Erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(status as any)}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {status === 'all' ? 'Total' : 
                 status === 'draft' ? 'Brouillons' :
                 status === 'scheduled' ? 'Planifiés' :
                 status === 'published' ? 'Publiés' :
                 status === 'failed' ? 'Échecs' : status}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres et actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="scheduled">Planifiés</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="failed">Échecs</SelectItem>
                </SelectContent>
              </Select>

              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Compte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les comptes</SelectItem>
                  {instagramAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      @{account.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modes d'affichage */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Actions groupées */}
          {selectedPosts.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedPosts.length} post(s) sélectionné(s)
              </span>
              
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Action groupée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Marquer comme brouillon</SelectItem>
                  <SelectItem value="scheduled">Marquer comme planifié</SelectItem>
                  <SelectItem value="delete">Supprimer</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={handleBulkAction}
                disabled={!bulkAction}
                variant="outline"
              >
                Appliquer
              </Button>

              <Button 
                onClick={() => setSelectedPosts([])}
                variant="ghost"
                size="sm"
              >
                Annuler
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contenu principal */}
      {viewMode === 'calendar' ? (
        <ContentCalendarView 
          posts={filteredPosts}
          onEditPost={setEditingPost}
          onDeletePost={handleDeletePost}
          onDuplicatePost={handleDuplicatePost}
          onPublishPost={handlePublishPost}
          getAccountInfo={getAccountInfo}
        />
      ) : viewMode === 'grid' ? (
        /* Vue grille */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPosts.map((post) => {
            const TypeIcon = getTypeIcon(post.type);
            const account = getAccountInfo(post.instagramAccountId);
            
            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedPosts.includes(post.id)}
                        onCheckedChange={() => togglePostSelection(post.id)}
                      />
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingPost(post)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePost(post)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Dupliquer
                        </DropdownMenuItem>
                        {post.status === 'scheduled' && (
                          <DropdownMenuItem onClick={() => handlePublishPost(post.id)}>
                            <Send className="mr-2 h-4 w-4" />
                            Publier maintenant
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Aperçu du média */}
                  {post.mediaFiles && post.mediaFiles.length > 0 && (
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                      {post.mediaFiles[0].type === 'image' ? (
                        <img 
                          src={post.mediaFiles[0].url} 
                          alt={post.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Video className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                    
                    {account && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={account.profilePicture || ''} />
                          <AvatarFallback>
                            {account.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">@{account.username}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(post.scheduledDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Vue tableau */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                        onCheckedChange={selectAllPosts}
                      />
                    </th>
                    <th className="text-left p-4 font-medium">Titre</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Compte</th>
                    <th className="text-left p-4 font-medium">Date de publication</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Relecture</th>
                    <th className="text-left p-4 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucun post planifié trouvé</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowCreateDialog(true)}
                        >
                          Créer votre premier post
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => {
                      const TypeIcon = getTypeIcon(post.type);
                      const account = getAccountInfo(post.instagramAccountId);
                      
                      return (
                        <tr key={post.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedPosts.includes(post.id)}
                              onCheckedChange={() => togglePostSelection(post.id)}
                            />
                          </td>
                          
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="font-medium">{post.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {post.content}
                              </div>
                              {post.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {post.hashtags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                  {post.hashtags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{post.hashtags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm capitalize">{post.type}</span>
                              {post.mediaFiles && post.mediaFiles.length > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  {post.mediaFiles.length} fichiers
                                </Badge>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            {account ? (
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={account.profilePicture || ''} />
                                  <AvatarFallback>
                                    {account.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium">@{account.username}</div>
                                  {account.accountType && (
                                    <div className="text-xs text-muted-foreground">{account.accountType}</div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Compte supprimé</span>
                            )}
                          </td>
                          
                          <td className="p-4">
                            <div className="text-sm">
                              <div>{formatDate(post.scheduledDate)}</div>
                              {post.status === 'published' && post.publishedAt && (
                                <div className="text-xs text-green-600">
                                  Publié le {formatDate(post.publishedAt)}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            {getStatusBadge(post.status)}
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={post.isReviewed}
                                onCheckedChange={(checked) => 
                                  handleUpdatePost(post.id, { isReviewed: checked as boolean })
                                }
                              />
                              <span className="text-sm text-muted-foreground">
                                {post.isReviewed ? 'Relu' : 'À relire'}
                              </span>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingPost(post)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicatePost(post)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Dupliquer
                                </DropdownMenuItem>
                                {post.status === 'scheduled' && (
                                  <DropdownMenuItem onClick={() => handlePublishPost(post.id)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Publier maintenant
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ContentPostDialog
        open={showCreateDialog || !!editingPost}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingPost(null);
          }
        }}
        post={editingPost}
        instagramAccounts={instagramAccounts}
        onSave={editingPost ? 
          (updates) => handleUpdatePost(editingPost.id, updates) :
          handleCreatePost
        }
      />
    </div>
  );
}