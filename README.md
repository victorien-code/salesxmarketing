# SalesXMarketing

Automatisez l'engagement avec votre communauté Instagram existante grâce à SalesXMarketing. Messages directs personnalisés, vérification des followers, et gestion de jeux concours automatisée.

## 🚀 Fonctionnalités

### Engagement Automatisé
- **Messages directs personnalisés** à vos followers et utilisateurs engagés
- **Vérification automatique** du statut de follower avant envoi
- **Workflows intelligents** déclenchés par les interactions
- **Gestion complète des jeux concours** avec tirage au sort intégré

### Planification de Contenu
- **Planificateur avancé** pour vos publications Instagram
- **Vue calendrier** pour organiser votre contenu
- **Gestion des médias** (images, vidéos, carrousels)
- **Programmation automatique** des publications

### Analytics et Suivi
- **Métriques d'engagement** en temps réel
- **Analyses de performance** par campagne
- **Optimisation des créneaux** de publication
- **Rapports détaillés** sur vos résultats

### Messagerie Unifiée
- **Interface centralisée** pour tous vos messages Instagram
- **Réponses automatiques** et personnalisées
- **Gestion des conversations** avec historique complet
- **Synchronisation en temps réel** avec Instagram

## 🛠️ Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Backend**: Firebase (Auth, Firestore, Storage)
- **API**: Instagram Basic Display, Instagram Graph API
- **Déploiement**: Vercel, Netlify

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/salesxmarketing/app.git
cd salesxmarketing

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Lancer en développement
npm run dev
```

## 🔧 Configuration

### Variables d'environnement

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Instagram API
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_instagram_app_id
NEXT_PUBLIC_INSTAGRAM_APP_SECRET=your_instagram_app_secret
```

### Configuration Firebase

1. Créer un projet Firebase
2. Activer Authentication (Email/Password, Google)
3. Configurer Firestore avec les règles de sécurité
4. Créer les index composites nécessaires

### Configuration Instagram API

1. Créer une application Meta for Developers
2. Ajouter Instagram Basic Display
3. Configurer les URLs de redirection
4. Obtenir les clés API

## 📱 Utilisation

### 1. Connexion Instagram
- Connectez votre compte Instagram via l'interface
- Suivez le guide vidéo intégré
- Vérifiez la connexion et les permissions

### 2. Création de Campagnes
- Choisissez le type d'engagement souhaité
- Configurez votre audience cible
- Personnalisez vos messages
- Lancez votre campagne

### 3. Planification de Contenu
- Créez vos posts avec médias
- Planifiez vos publications
- Suivez vos performances
- Optimisez votre stratégie

## 🔒 Sécurité

- **Chiffrement** des tokens d'accès
- **Authentification** sécurisée avec Firebase
- **Validation** côté client et serveur
- **Respect** des limites API Instagram
- **Conformité** RGPD

## 📊 Limites et Quotas

### Plan Freemium (3 mois gratuits)
- 3 campagnes actives
- 50 posts planifiés
- 50 messages/jour
- 1 compte Instagram

### Plan Pro (79€/mois)
- Campagnes illimitées
- 1000 posts planifiés
- 300 messages/jour
- 3 comptes Instagram

## 🤝 Support

- **Documentation**: [docs.salesxmarketing.com](https://docs.salesxmarketing.com)
- **Support**: support@salesxmarketing.com
- **Discord**: [Rejoindre la communauté](https://discord.gg/salesxmarketing)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Radix UI](https://www.radix-ui.com/) pour les composants
- [Firebase](https://firebase.google.com/) pour l'infrastructure
- [Lucide](https://lucide.dev/) pour les icônes

---

Développé avec ❤️ par l'équipe SalesXMarketing