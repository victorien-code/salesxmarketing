import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  addDoc 
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { getInstagramToken, getInstagramAccountInfo } from './instagram';

// Types pour la planification de contenu
export type PostType = 'image' | 'video' | 'carousel' | 'story';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  filename: string;
  size: number;
  width?: number;
  height?: number;
}

export interface ScheduledPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: PostType;
  status: PostStatus;
  instagramAccountId: string;
  scheduledDate: Date;
  publishedAt?: Date;
  mediaFiles?: MediaFile[];
  hashtags: string[];
  mentions?: string[];
  location?: string;
  link?: string;
  isReviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Métriques après publication
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  };
  // Informations de publication
  instagramPostId?: string;
  instagramPostUrl?: string;
  errorMessage?: string;
}

// Créer un nouveau post planifié
export const createScheduledPost = async (
  userId: string, 
  postData: Omit<ScheduledPost, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<ScheduledPost> => {
  try {
    const db = getFirebaseFirestore();
    const postsRef = collection(db, 'scheduled_posts');
    
    const newPost: Omit<ScheduledPost, 'id'> = {
      ...postData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(postsRef, {
      ...newPost,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      scheduledDate: Timestamp.fromDate(postData.scheduledDate)
    });

    return {
      ...newPost,
      id: docRef.id
    };
  } catch (error) {
    console.error('Erreur lors de la création du post planifié:', error);
    throw new Error('Impossible de créer le post planifié');
  }
};

// Récupérer tous les posts planifiés d'un utilisateur
export const getUserScheduledPosts = async (userId: string): Promise<ScheduledPost[]> => {
  try {
    const db = getFirebaseFirestore();
    const postsRef = collection(db, 'scheduled_posts');
    
    let querySnapshot;
    
    try {
      // Essayer d'abord avec l'index composite (userId + orderBy scheduledDate)
      const q = query(
        postsRef,
        where('userId', '==', userId),
        orderBy('scheduledDate', 'desc')
      );
      
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      // Si l'index composite n'existe pas, faire une requête simple et trier côté client
      console.warn('Index composite manquant, tri côté client:', indexError.message);
      
      const simpleQuery = query(
        postsRef,
        where('userId', '==', userId)
      );
      
      querySnapshot = await getDocs(simpleQuery);
    }
    
    const posts: ScheduledPost[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        ...data,
        id: doc.id,
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as ScheduledPost);
    });
    
    // Trier côté client par scheduledDate (décroissant)
    posts.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
    
    return posts;
  } catch (error) {
    console.error('Erreur lors de la récupération des posts planifiés:', error);
    throw new Error('Impossible de récupérer les posts planifiés');
  }
};

