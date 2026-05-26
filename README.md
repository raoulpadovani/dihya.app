# 🍽️ Dihya - Plateforme de Gestion Restauration

Dihya est une application web complète de gestion pour restaurants, offrant des fonctionnalités de réservation, de gestion de menus, de devis pour traiteurs et un système d'administration.

## ✨ Fonctionnalités

### Client
- 🏠 **Accueil** - Page d'accueil du restaurant
- 🗓️ **Réservations** - Système de réservation de tables avec calendrier interactif
- 🍴 **Menu** - Consultation du menu du restaurant avec calendrier des plats du jour
- 🍱 **Traiteur** - Demandes de devis pour services de catering
- 👤 **Profil** - Gestion du profil utilisateur
- 🔐 **Authentification** - Inscription et connexion sécurisées

### Admin
- 📊 **Dashboard** - Vue d'ensemble de la gestion
- 🗓️ **Menu du Jour** - Gestion du menu quotidien
- 🍽️ **Menu** - Gestion complète du menu
- 💬 **Devis** - Gestion des demandes de catering
- 📅 **Réservations** - Gestion des réservations

## 🛠️ Tech Stack

### Frontend
- **React** 18.3
- **Vite** - Build tool rapide
- **React Router** - Navigation
- **Axios** - Client HTTP

### Backend
- **Node.js/Express** - Framework web
- **MySQL** - Base de données
- **JWT** - Authentification
- **Bcryptjs** - Chiffrement des mots de passe
- **Nodemailer** - Envoi d'emails
- **CORS** - Gestion des requêtes cross-origin

## 📋 Prérequis

- Node.js >= 14.x
- npm ou yarn
- MySQL Server

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/raoulpadovani/dihya.app.git
cd dihya.app
```

### 2. Configuration du Backend

```bash
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos paramètres (DB, JWT_SECRET, EMAIL, etc.)
nano .env

# Initialiser la base de données
node setup-db.js

# Démarrer le serveur de développement
npm run dev
```

### 3. Configuration du Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Éditer .env avec l'URL de l'API
nano .env

# Démarrer le serveur de développement
npm run dev
```

## 📁 Structure du Projet

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/    # Logique métier
│   │   ├── models/         # Modèles de données
│   │   ├── routes/         # Routes API
│   │   ├── middlewares/    # Middlewares Express
│   │   ├── config/         # Configuration
│   │   └── utils/          # Utilitaires
│   ├── database/
│   │   └── schema.sql      # Schéma MySQL
│   ├── server.js           # Point d'entrée
│   └── setup-db.js         # Script d'initialisation DB
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # Pages React
│   │   ├── components/     # Composants réutilisables
│   │   ├── services/       # Appels API
│   │   ├── context/        # Context API
│   │   ├── styles/         # Styles CSS
│   │   └── utils/          # Utilitaires
│   ├── index.html
│   └── vite.config.js
│
└── maquette/               # Prototypes
```

## 🔧 Variables d'Environnement

### Backend (.env)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=dihya

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

### Menu
- `GET /api/menu` - Récupérer le menu
- `POST /api/menu` - Créer un plat (Admin)
- `PUT /api/menu/:id` - Modifier un plat (Admin)
- `DELETE /api/menu/:id` - Supprimer un plat (Admin)

### Menu du Jour
- `GET /api/daily-menu` - Récupérer le menu du jour
- `POST /api/daily-menu` - Ajouter plat du jour (Admin)

### Réservations
- `GET /api/reservations` - Récupérer les réservations
- `POST /api/reservations` - Créer une réservation
- `PUT /api/reservations/:id` - Modifier une réservation
- `DELETE /api/reservations/:id` - Annuler une réservation

### Traiteur (Catering)
- `GET /api/catering` - Récupérer les devis
- `POST /api/catering` - Créer une demande de devis
- `PUT /api/catering/:id` - Modifier un devis (Admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats

## 🔐 Authentification

L'application utilise JWT (JSON Web Tokens) pour sécuriser les requêtes. Les tokens sont stockés dans le localStorage et envoyés dans l'en-tête `Authorization: Bearer <token>`.

## 📦 Build pour Production

### Frontend
```bash
cd frontend
npm run build
# Fichiers dans frontend/dist/
```

### Backend
Le backend peut être déployé directement avec `npm start` ou utiliser PM2 pour la production.

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifier que MySQL est en cours d'exécution
- Vérifier les paramètres dans .env
- Vérifier que le schéma DB est créé avec `node setup-db.js`

### Erreur CORS
- Vérifier l'URL de l'API dans le fichier .env du frontend
- S'assurer que le CORS est activé dans le backend

### Port déjà utilisé
- Changer le port dans .env du backend (par défaut 5000)

## 🤝 Contribution

Les contributions sont bienvenues! Veuillez:
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 👤 Auteur

**Raoul Padovani**
- GitHub: [@raoulpadovani](https://github.com/raoulpadovani)

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur [GitHub Issues](https://github.com/raoulpadovani/dihya.app/issues).

---

**Dihya** © 2026. Tous droits réservés.
