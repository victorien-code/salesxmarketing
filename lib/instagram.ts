import { doc, setDoc, getDoc, updateDoc, deleteField, collection, addDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';

// Interface pour les informations du compte Instagram
export interface InstagramAccountInfo {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  biography?: string;
  website?: string;
  account_type?: string;
}

// Interface pour un follower scrapé
export interface ScrapedFollower {
  id: string;
  username: string;
  full_name?: string;
  profile_picture_url?: string;
  is_verified?: boolean;
  is_private?: boolean;
  follower_count?: number;
  following_count?: number;
  media_count?: number;
  biography?: string;
  external_url?: string;
  scraped_at: Date;
  source_account: string; // ID du compte dont on a scrapé les followers
}

// Interface pour les données Instagram complètes
interface InstagramData {
  token: string;
  accountInfo: InstagramAccountInfo | null;
  connectedAt: Date;
  lastUpdated: Date;
  tokenExpiresAt?: Date;
}

// Interface pour gérer plusieurs comptes
interface MultipleInstagramAccounts {
  [accountId: string]: InstagramData;
}

// Récupérer les informations du compte via l'API Meta
export const fetchInstagramAccountInfo = async (accessToken: string): Promise<InstagramAccountInfo> => {
  try {
    console.log('Récupération des informations du compte Instagram...');
    
    // Appel à l'API Instagram Basic Display pour récupérer les informations de base
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    console.log('Réponse API Instagram:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Instagram:', errorText);
      
      let errorMessage = 'Token invalide ou expiré';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Si on ne peut pas parser l'erreur, on garde le message par défaut
      }
      
      throw new Error(`Erreur API Instagram: ${errorMessage}`);
    }

    const basicData = await response.json();
    console.log('Données récupérées:', basicData);

    // Construire l'objet avec les informations disponibles
    const accountInfo: InstagramAccountInfo = {
      id: basicData.id,
      username: basicData.username,
      name: basicData.username, // Utiliser le username comme nom par défaut
      account_type: basicData.account_type,
      media_count: basicData.media_count,
      // Générer une URL d'avatar basée sur le username
      profile_picture_url: `https://unavatar.io/instagram/${basicData.username}`,
    };

    console.log('Informations du compte formatées:', accountInfo);
    return accountInfo;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des informations du compte:', error);
    throw new Error(`Impossible de récupérer les informations du compte: ${error.message}`);
  }
};

// Scraper les followers d'un compte Instagram
export const scrapeInstagramFollowers = async (accessToken: string, accountId: string, userId: string): Promise<ScrapedFollower[]> => {
  try {
    console.log(`Début du scraping des followers pour le compte ${accountId}...`);
    
    // Note: L'API Instagram Basic Display ne permet pas de récupérer la liste des followers
    // Pour une implémentation réelle, il faudrait utiliser l'API Instagram Graph ou une autre méthode
    // Ici, nous simulons le processus avec des données d'exemple
    
    // Appel simulé à l'API pour récupérer les followers
    const response = await fetch(
      `https://graph.instagram.com/${accountId}?fields=followers_count&access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Impossible de récupérer les informations du compte');
    }

    const accountData = await response.json();
    const followersCount = accountData.followers_count || 0;
    
    console.log(`Compte trouvé avec ${followersCount} followers`);
    
    // Simulation du scraping avec des données d'exemple
    // Dans une implémentation réelle, vous devriez utiliser une API ou service tiers
    const scrapedFollowers: ScrapedFollower[] = [];
    
    // Générer des followers d'exemple (limité à 100 pour la démo)
    const maxFollowers = Math.min(followersCount, 100);
    
    for (let i = 0; i < maxFollowers; i++) {
      const follower: ScrapedFollower = {
        id: `follower_${accountId}_${i}`,
        username: `user_${Math.random().toString(36).substring(7)}`,
        full_name: `Utilisateur ${i + 1}`,
        profile_picture_url: `https://unavatar.io/instagram/user_${i}`,
        is_verified: Math.random() > 0.95,
        is_private: Math.random() > 0.7,
        follower_count: Math.floor(Math.random() * 10000),
        following_count: Math.floor(Math.random() * 1000),
        media_count: Math.floor(Math.random() * 500),
        biography: `Bio de l'utilisateur ${i + 1}`,
        external_url: Math.random() > 0.8 ? `https://example${i}.com` : undefined,
        scraped_at: new Date(),
        source_account: accountId
      };
      
      scrapedFollowers.push(follower);
    }
    
    // Sauvegarder les followers scrapés dans Firebase
    await saveScrapedFollowers(userId, accountId, scrapedFollowers);
    
    console.log(`Scraping terminé: ${scrapedFollowers.length} followers récupérés`);
    return scrapedFollowers;
    
  } catch (error: any) {
    console.error('Erreur lors du scraping des followers:', error);
    throw new Error(`Impossible de scraper les followers: ${error.message}`);
  }
};

