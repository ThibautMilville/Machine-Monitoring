# BankAlpha Network Monitor

Un outil de supervision réseau en temps réel développé avec React, TypeScript et Node.js. Cette application permet de surveiller l'état de connexion de différentes machines/serveurs via des pings automatiques.

## 🚀 Fonctionnalités

### 🔧 Monitoring & Surveillance
- **Surveillance en temps réel** : Monitoring automatique toutes les 30 secondes
- **Test de connectivité** : Validation des machines avant ajout
- **Ping manuel** : Test immédiat de connectivité pour chaque machine
- **Historique des statuts** : Conservation de l'historique des 50 dernières vérifications
- **Calcul d'uptime** : Pourcentage de disponibilité basé sur l'historique

### 📊 Dashboard & Statistiques
- **Dashboard interactif** : Vue d'ensemble avec statistiques en temps réel
- **Statistiques avancées** : Métriques détaillées de performance
- **Bannière de performance** : Affichage en temps réel des KPI principaux
- **Graphiques de statut** : Visualisation de la distribution des états

### 🚨 Système d'Alertes
- **Alertes automatiques** : Notifications lors des changements d'état
- **Alertes de lenteur** : Détection des temps de réponse élevés (>1s)
- **Centre d'alertes** : Gestion centralisée avec confirmations
- **Indicateur visuel** : Badge avec compteur d'alertes non confirmées

### 🛠️ Gestion des Machines
- **Catégorisation** : Classification par type (Serveur, Routeur, etc.)
- **Validation intelligente** : Vérification des doublons et champs requis
- **Interface améliorée** : Design moderne avec icônes et indicateurs visuels
- **Données riches** : Description, catégorie, temps de création

### 🎨 Interface Utilisateur
- **Design moderne** : Interface responsive avec dégradés et animations
- **Thème cohérent** : Palette de couleurs harmonieuse
- **Expérience fluide** : Transitions et interactions optimisées
- **Accessibilité** : Interface intuitive et accessible

### ⚡ Backend Robuste
- **API REST complète** : Endpoints pour toutes les fonctionnalités
- **Gestion des erreurs** : Logging détaillé et gestion d'erreurs robuste
- **Cross-platform** : Support Windows, Linux, macOS
- **Stockage JSON** : Persistance des données simple et fiable

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 16 ou supérieure)
- **npm** (généralement inclus avec Node.js)

Vérifiez vos versions :
```bash
node --version
npm --version
```

## 🛠️ Installation

1. **Cloner le projet** (si applicable) ou naviguer vers le dossier du projet :
```bash
cd poc-cesi
```

2. **Installer les dépendances** :
```bash
npm install
```

## 🎯 Démarrage rapide

### Démarrage en mode développement (recommandé)

Pour démarrer à la fois le serveur backend et le frontend en une seule commande :

```bash
npm run dev
```

Cette commande lance :
- Le serveur Node.js sur `http://localhost:3001`
- L'application React (Vite) sur `http://localhost:5173`

### Démarrage séparé

Si vous préférez lancer les services séparément :

**1. Démarrer le serveur backend :**
```bash
npm run server
```

**2. Dans un nouveau terminal, démarrer le frontend :**
```bash
npx vite
```

## 🌐 Accès à l'application

Une fois les services démarrés, ouvrez votre navigateur et accédez à :
- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:3001

## 📖 Utilisation

### 1. Dashboard Principal

Le dashboard offre une vue d'ensemble complète :
- **Cartes de machines** : Statut, temps de réponse, uptime
- **Statistiques globales** : Résumé des machines par statut
- **Bannière de performance** : KPI en temps réel (uptime moyen, temps de réponse)
- **Monitoring automatique** : Activation/désactivation du suivi continu
- **Actions rapides** : Ping manuel de toutes les machines

### 2. Gestion des Machines

Interface avancée de gestion :
- **Ajout intelligent** : 
  - Formulaire avec validation en temps réel
  - Test de connectivité avant ajout
  - Catégorisation automatique avec icônes
  - Vérification des doublons
- **Vue tableau enrichie** :
  - Informations détaillées (catégorie, uptime, dernière vérification)
  - Actions rapides (ping individuel, suppression)
  - Tri et filtrage des machines
- **Validation** : Contrôles de saisie et messages d'erreur explicites

### 3. Système d'Alertes

Centre de notification avancé :
- **Alertes automatiques** :
  - Changement d'état (en ligne ↔ hors ligne)
  - Temps de réponse élevé (>1 seconde)
  - Horodatage et machine concernée
- **Gestion des alertes** :
  - Liste chronologique avec filtrage
  - Confirmation individuelle des alertes
  - Indicateur visuel dans l'en-tête
  - Historique des 100 dernières alertes

