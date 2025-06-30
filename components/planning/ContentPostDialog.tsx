'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar,
  Clock,
  Upload,
  X,
  Save,
  Image as ImageIcon,
  Video,
  Grid3X3,
  Zap,
  Hash,
  AtSign,
  MapPin,
  Link as LinkIcon,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ScheduledPost, PostType, PostStatus, MediaFile } from '@/lib/scheduling';

interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profilePicture?: string;
  accountType?: string;
}

interface ContentPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: ScheduledPost | null;
  instagramAccounts: InstagramAccount[];
  onSave: (postData: any) => void;
}

export default function ContentPostDialog({
  open,
  onOpenChange,
  post,
  instagramAccounts,
  onSave
}: ContentPostDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'image' as PostType,
    instagramAccountId: '',
    scheduledDate: '',
    status: 'draft' as PostStatus,
    hashtags: [] as string[],
    mentions: [] as string[],
    location: '',
    link: '',
    isReviewed: false,
    mediaFiles: [] as MediaFile[]
  });
  
  const [hashtagInput, setHashtagInput] = useState('');
  const [mentionInput, setMentionInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (post) {
      // Mode édition
      setFormData({
        title: post.title,
        content: post.content,
        type: post.type,
        instagramAccountId: post.instagramAccountId,
        scheduledDate: new Date(post.scheduledDate).toISOString().slice(0, 16),
        status: post.status,
        hashtags: post.hashtags,
        mentions: post.mentions || [],
        location: post.location || '',
        link: post.link || '',
        isReviewed: post.isReviewed,
        mediaFiles: post.mediaFiles || []
      });
    } else {
      // Mode création
      resetForm();
    }
  }, [post, open]);

  const resetForm = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Par défaut dans 1 heure
    
    setFormData({
      title: '',
      content: '',
      type: 'image',
      instagramAccountId: instagramAccounts[0]?.id || '',
      scheduledDate: now.toISOString().slice(0, 16),
      status: 'draft',
      hashtags: [],
      mentions: [],
      location: '',
      link: '',
      isReviewed: false,
      mediaFiles: []
    });
    setHashtagInput('');
    setMentionInput('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire';
    }

    if (!formData.instagramAccountId) {
      newErrors.instagramAccountId = 'Sélectionnez un compte Instagram';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'La date de publication est obligatoire';
    } else {
      const scheduledDate = new Date(formData.scheduledDate);
      const now = new Date();
      if (scheduledDate <= now && formData.status === 'scheduled') {
        newErrors.scheduledDate = 'La date de publication doit être dans le futur';
      }
    }

    if (formData.type !== 'story' && formData.mediaFiles.length === 0) {
      newErrors.mediaFiles = 'Au moins un fichier média est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const postData = {
        ...formData,
        scheduledDate: new Date(formData.scheduledDate),
        hashtags: formData.hashtags.filter(tag => tag.trim()),
        mentions: formData.mentions.filter(mention => mention.trim())
      };

      await onSave(postData);
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !formData.hashtags.includes(hashtagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtagInput.trim()]
      }));
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(t => t !== tag)
    }));
  };

  const addMention = () => {
    if (mentionInput.trim() && !formData.mentions.includes(mentionInput.trim())) {
      setFormData(prev => ({
        ...prev,
        mentions: [...prev.mentions, mentionInput.trim()]
      }));
      setMentionInput('');
    }
  };

  const removeMention = (mention: string) => {
    setFormData(prev => ({
      ...prev,
      mentions: prev.mentions.filter(m => m !== mention)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaFile: MediaFile = {
          id: Date.now().toString(),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: e.target?.result as string,
          filename: file.name,
          size: file.size
        };
        
        setFormData(prev => ({
          ...prev,
          mediaFiles: [...prev.mediaFiles, mediaFile]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaFile = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter(f => f.id !== fileId)
    }));
  };

  const getTypeIcon = (type: PostType) => {
    const icons = {
      image: ImageIcon,
      video: Video,
      carousel: Grid3X3,
      story: Zap,
    };
    return icons[type];
  };

  const selectedAccount = instagramAccounts.find(acc => acc.id === formData.instagramAccountId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {post ? 'Modifier le post' : 'Créer un nouveau post'}
          </DialogTitle>
          <DialogDescription>
            Planifiez votre publication Instagram avec tous les détails nécessaires
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne gauche - Formulaire */}
          <div className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du post *</Label>
                <Input
                  id="title"
                  placeholder="Titre descriptif pour votre post"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu du post *</Label>
                <Textarea
                  id="content"
                  placeholder="Rédigez le contenu de votre publication..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className={errors.content ? 'border-red-500' : ''}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rédigez un contenu engageant</span>
                  <span>{formData.content.length}/2200</span>
                </div>
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content}</p>
                )}
              </div>
            </div>

            {/* Type et compte */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de publication</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as PostType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Image
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Vidéo
                      </div>
                    </SelectItem>
                    <SelectItem value="carousel">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4" />
                        Carrousel
                      </div>
                    </SelectItem>
                    <SelectItem value="story">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Story
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Compte Instagram</Label>
                <Select value={formData.instagramAccountId} onValueChange={(value) => setFormData(prev => ({ ...prev, instagramAccountId: value }))}>
                  <SelectTrigger className={errors.instagramAccountId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Sélectionner un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {instagramAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={account.profilePicture || ''} />
                            <AvatarFallback>
                              {account.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          @{account.username}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.instagramAccountId && (
                  <p className="text-sm text-red-500">{errors.instagramAccountId}</p>
                )}
              </div>
            </div>

            {/* Date et statut */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Date de publication *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className={errors.scheduledDate ? 'border-red-500' : ''}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-red-500">{errors.scheduledDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PostStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="scheduled">Planifié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <Label>Hashtags</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ajouter_hashtag"
                    className="pl-10"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHashtag();
                      }
                    }}
                  />
                </div>
                <Button type="button" onClick={addHashtag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeHashtag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Mentions */}
            <div className="space-y-2">
              <Label>Mentions</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="nom_utilisateur"
                    className="pl-10"
                    value={mentionInput}
                    onChange={(e) => setMentionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMention();
                      }
                    }}
                  />
                </div>
                <Button type="button" onClick={addMention} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.mentions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.mentions.map((mention, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      @{mention}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeMention(mention)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Localisation et lien */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Paris, France"
                    className="pl-10"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Lien</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="link"
                    placeholder="https://..."
                    className="pl-10"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Post relu et validé</Label>
                  <p className="text-sm text-muted-foreground">
                    Marquer ce post comme relu et prêt à publier
                  </p>
                </div>
                <Switch
                  checked={formData.isReviewed}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isReviewed: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Colonne droite - Médias et aperçu */}
          <div className="space-y-6">
            {/* Upload de médias */}
            <div className="space-y-4">
              <Label>Fichiers médias</Label>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir des fichiers
                    </Button>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Images et vidéos acceptées (max 10MB par fichier)
                    </p>
                  </div>
                </div>
              </div>

              {errors.mediaFiles && (
                <p className="text-sm text-red-500">{errors.mediaFiles}</p>
              )}

              {/* Aperçu des médias */}
              {formData.mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {formData.mediaFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        {file.type === 'image' ? (
                          <img 
                            src={file.url} 
                            alt={file.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMediaFile(file.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {file.filename}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aperçu du post */}
            <div className="space-y-4">
              <Label>Aperçu du post</Label>
              
              <div className="border rounded-lg p-4 bg-muted/30">
                {selectedAccount && (
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedAccount.profilePicture || ''} />
                      <AvatarFallback>
                        {selectedAccount.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">@{selectedAccount.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(formData.scheduledDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                )}

                {formData.mediaFiles.length > 0 && (
                  <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                    {formData.mediaFiles[0].type === 'image' ? (
                      <img 
                        src={formData.mediaFiles[0].url} 
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    {formData.mediaFiles.length > 1 && (
                      <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                        +{formData.mediaFiles.length - 1}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm">{formData.content || 'Votre contenu apparaîtra ici...'}</p>
                  
                  {formData.hashtags.length > 0 && (
                    <p className="text-sm text-blue-600">
                      {formData.hashtags.map(tag => `#${tag}`).join(' ')}
                    </p>
                  )}

                  {formData.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {formData.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
              disabled={isLoading}
            >
              Sauvegarder en brouillon
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {post ? 'Mettre à jour' : 'Créer le post'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}