// Sauvegarder les followers scrapés dans Firebase
export const saveScrapedFollowers = async (userId: string, sourceAccountId: string, followers: ScrapedFollower[]): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    
    // Créer une collection pour les followers scrapés
    const scrapingSessionRef = await addDoc(collection(db, 'scraping_sessions'), {
      userId,
      sourceAccountId,
      scrapedAt: new Date(),
      followersCount: followers.length,
      status: 'completed'
    });
    
    // Sauvegarder chaque follower
    const batch = [];
    for (const follower of followers) {
      const followerRef = doc(collection(db, 'scraped_followers'));
      batch.push(setDoc(followerRef, {
        ...follower,
        userId,
        scrapingSessionId: scrapingSessionRef.id,
        createdAt: new Date()
      }));
    }
    
    // Exécuter toutes les écritures
    await Promise.all(batch);
    
    console.log(`${followers.length} followers sauvegardés dans Firebase`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des followers:', error);
    throw new Error('Impossible de sauvegarder les followers scrapés');
  }
};

// Récupérer les followers scrapés pour un compte
export const getScrapedFollowers = async (userId: string, sourceAccountId?: string): Promise<ScrapedFollower[]> => {
  try {
    const db = getFirebaseFirestore();
    
    // Pour cette démo, on retourne des données simulées
    // Dans une vraie implémentation, on ferait une requête Firestore
    const mockFollowers: ScrapedFollower[] = [
      {
        id: 'follower_1',
        username: 'marie_fitness',
        full_name: 'Marie Dubois',
        profile_picture_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        is_verified: false,
        is_private: false,
        follower_count: 1500,
        following_count: 800,
        media_count: 234,
        biography: '🏋️‍♀️ Coach fitness | 💪 Transformation',
        scraped_at: new Date(),
        source_account: sourceAccountId || 'default'
      },
      {
        id: 'follower_2',
        username: 'tech_entrepreneur',
        full_name: 'Alexandre Martin',
        profile_picture_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        is_verified: true,
        is_private: false,
        follower_count: 8900,
        following_count: 1200,
        media_count: 156,
        biography: '🚀 CEO @TechStartup | 💡 Innovation',
        scraped_at: new Date(),
        source_account: sourceAccountId || 'default'
      }
    ];
    
    return mockFollowers;
  } catch (error) {
    console.error('Erreur lors de la récupération des followers scrapés:', error);
    return [];
  }
};

// Sauvegarder un nouveau compte Instagram
export const saveInstagramAccount = async (userId: string, token: string, accountId?: string): Promise<InstagramAccountInfo | null> => {
  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', userId);
    
    let accountInfo: InstagramAccountInfo | null = null;

    // Si un token est fourni, récupérer les informations du compte
    if (token && token.trim()) {
      try {
        accountInfo = await fetchInstagramAccountInfo(token.trim());
        console.log('Informations du compte récupérées:', accountInfo);
      } catch (error: any) {
        console.error('Erreur lors de la récupération des informations:', error);
        throw new Error(`Token invalide: ${error.message}`);
      }
    }

    const instagramData: InstagramData = {
      token: token.trim(),
      accountInfo,
      connectedAt: new Date(),
      lastUpdated: new Date(),
      // Calculer la date d'expiration (60 jours pour les tokens Instagram)
      tokenExpiresAt: token.trim() ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) : undefined
    };

    // Utiliser l'ID du compte ou générer un ID unique
    const finalAccountId = accountId || accountInfo?.id || Date.now().toString();

    await setDoc(userDocRef, {
      instagramAccounts: {
        [finalAccountId]: instagramData
      }
    }, { merge: true });

    console.log('Compte Instagram sauvegardé avec succès');
    return accountInfo;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du compte Instagram:', error);
    throw error;
  }
};

// Récupérer tous les comptes Instagram d'un utilisateur
export const getAllInstagramAccounts = async (userId: string): Promise<MultipleInstagramAccounts> => {
  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.instagramAccounts || {};
    }

    return {};
  } catch (error) {
    console.error('Erreur lors de la récupération des comptes Instagram:', error);
    throw new Error('Impossible de récupérer les comptes Instagram');
  }
};

// Récupérer le compte principal (pour compatibilité avec l'ancien système)
export const getInstagramData = async (userId: string): Promise<InstagramData | null> => {
  try {
    const accounts = await getAllInstagramAccounts(userId);
    const accountIds = Object.keys(accounts);
    
    if (accountIds.length === 0) return null;
    
    // Retourner le premier compte (ou le plus récent)
    const sortedAccounts = accountIds.sort((a, b) => {
      const dateA = new Date(accounts[a].connectedAt).getTime();
      const dateB = new Date(accounts[b].connectedAt).getTime();
      return dateB - dateA; // Plus récent en premier
    });
    
    return accounts[sortedAccounts[0]];
  } catch (error) {
    console.error('Erreur lors de la récupération des données Instagram:', error);
    throw new Error('Impossible de récupérer les données Instagram');
  }
};