### 4. Statistiques Détaillées

Tableau de bord analytique :
- **Métriques globales** : Machines totales, uptime moyen, temps de réponse
- **Distribution des statuts** : Graphiques en barres avec pourcentages
- **Indicateurs de performance** : Seuils visuels (vert/orange/rouge)
- **Mise à jour temps réel** : Refresh automatique toutes les 10 secondes

### 5. Monitoring Automatique

Surveillance intelligente :
- **Fréquence** : Vérifications automatiques toutes les 30 secondes
- **Persistance** : Historique des 50 dernières vérifications par machine
- **Calculs automatiques** : Pourcentage d'uptime basé sur l'historique
- **États** : En ligne, Hors ligne, Inconnu (avec indicateurs visuels)
- **Métriques** : Temps de réponse, dernière vérification, tendances

## 🏗️ Structure du projet

```
poc-cesi/
├── src/                    # Code source frontend (React + TypeScript)
│   ├── components/         # Composants React
│   │   ├── Dashboard.tsx
│   │   ├── MachineCard.tsx
│   │   └── MachineManager.tsx
│   ├── types/              # Types TypeScript
│   │   └── index.ts
│   ├── App.tsx             # Composant principal
│   └── main.tsx           # Point d'entrée
├── server/                 # Code source backend (Node.js)
│   ├── data/              # Stockage des données (JSON)
│   └── index.js           # Serveur Express
├── package.json           # Dépendances et scripts
└── README.md             # Ce fichier
```

## 🔧 Scripts disponibles

- `npm run dev` : Démarre frontend et backend simultanément
- `npm run server` : Démarre uniquement le serveur backend
- `npm run build` : Compile l'application pour la production
- `npm run preview` : Prévisualise la version de production
- `npm run lint` : Vérifie la qualité du code

## 🛡️ API Endpoints

Le backend expose les endpoints suivants :

### 🖥️ Machines
- `GET /api/machines` : Récupérer toutes les machines avec statistiques d'uptime
- `POST /api/machines` : Ajouter une nouvelle machine (avec validation)
- `PUT /api/machines/:id` : Mettre à jour une machine
- `DELETE /api/machines/:id` : Supprimer une machine
- `POST /api/machines/:id/ping` : Ping d'une machine spécifique
- `POST /api/machines/ping-all` : Ping de toutes les machines

### 🚨 Alertes
- `GET /api/alerts` : Récupérer toutes les alertes
- `PATCH /api/alerts/:id/acknowledge` : Confirmer une alerte

### 📊 Statistiques
- `GET /api/stats` : Récupérer les statistiques globales du système

### 🔧 Utilitaires
- `POST /api/test-connectivity` : Tester la connectivité avant ajout
- `GET /api/health` : Vérification de l'état du serveur

## 💾 Stockage des données

Les données sont stockées dans un fichier JSON local :
- Chemin : `server/data/machines.json`
- Le fichier est créé automatiquement au premier démarrage
- Format : Tableau d'objets Machine avec historique

## 🎨 Technologies utilisées

### Frontend
- **React 18** : Framework JavaScript
- **TypeScript** : Typage statique
- **Vite** : Outil de build et serveur de développement
- **Tailwind CSS** : Framework CSS utilitaire
- **Lucide React** : Icônes

### Backend
- **Node.js** : Runtime JavaScript
- **Express** : Framework web
- **CORS** : Gestion des requêtes cross-origin
- **ping** : Utilitaire de ping réseau

## 🔍 Développement

### Linting
```bash
npm run lint
```

### Build de production
```bash
npm run build
```

### Prévisualisation de production
```bash
npm run preview
```

## 🐛 Dépannage

### Problèmes courants

1. **Port déjà utilisé** :
   - Frontend (5173) ou Backend (3001) déjà occupé
   - Solution : Arrêter les autres processus ou modifier les ports

2. **Erreur de ping** :
   - Certains systèmes peuvent nécessiter des privilèges administrateur pour le ping
   - Solution : Lancer avec `sudo` si nécessaire (Linux/macOS)

3. **Connexion refusée** :
   - Vérifier que le serveur backend est bien démarré
   - Vérifier l'URL dans le code frontend (localhost:3001)

### Logs

Les logs du serveur s'affichent dans le terminal. En cas d'erreur, vérifiez :
- La console du navigateur (F12)
- Les logs du terminal serveur
- La connectivité réseau vers les machines à surveiller

## 📝 Licence

Ce projet est développé dans le cadre d'une POC (Proof of Concept) pour CESI.

---

🚀 **Bon développement !** 