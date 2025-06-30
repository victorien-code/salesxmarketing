import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ERROR_MESSAGES, LIMITS } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utilitaires de validation
export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  instagramUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    return usernameRegex.test(username) && username.length >= 1 && username.length <= 30;
  },

  hashtag: (hashtag: string): boolean => {
    const hashtagRegex = /^[a-zA-Z0-9_]+$/;
    return hashtagRegex.test(hashtag) && hashtag.length >= 1 && hashtag.length <= 100;
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  fileSize: (size: number): boolean => {
    return size <= LIMITS.MAX_FILE_SIZE;
  },

  fileType: (type: string, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(type);
  }
};

// Utilitaires de formatage
export const format = {
  number: (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  },

  currency: (amount: number, currency = 'EUR'): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency
    }).format(amount);
  },

  date: (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', options).format(dateObj);
  },

  relativeTime: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    
    return format.date(dateObj, { day: '2-digit', month: '2-digit' });
  },

  fileSize: (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  },

  percentage: (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  }
};

// Utilitaires de manipulation de chaînes
export const string = {
  truncate: (str: string, length: number): string => {
    if (str.length <= length) return str;
    return `${str.substring(0, length)}...`;
  },

  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  extractHashtags: (text: string): string[] => {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  },

  extractMentions: (text: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9._]+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(mention => mention.substring(1)) : [];
  },

  removeEmojis: (str: string): string => {
    return str.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  }
};

// Utilitaires de gestion d'erreurs
export const error = {
  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'Aucun compte trouvé avec cette adresse email.';
        case 'auth/wrong-password':
          return 'Mot de passe incorrect.';
        case 'auth/email-already-in-use':
          return 'Cette adresse email est déjà utilisée.';
        case 'auth/weak-password':
          return 'Le mot de passe doit contenir au moins 6 caractères.';
        case 'auth/invalid-email':
          return 'Adresse email invalide.';
        case 'auth/invalid-credential':
          return 'Identifiants invalides.';
        case 'auth/too-many-requests':
          return 'Trop de tentatives. Veuillez réessayer plus tard.';
        case 'failed-precondition':
          return 'Index Firestore manquant. Consultez la documentation.';
        default:
          return ERROR_MESSAGES.SERVER_ERROR;
      }
    }
    return ERROR_MESSAGES.SERVER_ERROR;
  },

  isNetworkError: (error: any): boolean => {
    return error?.message?.includes('Failed to fetch') || 
           error?.name === 'TypeError' ||
           error?.code === 'network-request-failed';
  },

  isAuthError: (error: any): boolean => {
    return error?.code?.startsWith('auth/') || 
           error?.message?.includes('unauthorized') ||
           error?.message?.includes('token');
  }
};

// Utilitaires de performance
export const performance = {
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  memoize: <T extends (...args: any[]) => any>(func: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }
};

// Utilitaires de stockage local
export const storage = {
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  },

  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      return defaultValue || null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }
};

// Utilitaires de génération
export const generate = {
  id: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  uuid: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  color: (): string => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  },

  avatar: (name: string): string => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    return `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff`;
  }
};

// Utilitaires de copie
export const clipboard = {
  copy: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      return false;
    }
  },

  read: async (): Promise<string | null> => {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      return null;
    }
  }
};

// Utilitaires de téléchargement
export const download = {
  file: (data: string, filename: string, type = 'text/plain'): void => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  json: (data: any, filename: string): void => {
    download.file(JSON.stringify(data, null, 2), filename, 'application/json');
  },

  csv: (data: any[], filename: string): void => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    download.file(csvContent, filename, 'text/csv');
  }
};