// Récupérer un compte spécifique
export const getInstagramAccount = async (userId: string, accountId: string): Promise<InstagramData | null> => {
  try {
    const accounts = await getAllInstagramAccounts(userId);
    return accounts[accountId] || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du compte Instagram:', error);
    throw new Error('Impossible de récupérer le compte Instagram');
  }
};

// Supprimer un compte Instagram spécifique
export const removeInstagramAccount = async (userId: string, accountId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', userId);
    
    await updateDoc(userDocRef, {
      [`instagramAccounts.${accountId}`]: deleteField()
    });
    
    console.log('Compte Instagram supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression du compte Instagram:', error);
    throw new Error('Impossible de supprimer le compte Instagram');
  }
};

// Supprimer tous les comptes Instagram (pour compatibilité)
export const removeAllInstagramAccounts = async (userId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', userId);
    
    await updateDoc(userDocRef, {
      instagramAccounts: deleteField()
    });
    
    console.log('Tous les comptes Instagram supprimés avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression des comptes Instagram:', error);
    throw new Error('Impossible de supprimer les comptes Instagram');
  }
};

// Rafraîchir les informations d'un compte
export const refreshAccountInfo = async (userId: string, accountId?: string): Promise<InstagramAccountInfo | null> => {
  try {
    const accounts = await getAllInstagramAccounts(userId);
    
    // Si aucun accountId spécifié, prendre le premier compte
    const targetAccountId = accountId || Object.keys(accounts)[0];
    if (!targetAccountId || !accounts[targetAccountId]) {
      throw new Error('Aucun compte trouvé');
    }
    
    const account = accounts[targetAccountId];
    const accountInfo = await fetchInstagramAccountInfo(account.token);
    
    // Mettre à jour les informations dans Firebase
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', userId);
    
    await updateDoc(userDocRef, {
      [`instagramAccounts.${targetAccountId}.accountInfo`]: accountInfo,
      [`instagramAccounts.${targetAccountId}.lastUpdated`]: new Date()
    });

    return accountInfo;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des informations:', error);
    throw error;
  }
};

// Fonctions de compatibilité avec l'ancien système
export const saveInstagramToken = async (userId: string, token: string): Promise<InstagramAccountInfo | null> => {
  if (!token || token.trim() === '') {
    // Si token vide, supprimer tous les comptes
    await removeAllInstagramAccounts(userId);
    return null;
  }
  
  return await saveInstagramAccount(userId, token);
};

export const getInstagramToken = async (userId: string): Promise<string | null> => {
  try {
    const data = await getInstagramData(userId);
    return data?.token || null;
  } catch (error) {
    return null;
  }
};

export const getInstagramAccountInfo = async (userId: string): Promise<InstagramAccountInfo | null> => {
  try {
    const data = await getInstagramData(userId);
    return data?.accountInfo || null;
  } catch (error) {
    return null;
  }
};

export const hasInstagramToken = async (userId: string): Promise<boolean> => {
  try {
    const token = await getInstagramToken(userId);
    return token !== null && token.length > 0;
  } catch (error) {
    return false;
  }
};

export const removeInstagramToken = async (userId: string): Promise<void> => {
  await removeAllInstagramAccounts(userId);
};

export const updateTokenLastUsed = async (userId: string, accountId?: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', userId);
    
    if (accountId) {
      await updateDoc(userDocRef, {
        [`instagramAccounts.${accountId}.lastUpdated`]: new Date()
      });
    } else {
      // Mettre à jour le premier compte trouvé
      const accounts = await getAllInstagramAccounts(userId);
      const firstAccountId = Object.keys(accounts)[0];
      if (firstAccountId) {
        await updateDoc(userDocRef, {
          [`instagramAccounts.${firstAccountId}.lastUpdated`]: new Date()
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du token:', error);
  }
};

export const isTokenExpiringSoon = async (userId: string, accountId?: string): Promise<boolean> => {
  try {
    const accounts = await getAllInstagramAccounts(userId);
    const targetAccountId = accountId || Object.keys(accounts)[0];
    
    if (!targetAccountId || !accounts[targetAccountId]?.tokenExpiresAt) return false;

    const expirationDate = new Date(accounts[targetAccountId].tokenExpiresAt!);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    return expirationDate <= sevenDaysFromNow;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'expiration:', error);
    return false;
  }
};