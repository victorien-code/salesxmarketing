// Configuration globale de l'application
export const APP_CONFIG = {
  name: 'SalesXMarketing',
  description: 'Automatisez l\'engagement avec votre communauté Instagram existante',
  version: '1.0.0',
  author: 'SalesXMarketing Team',
  url: 'https://salesxmarketing.com',
  social: {
    twitter: '@salesxmarketing',
    instagram: '@salesxmarketing',
    linkedin: 'salesxmarketing'
  }
} as const;

// Limites et contraintes
export const LIMITS = {
  // Messages
  MAX_MESSAGE_LENGTH: 2200,
  MAX_MESSAGES_PER_DAY: 100,
  MIN_DELAY_BETWEEN_MESSAGES: 30, // minutes
  
  // Fichiers
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_POST: 10,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/mov', 'video/avi'],
  
  // Campagnes
  MAX_CAMPAIGNS_FREE: 3,
  MAX_CAMPAIGNS_PRO: 10,
  MAX_CAMPAIGNS_ENTERPRISE: -1, // illimité
  
  // CSV
  MAX_CSV_ROWS: 10000,
  MAX_CSV_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Hashtags et mentions
  MAX_HASHTAGS: 30,
  MAX_MENTIONS: 20,
  
  // Posts planifiés
  MAX_SCHEDULED_POSTS_FREE: 50,
  MAX_SCHEDULED_POSTS_PRO: 500,
  MAX_SCHEDULED_POSTS_ENTERPRISE: -1 // illimité
} as const;

// URLs et endpoints
export const ENDPOINTS = {
  INSTAGRAM_BASIC_DISPLAY: 'https://graph.instagram.com',
  INSTAGRAM_GRAPH: 'https://graph.instagram.com',
  META_DEVELOPERS: 'https://developers.facebook.com',
  FIREBASE_CONSOLE: 'https://console.firebase.google.com'
} as const;

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  TOKEN_EXPIRED: 'Votre token Instagram a expiré. Veuillez reconnecter votre compte.',
  UNAUTHORIZED: 'Accès non autorisé. Veuillez vous reconnecter.',
  NOT_FOUND: 'Ressource non trouvée.',
  VALIDATION_ERROR: 'Données invalides. Veuillez vérifier vos informations.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  QUOTA_EXCEEDED: 'Quota dépassé. Veuillez attendre avant de réessayer.',
  FILE_TOO_LARGE: 'Fichier trop volumineux. Taille maximale autorisée: 10MB.',
  UNSUPPORTED_FILE_TYPE: 'Type de fichier non supporté.',
  INSTAGRAM_API_ERROR: 'Erreur de l\'API Instagram. Veuillez réessayer.',
  CAMPAIGN_LIMIT_REACHED: 'Limite de campagnes atteinte pour votre plan.',
  POST_LIMIT_REACHED: 'Limite de posts planifiés atteinte pour votre plan.'
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  CAMPAIGN_CREATED: 'Campagne créée avec succès !',
  CAMPAIGN_UPDATED: 'Campagne mise à jour avec succès !',
  CAMPAIGN_DELETED: 'Campagne supprimée avec succès !',
  POST_SCHEDULED: 'Post planifié avec succès !',
  POST_PUBLISHED: 'Post publié avec succès !',
  MESSAGE_SENT: 'Message envoyé avec succès !',
  ACCOUNT_CONNECTED: 'Compte Instagram connecté avec succès !',
  DATA_SYNCED: 'Données synchronisées avec succès !',
  SETTINGS_SAVED: 'Paramètres sauvegardés avec succès !'
} as const;

// Configuration des plans tarifaires
export const PRICING_PLANS = {
  FREE: {
    name: 'Freemium',
    price: 0,
    duration: 90, // jours
    features: {
      campaigns: 3,
      scheduledPosts: 50,
      messagesPerDay: 50,
      accounts: 1,
      analytics: true,
      support: 'email'
    }
  },
  STARTER: {
    name: 'Starter',
    price: 29,
    duration: 30, // jours
    features: {
      campaigns: 10,
      scheduledPosts: 200,
      messagesPerDay: 100,
      accounts: 1,
      analytics: true,
      support: 'email'
    }
  },
  PRO: {
    name: 'Pro',
    price: 79,
    duration: 30,
    features: {
      campaigns: -1, // illimité
      scheduledPosts: 1000,
      messagesPerDay: 300,
      accounts: 3,
      analytics: true,
      support: 'priority'
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 199,
    duration: 30,
    features: {
      campaigns: -1,
      scheduledPosts: -1,
      messagesPerDay: 1000,
      accounts: -1,
      analytics: true,
      support: 'dedicated'
    }
  }
} as const;

// Configuration des types de campagnes
export const CAMPAIGN_TYPES = {
  FOLLOWER_ENGAGEMENT: {
    id: 'follower_engagement',
    name: 'Engagement Followers',
    description: 'Envoi de messages directs à vos followers avec vérification automatique',
    icon: 'Users',
    features: ['Vérification des followers', 'Messages personnalisés', 'Respect des limites API']
  },
  INTERACTION_TRIGGER: {
    id: 'interaction_trigger',
    name: 'Déclenchement par Interaction',
    description: 'Messages automatiques aux utilisateurs qui interagissent avec vos contenus',
    icon: 'MessageCircle',
    features: ['Déclenchement automatique', 'Réponse aux interactions', 'Workflow intelligent']
  },
  CONTEST_MANAGEMENT: {
    id: 'contest_management',
    name: 'Gestion de Jeux Concours',
    description: 'Automatisation complète de vos jeux concours avec tirage au sort intégré',
    icon: 'Trophy',
    features: ['Messages de confirmation', 'Tirage au sort automatique', 'Gestion complète']
  }
} as const;

// Configuration des statuts
export const STATUS_CONFIG = {
  CAMPAIGN: {
    DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
    ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-800' },
    PAUSED: { label: 'En pause', color: 'bg-yellow-100 text-yellow-800' },
    COMPLETED: { label: 'Terminé', color: 'bg-blue-100 text-blue-800' },
    FAILED: { label: 'Échec', color: 'bg-red-100 text-red-800' }
  },
  POST: {
    DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
    SCHEDULED: { label: 'Planifié', color: 'bg-blue-100 text-blue-800' },
    PUBLISHED: { label: 'Publié', color: 'bg-green-100 text-green-800' },
    FAILED: { label: 'Échec', color: 'bg-red-100 text-red-800' }
  }
} as const;

// Configuration des formats de date
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
} as const;

// Configuration des animations
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  }
} as const;