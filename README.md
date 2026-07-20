# HIGHFIVE_TOURNAMENT

Application web complète pour la gestion de tournois d'échecs en présentiel avec système suisse d'appariement automatique.

## Description

HIGHFIVE_TOURNAMENT est une plateforme permettant de créer, gérer et suivre des tournois d'échecs. Elle utilise le système suisse pour les appariements automatiques, gère les classements en temps réel et offre une interface moderne et intuitive.

### Fonctionnalités principales

- **Création de tournois** : Configuration complète (nom, lieu, date, nombre de rondes)
- **Gestion des joueurs** : Inscription avec nom, club, email et classement Elo
- **Appariements automatiques** : Algorithme suisse intelligent
- **Classements en temps réel** : Mise à jour automatique des points
- **Podium final** : Affichage des 3 meilleurs joueurs
- **Thème clair/sombre** : Interface adaptée aux préférences
- **Design responsive** : Compatible mobile et desktop

## Stack technique

### Frontend
- **React 18** : Framework JavaScript
- **TypeScript** : Typage statique
- **Vite** : Build tool et serveur de développement
- **TailwindCSS** : Framework CSS utilitaire
- **Lucide React** : Bibliothèque d'icônes

### Backend
- **Express.js** : Framework web Node.js
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB
- **CORS** : Gestion des requêtes cross-origin
- **Helmet** : Sécurité HTTP headers
- **Rate-limiting** : Protection contre les abus

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur)
- **MongoDB** (v6 ou supérieur)
- **npm** ou **yarn** : Gestionnaire de paquets (inclus avec Node.js)

## Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd HIGHFIVE_TOURNAMENT
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de la base de données MongoDB

#### Option A : MongoDB local

1. **Installer MongoDB** sur votre machine
2. **Démarrer le service MongoDB** :

```bash
# Windows (Service)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# ou
mongod --config /usr/local/etc/mongod.conf
```

3. **Vérifier que MongoDB fonctionne** :

```bash
mongosh
# Vous devriez voir le shell MongoDB
```

#### Option B : MongoDB Atlas (Cloud)

1. Créer un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un nouveau cluster
3. Créer un utilisateur de base de données
4. Obtenir la chaîne de connexion (format : `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>`)

### 4. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/highfive_tournament
# ou pour MongoDB Atlas :
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/highfive_tournament

# Configuration API
PORT=5001
NODE_ENV=development

# Configuration Frontend
VITE_API_URL=http://localhost:5001/api
```

### 5. Structure des fichiers de configuration

Le projet inclut plusieurs fichiers d'environnement :

- `.env` : Configuration principale (à créer)
- `env.development` : Configuration développement
- `env.production` : Configuration production
- `.gitignore` : Fichiers ignorés par Git (inclut `.env` pour la sécurité)

## Démarrage du projet

### Démarrer le backend (API)

```bash
npm run serve
```

L'API sera accessible sur `http://localhost:5001`

### Démarrer le frontend (React)

Dans un nouveau terminal :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Démarrer les deux simultanément

Pour le développement, vous pouvez utiliser deux terminaux séparés :

**Terminal 1 (Backend) :**
```bash
npm run serve
```

**Terminal 2 (Frontend) :**
```bash
npm run dev
```

## Structure du projet

```
HIGHFIVE_TOURNAMENT/
├── src/                          # Frontend React
│   ├── components/               # Composants UI réutilisables
│   │   ├── PlayersTab.tsx       # Gestion des joueurs
│   │   ├── RoundsTab.tsx        # Gestion des rondes
│   │   ├── Podium.tsx           # Affichage du podium
│   │   └── ui.tsx               # Composants UI génériques
│   ├── hooks/                   # Hooks React personnalisés
│   │   ├── useTournaments.ts    # Hook pour la liste des tournois
│   │   └── useTournamentDetail.ts # Hook pour le détail d'un tournoi
│   ├── lib/                     # Utilitaires et bibliothèques
│   │   ├── api.ts               # Client API
│   │   ├── pairing.ts           # Algorithme d'appariement suisse
│   │   └── supabase.ts          # Configuration Supabase (optionnel)
│   ├── pages/                   # Pages de l'application
│   │   ├── TournamentListPage.tsx    # Liste des tournois
│   │   ├── TournamentCreatePage.tsx  # Création de tournoi
│   │   ├── TournamentDetailPage.tsx  # Détail et gestion
│   │   └── StandingsPage.tsx        # Classement
│   ├── types/                   # Types TypeScript
│   │   └── index.ts             # Définitions des types
│   ├── App.tsx                  # Composant principal
│   ├── main.tsx                 # Point d'entrée React
│   └── index.css                # Styles globaux
├── server/                      # Backend Express
│   ├── controllers/             # Contrôleurs API
│   │   ├── tournamentController.js
│   │   ├── playerController.js
│   │   └── matchController.js
│   ├── models/                  # Schémas Mongoose
│   │   ├── tournament.js
│   │   ├── Player.js
│   │   └── Match.js
│   ├── services/                # Logique métier
│   │   ├── tournamentService.js
│   │   ├── playerService.js
│   │   └── matchService.js
│   └── routes/                  # Routes Express
│       └── api.js               # Routes API principales
├── public/                      # Fichiers statiques
│   └── images/                  # Images de l'application
├── types/                       # Types partagés
│   └── chess.ts                 # Types spécifiques aux échecs
├── package.json                 # Dépendances du projet
├── vite.config.ts              # Configuration Vite
├── tsconfig.json               # Configuration TypeScript
├── tailwind.config.js          # Configuration TailwindCSS
└── server.js                   # Point d'entrée du serveur
```