// Récupérer un post planifié spécifique
export const getScheduledPost = async (postId: string): Promise<ScheduledPost | null> => {
  try {
    const db = getFirebaseFirestore();
    const postRef = doc(db, 'scheduled_posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const data = postDoc.data();
      return {
        ...data,
        id: postDoc.id,
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as ScheduledPost;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du post planifié:', error);
    throw new Error('Impossible de récupérer le post planifié');
  }
};

// Mettre à jour un post planifié
export const updateScheduledPost = async (
  postId: string, 
  updates: Partial<ScheduledPost>
): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const postRef = doc(db, 'scheduled_posts', postId);
    
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Convertir les dates en Timestamp si nécessaire
    if (updates.scheduledDate) {
      updateData.scheduledDate = Timestamp.fromDate(updates.scheduledDate);
    }
    if (updates.publishedAt) {
      updateData.publishedAt = Timestamp.fromDate(updates.publishedAt);
    }

    await updateDoc(postRef, updateData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post planifié:', error);
    throw new Error('Impossible de mettre à jour le post planifié');
  }
};

// Supprimer un post planifié
export const deleteScheduledPost = async (postId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const postRef = doc(db, 'scheduled_posts', postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du post planifié:', error);
    throw new Error('Impossible de supprimer le post planifié');
  }
};

// Dupliquer un post planifié
export const duplicateScheduledPost = async (postId: string): Promise<ScheduledPost> => {
  try {
    const originalPost = await getScheduledPost(postId);
    if (!originalPost) {
      throw new Error('Post original non trouvé');
    }

    // Créer une copie avec une nouvelle date (1 heure plus tard)
    const newScheduledDate = new Date(originalPost.scheduledDate);
    newScheduledDate.setHours(newScheduledDate.getHours() + 1);

    const duplicatedPost = await createScheduledPost(originalPost.userId, {
      title: `${originalPost.title} (Copie)`,
      content: originalPost.content,
      type: originalPost.type,
      status: 'draft',
      instagramAccountId: originalPost.instagramAccountId,
      scheduledDate: newScheduledDate,
      mediaFiles: originalPost.mediaFiles,
      hashtags: [...originalPost.hashtags],
      mentions: originalPost.mentions ? [...originalPost.mentions] : [],
      location: originalPost.location,
      link: originalPost.link,
      isReviewed: false
    });

    return duplicatedPost;
  } catch (error) {
    console.error('Erreur lors de la duplication du post:', error);
    throw new Error('Impossible de dupliquer le post');
  }
};

// Publier un post Instagram via l'API Meta
export const publishToInstagram = async (
  accessToken: string, 
  post: ScheduledPost
): Promise<{ success: boolean; postId?: string; postUrl?: string; error?: string }> => {
  try {
    console.log('Publication sur Instagram...', post.title);

    // Préparer les données pour l'API Instagram
    const mediaData: any = {
      caption: `${post.content}\n\n${post.hashtags.map(tag => `#${tag}`).join(' ')}`,
      access_token: accessToken
    };

    // Ajouter la localisation si disponible
    if (post.location) {
      // Note: Pour la localisation, il faut d'abord rechercher l'ID de lieu via l'API
      // mediaData.location_id = locationId;
    }

    let mediaUrl = '';
    let mediaType = 'IMAGE';

    // Gérer les différents types de médias
    if (post.mediaFiles && post.mediaFiles.length > 0) {
      if (post.type === 'carousel' && post.mediaFiles.length > 1) {
        // Carrousel - créer plusieurs conteneurs de médias
        const mediaContainers = [];
        
        for (const mediaFile of post.mediaFiles) {
          const containerResponse = await fetch(
            `https://graph.instagram.com/me/media`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image_url: mediaFile.url,
                is_carousel_item: true,
                access_token: accessToken
              })
            }
          );

          if (!containerResponse.ok) {
            throw new Error('Erreur lors de la création du conteneur de média');
          }

          const containerData = await containerResponse.json();
          mediaContainers.push(containerData.id);
        }

        // Créer le conteneur de carrousel
        const carouselResponse = await fetch(
          `https://graph.instagram.com/me/media`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              media_type: 'CAROUSEL',
              children: mediaContainers.join(','),
              caption: mediaData.caption,
              access_token: accessToken
            })
          }
        );

        if (!carouselResponse.ok) {
          throw new Error('Erreur lors de la création du carrousel');
        }

        const carouselData = await carouselResponse.json();
        mediaUrl = carouselData.id;
        mediaType = 'CAROUSEL';
      } else {
        // Image ou vidéo simple
        const mediaFile = post.mediaFiles[0];
        mediaUrl = mediaFile.url;
        mediaType = mediaFile.type === 'video' ? 'VIDEO' : 'IMAGE';
        
        if (mediaFile.type === 'image') {
          mediaData.image_url = mediaUrl;
        } else {
          mediaData.video_url = mediaUrl;
        }
      }
    }

    // Créer le conteneur de média
    let mediaContainerId = '';
    
    if (post.type !== 'carousel' || !post.mediaFiles || post.mediaFiles.length === 1) {
      const containerResponse = await fetch(
        `https://graph.instagram.com/me/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mediaData)
        }
      );

      if (!containerResponse.ok) {
        const errorText = await containerResponse.text();
        console.error('Erreur API Instagram container:', errorText);
        throw new Error('Erreur lors de la création du conteneur de média');
      }

      const containerData = await containerResponse.json();
      mediaContainerId = containerData.id;
    } else {
      mediaContainerId = mediaUrl; // Pour les carrousels, on a déjà l'ID
    }

    // Publier le média
    const publishResponse = await fetch(
      `https://graph.instagram.com/me/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: mediaContainerId,
          access_token: accessToken
        })
      }
    );

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text();
      console.error('Erreur API Instagram publish:', errorText);
      throw new Error('Erreur lors de la publication');
    }

    const publishData = await publishResponse.json();
    const postId = publishData.id;
    const postUrl = `https://www.instagram.com/p/${postId}/`;

    console.log('Post publié avec succès:', postId);

    return {
      success: true,
      postId,
      postUrl
    };
  } catch (error: any) {
    console.error('Erreur lors de la publication sur Instagram:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Publier un post planifié maintenant
export const publishScheduledPost = async (postId: string): Promise<void> => {
  try {
    const post = await getScheduledPost(postId);
    if (!post) {
      throw new Error('Post non trouvé');
    }

    // Récupérer le token Instagram pour ce compte
    const accessToken = await getInstagramToken(post.userId);
    if (!accessToken) {
      throw new Error('Token Instagram non trouvé');
    }

    // Publier sur Instagram
    const result = await publishToInstagram(accessToken, post);

    if (result.success) {
      // Mettre à jour le post avec les informations de publication
      await updateScheduledPost(postId, {
        status: 'published',
        publishedAt: new Date(),
        instagramPostId: result.postId,
        instagramPostUrl: result.postUrl
      });
    } else {
      // Marquer comme échec
      await updateScheduledPost(postId, {
        status: 'failed',
        errorMessage: result.error
      });
      throw new Error(result.error || 'Erreur lors de la publication');
    }
  } catch (error: any) {
    console.error('Erreur lors de la publication du post planifié:', error);
    throw new Error(`Impossible de publier le post: ${error.message}`);
  }
};

// Récupérer les posts à publier (pour un système de cron)
export const getPostsToPublish = async (): Promise<ScheduledPost[]> => {
  try {
    const db = getFirebaseFirestore();
    const postsRef = collection(db, 'scheduled_posts');
    
    const now = new Date();
    
    const q = query(
      postsRef,
      where('status', '==', 'scheduled'),
      where('scheduledDate', '<=', Timestamp.fromDate(now))
    );
    
    const querySnapshot = await getDocs(q);
    const posts: ScheduledPost[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        ...data,
        id: doc.id,
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as ScheduledPost);
    });
    
    return posts;
  } catch (error) {
    console.error('Erreur lors de la récupération des posts à publier:', error);
    return [];
  }
};

// Récupérer les statistiques de planification
export const getSchedulingStats = async (userId: string): Promise<{
  total: number;
  draft: number;
  scheduled: number;
  published: number;
  failed: number;
  thisWeek: number;
  thisMonth: number;
}> => {
  try {
    const posts = await getUserScheduledPosts(userId);
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      total: posts.length,
      draft: posts.filter(p => p.status === 'draft').length,
      scheduled: posts.filter(p => p.status === 'scheduled').length,
      published: posts.filter(p => p.status === 'published').length,
      failed: posts.filter(p => p.status === 'failed').length,
      thisWeek: posts.filter(p => p.scheduledDate >= startOfWeek).length,
      thisMonth: posts.filter(p => p.scheduledDate >= startOfMonth).length
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      total: 0,
      draft: 0,
      scheduled: 0,
      published: 0,
      failed: 0,
      thisWeek: 0,
      thisMonth: 0
    };
  }
};

// Mettre à jour les métriques d'un post publié
export const updatePostMetrics = async (
  postId: string,
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  }
): Promise<void> => {
  try {
    await updateScheduledPost(postId, { metrics });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des métriques:', error);
    throw new Error('Impossible de mettre à jour les métriques');
  }
};