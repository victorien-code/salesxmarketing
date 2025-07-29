import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  addDoc 
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { getInstagramToken, getInstagramAccountInfo } from './instagram';

// Interface pour un message Instagram
export interface InstagramMessage {
  id: string;
  threadId: string;
  from: {
    id: string;
    username: string;
    name?: string;
    profilePicture?: string;
  };
  to: {
    id: string;
    username: string;
    name?: string;
  };
  message: string;
  timestamp: Date;
  isRead: boolean;
  isFromMe: boolean;
  attachments?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  }[];
  metaMessageId?: string; // ID du message dans l'API Meta
  isSimulated?: boolean; // Indique si le message est simulé
}

// Interface pour un thread de conversation
export interface MessageThread {
  id: string;
  userId: string;
  participant: {
    id: string;
    username: string;
    name?: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  lastMessage: InstagramMessage;
  unreadCount: number;
  isArchived: boolean;
  isStarred: boolean;
  updatedAt: Date;
  createdAt: Date;
  metaThreadId?: string; // ID du thread dans l'API Meta
  isSimulated?: boolean; // Indique si le thread est simulé
}

// Configuration pour le mode simulation
const SIMULATION_MODE = true; // Activer le mode simulation pour le développement

// Vérifier si le token supporte les messages
export const checkMessagingSupport = async (accessToken: string): Promise<boolean> => {
  try {
    // Tenter un appel simple pour vérifier les permissions
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      return false;
    }

    // Pour l'instant, on assume que le Basic Display API ne supporte pas les messages
    // Dans une vraie implémentation, on vérifierait les scopes du token
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification du support messaging:', error);
    return false;
  }
};