## Utilisation

### 1. Créer un tournoi

1. Cliquez sur "Nouveau tournoi"
2. Remplissez les informations (nom, lieu, date, nombre de rondes)
3. Cliquez sur "Créer le tournoi"

### 2. Inscrire des joueurs

1. Dans l'onglet "Joueurs", cliquez sur "Ajouter"
2. Entrez les informations du joueur (nom, club, email, Elo)
3. Répétez pour tous les participants

### 3. Lancer le tournoi

1. Une fois les joueurs inscrits (minimum 2), cliquez sur "Lancer"
2. La première ronde est générée automatiquement

### 4. Gérer les rondes

1. Dans l'onglet "Rondes", entrez les résultats (1-0, ½-½, 0-1)
2. Une fois tous les résultats saisis, cliquez sur "Ronde suivante"
3. Les appariements sont générés automatiquement

### 5. Terminer le tournoi

1. Après la dernière ronde, cliquez sur "Terminer"
2. Le podium final s'affiche automatiquement

## Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer le frontend (Vite)
npm run serve        # Démarrer le backend (Express avec nodemon)

# Production
npm run build        # Construire le frontend pour la production
npm run start        # Démarrer le backend en production

# Utilitaires
npm run lint         # Exécuter ESLint
npm run typecheck    # Vérifier les types TypeScript
npm run preview      # Prévisualiser le build de production
```

## Base de données

### Collections MongoDB

Le projet utilise 3 collections principales :

1. **tournaments** : Stocke les informations des tournois
2. **players** : Stocke les joueurs et leurs points
3. **matches** : Stocke les matchs et leurs résultats

### Schémas de données

#### Tournament
```javascript
{
  name: String (requis),
  location: String,
  description: String,
  start_date: String,
  status: 'registration' | 'in_progress' | 'completed',
  total_rounds: Number,
  current_round: Number,
  created_at: Date
}
```

#### Player
```javascript
{
  tournament_id: ObjectId (requis),
  name: String (requis),
  email: String,
  club: String,
  rating: Number,
  seed_number: Number,
  points: Number,
  created_at: Date
}
```

#### Match
```javascript
{
  tournament_id: ObjectId (requis),
  round: Number (requis),
  white_player_id: ObjectId,
  black_player_id: ObjectId,
  board_number: Number,
  result: 'pending' | 'white' | 'black' | 'draw',
  created_at: Date
}
```

## Algorithme d'appariement suisse

Le système utilise un algorithme suisse implémenté dans `src/lib/pairing.ts` :

1. **Tri des joueurs** : Par points décroissants, puis par Elo décroissant
2. **Évitement des répétitions** : Un joueur ne rencontre pas deux fois le même adversaire
3. **Équilibre des couleurs** : Distribution équilibrée des couleurs blanc/noir
4. **Gestion des impairs** : Si nombre impair de joueurs, un joueur reçoit un bye (point automatique)

## Dépannage

### MongoDB ne démarre pas

```bash
# Vérifier si MongoDB est installé
mongod --version

# Redémarrer le service MongoDB
# Windows
net stop MongoDB
net start MongoDB

# macOS/Linux
sudo systemctl restart mongod
```

### Erreur de connexion à la base de données

- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez la chaîne de connexion dans `.env`
- Assurez-vous que l'utilisateur MongoDB a les droits nécessaires

### Port déjà utilisé

```bash
# Changer le port dans .env
PORT=5002

# Ou trouver et tuer le processus utilisant le port
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5001 | xargs kill -9
```

### Problèmes de dépendances

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## Notes de développement

- Le projet utilise TypeScript pour le frontend
- Le backend utilise ES6 modules (`"type": "module"` dans package.json)
- L'API REST suit les conventions RESTful
- Les erreurs sont retournées avec des codes HTTP appropriés
- Les mots de passe et clés API ne doivent jamais être commités

## Contribution

Pour contribuer au projet :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit vos changements (`git commit -m 'Ajout de ma feature'`)
4. Push vers la branche (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence privée.

## Support

Pour toute question ou problème, contactez l'équipe de développement.

---

Développé pour la communauté des échecs
