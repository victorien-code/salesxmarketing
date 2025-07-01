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
  metaMessageId?: string;
  isSimulated?: boolean;
}

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
  metaThreadId?: string;
  isSimulated?: boolean;
}

const SIMULATION_MODE = true;

export const checkMessagingSupport = async (accessToken: string): Promise<boolean> => {
  try {
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

    return false;
  } catch (error) {
    return false;
  }
};

export const fetchInstagramConversations = async (accessToken: string): Promise<unknown[]> => {
  try {
    if (SIMULATION_MODE) {
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
      
      if (response.status === 400 || response.status === 403) {
        return await fetchInstagramConversations(accessToken);
      }
      
      throw new Error('Impossible de récupérer les conversations');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('TypeError')) {
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
    
    throw new Error(`Impossible de récupérer les conversations: ${errorMessage}`);
  }
};

export const fetchInstagramMessages = async (accessToken: string, conversationId: string): Promise<unknown[]> => {
  try {
    if (SIMULATION_MODE || conversationId.startsWith('conv_') || conversationId.startsWith('conv_demo_')) {
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
      throw new Error('Impossible de récupérer les messages');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: unknown) {
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

export const sendInstagramMessage = async (accessToken: string, recipientId: string, message: string): Promise<{
  message_id: string;
  recipient_id: string;
  success: boolean;
  simulated?: boolean;
  error_fallback?: boolean;
}> => {
  try {
    const supportsMessaging = await checkMessagingSupport(accessToken);
    
    if (!supportsMessaging || SIMULATION_MODE) {
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
      
      if (response.status === 400 || response.status === 403) {
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('TypeError')) {
      return {
        message_id: `sim_msg_${Date.now()}`,
        recipient_id: recipientId,
        success: true,
        simulated: true,
        error_fallback: true
      };
    }
    
    throw new Error(`Impossible d'envoyer le message: ${errorMessage}`);
  }
};

export const searchInstagramUser = async (accessToken: string, username: string): Promise<{
  id: string;
  username: string;
  name: string;
  profile_picture_url: string;
  is_verified: boolean;
  simulated?: boolean;
  error_fallback?: boolean;
}> => {
  try {
    if (SIMULATION_MODE) {
      return {
        id: `user_${username}`,
        username: username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        profile_picture_url: `https://unavatar.io/instagram/${username}`,
        is_verified: Math.random() > 0.8,
        simulated: true
      };
    }
    
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
  } catch (error: unknown) {
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

export const sendDirectMessage = async (userId: string, recipientUsername: string, messageText: string): Promise<InstagramMessage> => {
  try {
    const accessToken = await getInstagramToken(userId);
    if (!accessToken) {
      throw new Error('Token Instagram non trouvé. Veuillez reconnecter votre compte Instagram.');
    }

    const recipientUser = await searchInstagramUser(accessToken, recipientUsername);
    if (!recipientUser) {
      throw new Error(`Utilisateur @${recipientUsername} non trouvé`);
    }

    const metaResponse = await sendInstagramMessage(accessToken, recipientUser.id, messageText);
    
    const senderInfo = await getInstagramAccountInfo(userId);
    
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

    const db = getFirebaseFirestore();
    
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

    const messageRef = doc(db, 'messages', message.id);
    await setDoc(messageRef, {
      ...message,
      createdAt: serverTimestamp()
    });

    return message;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    if (errorMessage.includes('Failed to fetch')) {
      throw new Error('Erreur de connexion. Vérifiez votre connexion internet et réessayez.');
    } else if (errorMessage.includes('Token')) {
      throw new Error('Token Instagram invalide. Veuillez reconnecter votre compte Instagram.');
    } else if (errorMessage.includes('API')) {
      throw new Error('L\'API Instagram ne supporte pas cette fonctionnalité avec votre type de compte. Un compte Instagram Business connecté à une page Facebook est requis pour envoyer des messages.');
    }
    
    throw new Error(`Impossible d'envoyer le message: ${errorMessage}`);
  }
};

export const syncConversationsWithFirebase = async (userId: string): Promise<MessageThread[]> => {
  try {
    const accessToken = await getInstagramToken(userId);
    if (!accessToken) {
      throw new Error('Token Instagram non trouvé');
    }

    const metaConversations = await fetchInstagramConversations(accessToken);
    
    const db = getFirebaseFirestore();
    const threads: MessageThread[] = [];

    for (const metaConv of metaConversations) {
      try {
        const metaMessages = await fetchInstagramMessages(accessToken, (metaConv as { id: string }).id);
        
        if (metaMessages.length === 0) continue;

        const threadRef = doc(db, 'message_threads', `${userId}_${(metaConv as { id: string }).id}`);
        
        const lastMetaMessage = metaMessages[0];
        const participant = (metaConv as { participants?: Array<{ id: string; username: string; name?: string; profile_picture_url?: string; is_verified?: boolean }> }).participants?.find((p) => p.id !== userId) || (metaConv as { participants?: Array<{ id: string; username: string; name?: string; profile_picture_url?: string; is_verified?: boolean }> }).participants?.[0];
        
        const thread: MessageThread = {
          id: `${userId}_${(metaConv as { id: string }).id}`,
          userId,
          participant: {
            id: participant?.id || 'unknown',
            username: participant?.username || 'Utilisateur inconnu',
            name: participant?.name,
            profilePicture: participant?.profile_picture_url,
            isVerified: participant?.is_verified || false
          },
          lastMessage: {
            id: (lastMetaMessage as { id: string }).id,
            threadId: `${userId}_${(metaConv as { id: string }).id}`,
            from: {
              id: (lastMetaMessage as { from?: { id: string; username: string; name?: string } }).from?.id || '',
              username: (lastMetaMessage as { from?: { id: string; username: string; name?: string } }).from?.username || '',
              name: (lastMetaMessage as { from?: { id: string; username: string; name?: string } }).from?.name
            },
            to: {
              id: (lastMetaMessage as { to?: { id: string; username: string; name?: string } }).to?.id || '',
              username: (lastMetaMessage as { to?: { id: string; username: string; name?: string } }).to?.username || '',
              name: (lastMetaMessage as { to?: { id: string; username: string; name?: string } }).to?.name
            },
            message: (lastMetaMessage as { message?: string }).message || '',
            timestamp: new Date((lastMetaMessage as { created_time: string }).created_time),
            isRead: true,
            isFromMe: (lastMetaMessage as { from?: { id: string } }).from?.id === userId,
            metaMessageId: (lastMetaMessage as { id: string }).id,
            isSimulated: SIMULATION_MODE || (metaConv as { id: string }).id.startsWith('conv_')
          },
          unreadCount: 0,
          isArchived: false,
          isStarred: false,
          updatedAt: new Date((metaConv as { updated_time: string }).updated_time),
          createdAt: new Date((metaConv as { updated_time: string }).updated_time),
          metaThreadId: (metaConv as { id: string }).id,
          isSimulated: SIMULATION_MODE || (metaConv as { id: string }).id.startsWith('conv_')
        };

        await setDoc(threadRef, {
          ...thread,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        await syncMessagesWithFirebase(userId, thread.id, metaMessages);
        
        threads.push(thread);
      } catch (error) {
        // Continue with next conversation
      }
    }

    return threads;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    throw new Error(`Impossible de synchroniser les conversations: ${errorMessage}`);
  }
};

export const syncMessagesWithFirebase = async (userId: string, threadId: string, metaMessages: unknown[]): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    
    for (const metaMessage of metaMessages) {
      const messageRef = doc(db, 'messages', `${threadId}_${(metaMessage as { id: string }).id}`);
      
      const message: InstagramMessage = {
        id: `${threadId}_${(metaMessage as { id: string }).id}`,
        threadId,
        from: {
          id: (metaMessage as { from?: { id: string; username: string; name?: string } }).from?.id || '',
          username: (metaMessage as { from?: { id: string; username: string; name?: string } }).from?.username || '',
          name: (metaMessage as { from?: { id: string; username: string; name?: string } }).from?.name
        },
        to: {
          id: (metaMessage as { to?: { id: string; username: string; name?: string } }).to?.id || '',
          username: (metaMessage as { to?: { id: string; username: string; name?: string } }).to?.username || '',
          name: (metaMessage as { to?: { id: string; username: string; name?: string } }).to?.name
        },
        message: (metaMessage as { message?: string }).message || '',
        timestamp: new Date((metaMessage as { created_time: string }).created_time),
        isRead: true,
        isFromMe: (metaMessage as { from?: { id: string } }).from?.id === userId,
        metaMessageId: (metaMessage as { id: string }).id,
        isSimulated: SIMULATION_MODE || threadId.includes('conv_')
      };

      await setDoc(messageRef, {
        ...message,
        createdAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    // Silently handle errors
  }
};

export const getUserMessageThreads = async (userId: string): Promise<MessageThread[]> => {
  try {
    const db = getFirebaseFirestore();
    const threadsRef = collection(db, 'message_threads');
    
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
    } catch (indexError: unknown) {
      const errorMessage = indexError instanceof Error ? indexError.message : '';
      if (errorMessage.includes('failed-precondition') || errorMessage.includes('index')) {
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
        
        threads.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        
        return threads;
      } else {
        throw indexError;
      }
    }
  } catch (error: unknown) {
    throw new Error('Impossible de récupérer les conversations');
  }
};

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
    throw new Error('Impossible de récupérer les messages');
  }
};

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

    const metaResponse = await sendInstagramMessage(accessToken, recipientId, messageText);
    
    const message: InstagramMessage = {
      id: `${threadId}_${metaResponse.message_id || Date.now()}`,
      threadId,
      from: {
        id: userId,
        username: 'me',
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

    const db = getFirebaseFirestore();
    const messageRef = doc(db, 'messages', message.id);
    
    await setDoc(messageRef, {
      ...message,
      createdAt: serverTimestamp()
    });

    const threadRef = doc(db, 'message_threads', threadId);
    await updateDoc(threadRef, {
      lastMessage: message,
      updatedAt: serverTimestamp()
    });

    return message;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    throw new Error(`Impossible d'envoyer le message: ${errorMessage}`);
  }
};

export const toggleThreadStar = async (threadId: string, isStarred: boolean): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const threadRef = doc(db, 'message_threads', threadId);
    
    await updateDoc(threadRef, {
      isStarred: !isStarred,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error('Impossible de mettre à jour le favori');
  }
};

export const archiveThread = async (threadId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const threadRef = doc(db, 'message_threads', threadId);
    
    await updateDoc(threadRef, {
      isArchived: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error('Impossible d\'archiver la conversation');
  }
};

export const markThreadAsRead = async (threadId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const threadRef = doc(db, 'message_threads', threadId);
    
    await updateDoc(threadRef, {
      unreadCount: 0,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error('Impossible de marquer comme lu');
  }
};