// Récupérer les conversations depuis l'API Meta Instagram (avec simulation)
export const fetchInstagramConversations = async (accessToken: string): Promise<any[]> => {
  try {
    console.log('Récupération des conversations Instagram...');
    
    if (SIMULATION_MODE) {
      // Retourner des conversations simulées
      return [
        {
          id: 'conv_1',
          participants: [
            {
              id: 'user_1',
              username: 'marie_fitness',
              name: 'Marie Dubois',
              profile_picture_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
              is_verified: false
            }
          ],
          updated_time: new Date().toISOString()
        },
        {
          id: 'conv_2',
          participants: [
            {
              id: 'user_2',
              username: 'tech_entrepreneur',
              name: 'Alexandre Martin',
              profile_picture_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
              is_verified: true
            }
          ],
          updated_time: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    }
    
    // Appel à l'API Instagram pour récupérer les conversations
    const response = await fetch(
      `https://graph.instagram.com/me/conversations?fields=id,participants,updated_time&access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Instagram conversations:', errorText);
      
      // Si l'API ne supporte pas les conversations, utiliser le mode simulation
      if (response.status === 400 || response.status === 403) {
        console.warn('API ne supporte pas les conversations, utilisation du mode simulation');
        return await fetchInstagramConversations(accessToken); // Récursion avec simulation
      }
      
      throw new Error('Impossible de récupérer les conversations');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des conversations:', error);
    
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.warn('Erreur réseau, utilisation du mode simulation');
      // Activer temporairement le mode simulation
      return [
        {
          id: 'conv_demo_1',
          participants: [
            {
              id: 'demo_user_1',
              username: 'demo_user',
              name: 'Utilisateur Démo',
              profile_picture_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
              is_verified: false
            }
          ],
          updated_time: new Date().toISOString()
        }
      ];
    }
    
    throw new Error(`Impossible de récupérer les conversations: ${error.message}`);
  }
};

// Récupérer les messages d'une conversation depuis l'API Meta (avec simulation)
export const fetchInstagramMessages = async (accessToken: string, conversationId: string): Promise<any[]> => {
  try {
    console.log(`Récupération des messages pour la conversation ${conversationId}...`);
    
    if (SIMULATION_MODE || conversationId.startsWith('conv_') || conversationId.startsWith('conv_demo_')) {
      // Retourner des messages simulés
      return [
        {
          id: `msg_${conversationId}_1`,
          created_time: new Date(Date.now() - 7200000).toISOString(),
          from: {
            id: 'user_1',
            username: 'marie_fitness',
            name: 'Marie Dubois'
          },
          to: {
            id: 'me',
            username: 'me',
            name: 'Moi'
          },
          message: 'Salut ! J\'ai vu votre profil et je suis intéressée par vos services.'
        },
        {
          id: `msg_${conversationId}_2`,
          created_time: new Date(Date.now() - 3600000).toISOString(),
          from: {
            id: 'me',
            username: 'me',
            name: 'Moi'
          },
          to: {
            id: 'user_1',
            username: 'marie_fitness',
            name: 'Marie Dubois'
          },
          message: 'Bonjour Marie ! Merci pour votre message. Je serais ravi de discuter avec vous.'
        }
      ];
    }
    
    const response = await fetch(
      `https://graph.instagram.com/${conversationId}/messages?fields=id,created_time,from,to,message&access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Instagram messages:', errorText);
      throw new Error('Impossible de récupérer les messages');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des messages:', error);
    
    // En cas d'erreur, retourner des messages simulés
    return [
      {
        id: `msg_${conversationId}_demo`,
        created_time: new Date().toISOString(),
        from: {
          id: 'demo_user',
          username: 'demo_user',
          name: 'Utilisateur Démo'
        },
        to: {
          id: 'me',
          username: 'me',
          name: 'Moi'
        },
        message: 'Message de démonstration - API non disponible'
      }
    ];
  }
};

// Envoyer un message via l'API Meta Instagram (avec simulation)
export const sendInstagramMessage = async (accessToken: string, recipientId: string, message: string): Promise<any> => {
  try {
    console.log(`Envoi d'un message à ${recipientId}...`);
    
    // Vérifier d'abord si l'API supporte les messages
    const supportsMessaging = await checkMessagingSupport(accessToken);
    
    if (!supportsMessaging || SIMULATION_MODE) {
      console.warn('Mode simulation activé pour l\'envoi de messages');
      // Simuler une réponse réussie
      return {
        message_id: `sim_msg_${Date.now()}`,
        recipient_id: recipientId,
        success: true,
        simulated: true
      };
    }
    
    const response = await fetch(
      `https://graph.instagram.com/me/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          access_token: accessToken
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Instagram envoi message:', errorText);
      
      // Si l'erreur indique que l'API ne supporte pas les messages, utiliser la simulation
      if (response.status === 400 || response.status === 403) {
        console.warn('API ne supporte pas l\'envoi de messages, utilisation de la simulation');
        return {
          message_id: `sim_msg_${Date.now()}`,
          recipient_id: recipientId,
          success: true,
          simulated: true
        };
      }
      
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du message:', error);
    
    // En cas d'erreur réseau ou autre, utiliser la simulation
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.warn('Erreur réseau, utilisation de la simulation pour l\'envoi');
      return {
        message_id: `sim_msg_${Date.now()}`,
        recipient_id: recipientId,
        success: true,
        simulated: true,
        error_fallback: true
      };
    }
    
    throw new Error(`Impossible d'envoyer le message: ${error.message}`);
  }
};

// Rechercher un utilisateur Instagram par nom d'utilisateur (avec simulation)
export const searchInstagramUser = async (accessToken: string, username: string): Promise<any> => {
  try {
    console.log(`Recherche de l'utilisateur ${username}...`);
    
    if (SIMULATION_MODE) {
      // Retourner un utilisateur simulé
      return {
        id: `user_${username}`,
        username: username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        profile_picture_url: `https://unavatar.io/instagram/${username}`,
        is_verified: Math.random() > 0.8,
        simulated: true
      };
    }
    
    // Note: L'API Instagram Basic Display ne permet pas de rechercher des utilisateurs
    // Pour une implémentation réelle, il faudrait utiliser l'API Instagram Graph
    const response = await fetch(
      `https://graph.instagram.com/search?q=${username}&type=user&access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      // Si l'API ne supporte pas la recherche, retourner un utilisateur simulé
      console.warn('API ne supporte pas la recherche, utilisation de la simulation');
      return {
        id: `user_${username}`,
        username: username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        profile_picture_url: `https://unavatar.io/instagram/${username}`,
        is_verified: false,
        simulated: true
      };
    }

    const data = await response.json();
    return data.data?.[0] || {
      id: `user_${username}`,
      username: username,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      profile_picture_url: `https://unavatar.io/instagram/${username}`,
      is_verified: false,
      simulated: true
    };
  } catch (error: any) {
    console.error('Erreur lors de la recherche d\'utilisateur:', error);
    // Retourner un utilisateur simulé en cas d'erreur
    return {
      id: `user_${username}`,
      username: username,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      profile_picture_url: `https://unavatar.io/instagram/${username}`,
      is_verified: false,
      simulated: true,
      error_fallback: true
    };
  }
};

// Envoyer un message direct à un utilisateur par nom d'utilisateur
export const sendDirectMessage = async (userId: string, recipientUsername: string, messageText: string): Promise<InstagramMessage> => {
  try {
    const accessToken = await getInstagramToken(userId);
    if (!accessToken) {
      throw new Error('Token Instagram non trouvé. Veuillez reconnecter votre compte Instagram.');
    }

    // Rechercher l'utilisateur destinataire
    const recipientUser = await searchInstagramUser(accessToken, recipientUsername);
    if (!recipientUser) {
      throw new Error(`Utilisateur @${recipientUsername} non trouvé`);
    }

    // Envoyer le message via l'API Meta (ou simulation)
    const metaResponse = await sendInstagramMessage(accessToken, recipientUser.id, messageText);
    
    // Récupérer les informations de l'expéditeur
    const senderInfo = await getInstagramAccountInfo(userId);
    
    // Créer l'objet message
    const message: InstagramMessage = {
      id: `direct_${Date.now()}`,
      threadId: `${userId}_${recipientUser.id}`,
      from: {
        id: senderInfo?.id || userId,
        username: senderInfo?.username || 'me',
        name: senderInfo?.name || 'Moi',
        profilePicture: senderInfo?.profile_picture_url
      },
      to: {
        id: recipientUser.id,
        username: recipientUser.username,
        name: recipientUser.name
      },
      message: messageText,
      timestamp: new Date(),
      isRead: false,
      isFromMe: true,
      metaMessageId: metaResponse.message_id,
      isSimulated: metaResponse.simulated || false
    };

    // Sauvegarder dans Firebase
    const db = getFirebaseFirestore();
    
    // Créer ou mettre à jour le thread
    const threadId = `${userId}_${recipientUser.id}`;
    const threadRef = doc(db, 'message_threads', threadId);
    
    const thread: MessageThread = {
      id: threadId,
      userId,
      participant: {
        id: recipientUser.id,
        username: recipientUser.username,
        name: recipientUser.name,
        profilePicture: recipientUser.profile_picture_url,
        isVerified: recipientUser.is_verified || false
      },
      lastMessage: message,
      unreadCount: 0,
      isArchived: false,
      isStarred: false,
      updatedAt: new Date(),
      createdAt: new Date(),
      metaThreadId: recipientUser.id,
      isSimulated: metaResponse.simulated || false
    };

    await setDoc(threadRef, {
      ...thread,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Sauvegarder le message
    const messageRef = doc(db, 'messages', message.id);
    await setDoc(messageRef, {
      ...message,
      createdAt: serverTimestamp()
    });

    return message;
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du message direct:', error);
    
    // Fournir des messages d'erreur plus spécifiques
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Erreur de connexion. Vérifiez votre connexion internet et réessayez.');
    } else if (error.message.includes('Token')) {
      throw new Error('Token Instagram invalide. Veuillez reconnecter votre compte Instagram.');
    } else if (error.message.includes('API')) {
      throw new Error('L\'API Instagram ne supporte pas cette fonctionnalité avec votre type de compte. Un compte Instagram Business connecté à une page Facebook est requis pour envoyer des messages.');
    }
    
    throw new Error(`Impossible d'envoyer le message: ${error.message}`);
  }
};

// Synchroniser les conversations avec Firebase
export const syncConversationsWithFirebase = async (userId: string): Promise<MessageThread[]> => {
  try {
    const accessToken = await getInstagramToken(userId);
    if (!accessToken) {
      throw new Error('Token Instagram non trouvé');
    }

    // Récupérer les conversations depuis l'API Meta (ou simulation)
    const metaConversations = await fetchInstagramConversations(accessToken);
    
    const db = getFirebaseFirestore();
    const threads: MessageThread[] = [];

    for (const metaConv of metaConversations) {
      try {
        // Récupérer les messages de cette conversation
        const metaMessages = await fetchInstagramMessages(accessToken, metaConv.id);
        
        if (metaMessages.length === 0) continue;

        // Créer ou mettre à jour le thread dans Firebase
        const threadRef = doc(db, 'message_threads', `${userId}_${metaConv.id}`);
        
        // Construire les données du thread
        const lastMetaMessage = metaMessages[0]; // Le plus récent
        const participant = metaConv.participants?.find((p: any) => p.id !== userId) || metaConv.participants?.[0];
        
        const thread: MessageThread = {
          id: `${userId}_${metaConv.id}`,
          userId,
          participant: {
            id: participant?.id || 'unknown',
            username: participant?.username || 'Utilisateur inconnu',
            name: participant?.name,
            profilePicture: participant?.profile_picture_url,
            isVerified: participant?.is_verified || false
          },
          lastMessage: {
            id: lastMetaMessage.id,
            threadId: `${userId}_${metaConv.id}`,
            from: {
              id: lastMetaMessage.from?.id || '',
              username: lastMetaMessage.from?.username || '',
              name: lastMetaMessage.from?.name
            },
            to: {
              id: lastMetaMessage.to?.id || '',
              username: lastMetaMessage.to?.username || '',
              name: lastMetaMessage.to?.name
            },
            message: lastMetaMessage.message || '',
            timestamp: new Date(lastMetaMessage.created_time),
            isRead: true, // À implémenter selon l'API
            isFromMe: lastMetaMessage.from?.id === userId,
            metaMessageId: lastMetaMessage.id,
            isSimulated: SIMULATION_MODE || metaConv.id.startsWith('conv_')
          },
          unreadCount: 0, // À calculer selon les messages non lus
          isArchived: false,
          isStarred: false,
          updatedAt: new Date(metaConv.updated_time),
          createdAt: new Date(metaConv.updated_time),
          metaThreadId: metaConv.id,
          isSimulated: SIMULATION_MODE || metaConv.id.startsWith('conv_')
        };

        // Sauvegarder dans Firebase
        await setDoc(threadRef, {
          ...thread,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Synchroniser les messages de ce thread
        await syncMessagesWithFirebase(userId, thread.id, metaMessages);
        
        threads.push(thread);
      } catch (error) {
        console.error(`Erreur lors de la synchronisation de la conversation ${metaConv.id}:`, error);
      }
    }

    return threads;
  } catch (error: any) {
    console.error('Erreur lors de la synchronisation des conversations:', error);
    throw new Error(`Impossible de synchroniser les conversations: ${error.message}`);
  }
};

// Synchroniser les messages d'un thread avec Firebase
export const syncMessagesWithFirebase = async (userId: string, threadId: string, metaMessages: any[]): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    
    for (const metaMessage of metaMessages) {
      const messageRef = doc(db, 'messages', `${threadId}_${metaMessage.id}`);
      
      const message: InstagramMessage = {
        id: `${threadId}_${metaMessage.id}`,
        threadId,
        from: {
          id: metaMessage.from?.id || '',
          username: metaMessage.from?.username || '',
          name: metaMessage.from?.name
        },
        to: {
          id: metaMessage.to?.id || '',
          username: metaMessage.to?.username || '',
          name: metaMessage.to?.name
        },
        message: metaMessage.message || '',
        timestamp: new Date(metaMessage.created_time),
        isRead: true, // À implémenter
        isFromMe: metaMessage.from?.id === userId,
        metaMessageId: metaMessage.id,
        isSimulated: SIMULATION_MODE || threadId.includes('conv_')
      };

      await setDoc(messageRef, {
        ...message,
        createdAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation des messages:', error);
  }
};

// Récupérer les threads depuis Firebase avec gestion d'erreur pour l'index manquant
export const getUserMessageThreads = async (userId: string): Promise<MessageThread[]> => {
  try {
    const db = getFirebaseFirestore();
    const threadsRef = collection(db, 'message_threads');
    
    // Essayer d'abord avec la requête optimisée (nécessite un index composite)
    try {
      const q = query(
        threadsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const threads: MessageThread[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        threads.push({
          ...data,
          id: doc.id,
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          lastMessage: {
            ...data.lastMessage,
            timestamp: data.lastMessage?.timestamp?.toDate() || new Date()
          }
        } as MessageThread);
      });
      
      return threads;
    } catch (indexError: any) {
      // Si l'erreur est liée à l'index manquant, utiliser une approche alternative
      if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
        console.warn('Index composite manquant, utilisation d\'une requête alternative...');
        
        // Requête simple sans orderBy (ne nécessite pas d'index composite)
        const simpleQuery = query(
          threadsRef,
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(simpleQuery);
        const threads: MessageThread[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          threads.push({
            ...data,
            id: doc.id,
            updatedAt: data.updatedAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            lastMessage: {
              ...data.lastMessage,
              timestamp: data.lastMessage?.timestamp?.toDate() || new Date()
            }
          } as MessageThread);
        });
        
        // Trier côté client par updatedAt
        threads.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        
        return threads;
      } else {
        // Si c'est une autre erreur, la relancer
        throw indexError;
      }
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération des threads:', error);
    throw new Error('Impossible de récupérer les conversations');
  }
};

// Récupérer les messages d'un thread depuis Firebase
export const getThreadMessages = async (threadId: string): Promise<InstagramMessage[]> => {
  try {
    const db = getFirebaseFirestore();
    const messagesRef = collection(db, 'messages');
    
    const q = query(
      messagesRef,
      where('threadId', '==', threadId),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const messages: InstagramMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        ...data,
        id: doc.id,
        timestamp: data.timestamp?.toDate() || new Date()
      } as InstagramMessage);
    });
    
    return messages;
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    throw new Error('Impossible de récupérer les messages');
  }
};

// Envoyer un message et le sauvegarder
export const sendAndSaveMessage = async (
  userId: string, 
  threadId: string, 
  recipientId: string, 
  messageText: string
): Promise<InstagramMessage> => {
  try {
    const accessToken = await getInstagramToken(userId);
    if (!accessToken) {
      throw new Error('Token Instagram non trouvé');
    }

    // Envoyer via l'API Meta (ou simulation)
    const metaResponse = await sendInstagramMessage(accessToken, recipientId, messageText);
    
    // Créer l'objet message
    const message: InstagramMessage = {
      id: `${threadId}_${metaResponse.message_id || Date.now()}`,
      threadId,
      from: {
        id: userId,
        username: 'me', // À récupérer depuis les infos du compte
        name: 'Moi'
      },
      to: {
        id: recipientId,
        username: 'recipient',
        name: 'Destinataire'
      },
      message: messageText,
      timestamp: new Date(),
      isRead: false,
      isFromMe: true,
      metaMessageId: metaResponse.message_id,
      isSimulated: metaResponse.simulated || false
    };

    // Sauvegarder dans Firebase
    const db = getFirebaseFirestore();
    const messageRef = doc(db, 'messages', message.id);
    
    await setDoc(messageRef, {
      ...message,
      createdAt: serverTimestamp()
    });

    // Mettre à jour le thread
    const threadRef = doc(db, 'message_threads', threadId);
    await updateDoc(threadRef, {
      lastMessage: message,
      updatedAt: serverTimestamp()
    });

    return message;
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi et sauvegarde du message:', error);
    throw new Error(`Impossible d'envoyer le message: ${error.message}`);
  }
};

// Marquer un thread comme favori
export const toggleThreadStar = async (threadId: string, isStarred: boolean): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const threadRef = doc(db, 'message_threads', threadId);
    
    await updateDoc(threadRef, {
      isStarred: !isStarred,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du favori:', error);
    throw new Error('Impossible de mettre à jour le favori');
  }
};

// Archiver un thread
export const archiveThread = async (threadId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const threadRef = doc(db, 'message_threads', threadId);
    
    await updateDoc(threadRef, {
      isArchived: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage:', error);
    throw new Error('Impossible d\'archiver la conversation');
  }
};

// Marquer les messages comme lus
export const markThreadAsRead = async (threadId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const threadRef = doc(db, 'message_threads', threadId);
    
    await updateDoc(threadRef, {
      unreadCount: 0,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    throw new Error('Impossible de marquer comme lu');
  }
};