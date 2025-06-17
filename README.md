# Système de Monitoring - POC CESI

## 📋 Description

Application de monitoring de serveurs développée en React + TypeScript. Cette application simule la surveillance de 5 serveurs français (Paris, Marseille, Lyon, Toulouse, Bordeaux) avec des fonctionnalités de ping et de simulation de pannes.

## ✨ Fonctionnalités

- 🖥️ **Dashboard en temps réel** : Vue d'ensemble de l'état des serveurs
- 🔍 **Tests de connectivité** : Ping individuel ou global des serveurs
- ⚠️ **Simulation de pannes** : Bouton dédié pour simuler des pannes/rétablissements
- 📊 **Statistiques** : Uptime, latence, historique des connexions
- 🔄 **Surveillance automatique** : Monitoring continu avec intervalle configurable
- 💾 **Persistance locale** : Données sauvegardées dans le localStorage
- 🎲 **Simulation automatique** : Changements d'état aléatoires pour démonstration

## 🏗️ Architecture

L'application fonctionne **entièrement côté frontend** sans nécessiter de serveur backend :

- **Frontend** : React + TypeScript + Tailwind CSS
- **Simulation** : Service mock intégré qui simule les pings et la gestion des données
- **Persistance** : localStorage du navigateur
- **Serveurs simulés** : 5 serveurs français avec adresses IP fictives affichées

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone <url-du-repo>
cd poc-cesi

# Installer les dépendances
npm install
```

### Démarrage
```bash
# Démarrer l'application en mode développement
npm run dev

# L'application sera accessible sur http://localhost:5173
```

## 🖥️ Utilisation

### Dashboard
- **Vue d'ensemble** : Statistiques globales (serveurs en ligne/hors ligne)
- **Cartes serveurs** : Informations détaillées pour chaque serveur
- **Test de connectivité** : Bouton "Tester la connectivité" sur chaque carte
- **Simulation de panne** : Bouton rouge/vert pour simuler des pannes/rétablissements

### Surveillance Automatique
1. Configurer l'intervalle de surveillance (5-300 secondes)
2. Cliquer sur "Démarrer surveillance"
3. L'application teste automatiquement tous les serveurs à l'intervalle défini
4. Des changements d'état aléatoires se produisent automatiquement pour la démonstration

### Gestion des Machines
- **Ajouter** : Nouvelles machines via le formulaire dédié
- **Supprimer** : Bouton de suppression sur chaque machine
- **Tester** : Test individuel de connectivité

## 🎯 Serveurs Configurés

| Nom | Ville | IP Affichée | IP Réelle (pour ping) |
|-----|-------|-------------|----------------------|
| SRV-PARIS-001 | Paris | 192.168.1.10 | 8.8.8.8 |
| SRV-MARSEILLE-001 | Marseille | 192.168.2.10 | 1.1.1.1 |
| SRV-LYON-001 | Lyon | 192.168.3.10 | 9.9.9.9 |
| SRV-TOULOUSE-001 | Toulouse | 192.168.4.10 | 8.8.4.4 |
| SRV-BORDEAUX-001 | Bordeaux | 192.168.5.10 | 208.67.222.222 |

## 🔧 Fonctionnalités Techniques

### Simulation de Ping
- Utilise des serveurs DNS publics fiables pour garantir des réponses
- Simule des temps de réponse réalistes (10-110ms)
- Taux de succès de 95% pour les serveurs fiables
- Délais de ping simulés (200ms-1200ms)

### Persistance des Données
- Sauvegarde automatique dans localStorage
- Historique des pings (50 dernières entrées par serveur)
- Calcul automatique des pourcentages d'uptime

### Interface Utilisateur
- Design moderne avec Tailwind CSS
- Animations et transitions fluides
- Interface responsive
- Indicateurs visuels en temps réel

## 📁 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── Dashboard.tsx    # Tableau de bord principal
│   ├── MachineCard.tsx  # Carte individuelle de serveur
│   ├── MachineManager.tsx # Gestion des machines
│   └── ...
├── services/           # Services métier
│   └── mockService.ts  # Service de simulation
├── types/             # Types TypeScript
│   └── index.ts       # Définitions des types
└── App.tsx           # Composant principal
```

## 🎨 Personnalisation

### Ajouter de Nouveaux Serveurs
1. Modifier `initialMachines` dans `src/services/mockService.ts`
2. Ajouter le mapping IP dans `getDisplayIP()` des composants
3. Les données seront automatiquement persistées

### Modifier les Intervalles
- Surveillance : 5-300 secondes (configurable dans l'UI)
- Simulation aléatoire : 45 secondes (modifiable dans App.tsx)

## 🐛 Dépannage

### Les serveurs ne répondent pas
- Vérifiez votre connexion internet
- Les pings utilisent des serveurs DNS publics réels

### Données perdues
- Les données sont stockées dans localStorage
- Vider le cache du navigateur réinitialise les données

### Performance
- L'application est optimisée pour fonctionner sans serveur
- Tous les calculs sont effectués côté client

## 📝 Notes de Développement

Cette application a été développée comme preuve de concept (POC) pour démontrer :
- Architecture frontend-only
- Simulation réaliste de monitoring
- Interface utilisateur moderne
- Gestion d'état React avancée

L'utilisation de serveurs DNS publics permet d'avoir des pings réels tout en conservant l'illusion de serveurs internes français.
