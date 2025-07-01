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
  Timestamp 
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { InstagramAccountInfo } from './instagram';

export interface CSVAccount {
  account: string;
  firstName?: string;
  lastName?: string;
  [key: string]: string | undefined;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'follower_engagement' | 'interaction_trigger' | 'contest_management';
  status: 'active' | 'paused' | 'completed' | 'draft';
  settings: {
    actionsPerDay: number;
    delayBetweenActions: string;
    safeMode: boolean;
    verifyFollowers: boolean;
    respectApiLimits: boolean;
    acceptFriendRequests?: boolean;
    rejectFriendRequests?: boolean;
  };
  targeting: {
    audienceType?: string;
    postUrl?: string;
    csvAccounts?: CSVAccount[];
    connectedAccountId?: string;
    connectedAccountInfo?: InstagramAccountInfo;
  };
  messages?: {
    templates: string[];
    confirmationMessages?: string[];
    winnerMessage?: string;
    delayBetweenMessages?: number;
  };
  stats: {
    scraped: number;
    engaged: number;
    followers: number;
    reach: number;
    engagementRate: number;
  };
  contest?: {
    participants: string[];
    winner?: string;
    drawDate?: Timestamp;
    isDrawn: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  startDate?: Timestamp;
  endDate?: Timestamp;
}

export const personalizeMessage = (template: string, userData: CSVAccount): string => {
  let personalizedMessage = template;

  personalizedMessage = personalizedMessage.replace(
    /{(\w+):([^}]+)}/g, 
    (match, field, defaultValue) => {
      const value = userData[field];
      return value && value.trim() ? value : defaultValue;
    }
  );

  personalizedMessage = personalizedMessage.replace(
    /{(\w+)}/g, 
    (match, field) => {
      const value = userData[field];
      return value && value.trim() ? value : match;
    }
  );

  return personalizedMessage;
};

export const createCampaign = async (userId: string, campaignData: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const db = getFirebaseFirestore();
    const campaignsRef = collection(db, 'campaigns');
    const newCampaignRef = doc(campaignsRef);
    
    const campaign: Campaign = {
      ...campaignData,
      id: newCampaignRef.id,
      userId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      contest: campaignData.type === 'contest_management' ? {
        participants: [],
        isDrawn: false
      } : undefined,
    };

    await setDoc(newCampaignRef, campaign);
    return newCampaignRef.id;
  } catch (error) {
    throw new Error('Impossible de créer la campagne');
  }
};

export const getUserCampaigns = async (userId: string): Promise<Campaign[]> => {
  try {
    const db = getFirebaseFirestore();
    const campaignsRef = collection(db, 'campaigns');
    
    try {
      const q = query(
        campaignsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const campaigns: Campaign[] = [];
      
      querySnapshot.forEach((doc) => {
        campaigns.push({ ...doc.data(), id: doc.id } as Campaign);
      });
      
      return campaigns;
    } catch (indexError: unknown) {
      const simpleQuery = query(
        campaignsRef, 
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      const campaigns: Campaign[] = [];
      
      querySnapshot.forEach((doc) => {
        campaigns.push({ ...doc.data(), id: doc.id } as Campaign);
      });
      
      campaigns.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
      
      return campaigns;
    }
  } catch (error) {
    throw new Error('Impossible de récupérer les campagnes');
  }
};

export const getCampaign = async (campaignId: string): Promise<Campaign | null> => {
  try {
    const db = getFirebaseFirestore();
    const campaignRef = doc(db, 'campaigns', campaignId);
    const campaignDoc = await getDoc(campaignRef);
    
    if (campaignDoc.exists()) {
      return { ...campaignDoc.data(), id: campaignDoc.id } as Campaign;
    }
    
    return null;
  } catch (error) {
    throw new Error('Impossible de récupérer la campagne');
  }
};

export const updateCampaign = async (campaignId: string, updates: Partial<Campaign>): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const campaignRef = doc(db, 'campaigns', campaignId);
    
    await updateDoc(campaignRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Impossible de mettre à jour la campagne');
  }
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const campaignRef = doc(db, 'campaigns', campaignId);
    await deleteDoc(campaignRef);
  } catch (error) {
    throw new Error('Impossible de supprimer la campagne');
  }
};

export const updateCampaignStatus = async (campaignId: string, status: Campaign['status']): Promise<void> => {
  try {
    await updateCampaign(campaignId, { status });
  } catch (error) {
    throw error;
  }
};

export const updateCampaignStats = async (campaignId: string, stats: Partial<Campaign['stats']>): Promise<void> => {
  try {
    const campaign = await getCampaign(campaignId);
    if (!campaign) throw new Error('Campagne non trouvée');
    
    const updatedStats = { ...campaign.stats, ...stats };
    await updateCampaign(campaignId, { stats: updatedStats });
  } catch (error) {
    throw error;
  }
};

export const addContestParticipant = async (campaignId: string, participant: string): Promise<void> => {
  try {
    const campaign = await getCampaign(campaignId);
    if (!campaign) throw new Error('Campagne non trouvée');
    if (campaign.type !== 'contest_management') throw new Error('Cette campagne n\'est pas un jeu concours');
    
    const currentParticipants = campaign.contest?.participants || [];
    if (!currentParticipants.includes(participant)) {
      const updatedParticipants = [...currentParticipants, participant];
      await updateCampaign(campaignId, {
        contest: {
          ...campaign.contest,
          participants: updatedParticipants,
          isDrawn: false
        }
      });
    }
  } catch (error) {
    throw error;
  }
};

export const drawContestWinner = async (campaignId: string): Promise<string> => {
  try {
    const campaign = await getCampaign(campaignId);
    if (!campaign) throw new Error('Campagne non trouvée');
    if (campaign.type !== 'contest_management') throw new Error('Cette campagne n\'est pas un jeu concours');
    
    const participants = campaign.contest?.participants || [];
    if (participants.length === 0) throw new Error('Aucun participant au jeu concours');
    
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];
    
    await updateCampaign(campaignId, {
      contest: {
        ...campaign.contest,
        winner,
        drawDate: serverTimestamp() as Timestamp,
        isDrawn: true
      }
    });
    
    return winner;
  } catch (error) {
    throw error;
  }
};

export const getActiveCampaigns = async (userId: string): Promise<Campaign[]> => {
  try {
    const db = getFirebaseFirestore();
    const campaignsRef = collection(db, 'campaigns');
    
    const q = query(
      campaignsRef, 
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    const campaigns: Campaign[] = [];
    
    querySnapshot.forEach((doc) => {
      campaigns.push({ ...doc.data(), id: doc.id } as Campaign);
    });
    
    campaigns.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });
    
    return campaigns;
  } catch (error) {
    throw new Error('Impossible de récupérer les campagnes actives');
  }
};

export const getUserCampaignStats = async (userId: string): Promise<{
  total: number;
  active: number;
  paused: number;
  completed: number;
  draft: number;
}> => {
  try {
    const campaigns = await getUserCampaigns(userId);
    
    return {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === 'active').length,
      paused: campaigns.filter(c => c.status === 'paused').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
      draft: campaigns.filter(c => c.status === 'draft').length,
    };
  } catch (error) {
    throw new Error('Impossible de récupérer les statistiques des campagnes');
  }
};