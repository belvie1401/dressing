# Mon Dressing — Votre dressing intelligent

Plateforme full-stack de garde-robe numérique avec IA, stylistes et planification de tenues.

## Architecture

```
mon-dressing/
├── frontend/   → Next.js 16 + TypeScript + Tailwind CSS
├── backend/    → Express + TypeScript + Prisma + Socket.io
└── docker-compose.yml
```

## Fonctionnalités

- **Dressing numérique** — Photographiez et cataloguez vos vêtements
- **Scan IA** — Analyse automatique des vêtements par Claude Vision (catégorie, couleurs, matière, style)
- **Suggestions de tenues** — L'IA compose des looks adaptés à la météo, l'occasion et votre style
- **ADN de Style** — Analyse de votre profil vestimentaire
- **Calendrier de tenues** — Planifiez vos looks à l'avance
- **Styliste personnel** — Connectez-vous avec des stylistes professionnels
- **Lookbooks** — Recevez des propositions de looks personnalisées
- **Messagerie temps réel** — Échangez avec votre styliste via Socket.io
- **Abonnements** — Plans Free / Client Pro / Styliste Pro via Stripe

## Prérequis

- Node.js 18+
- PostgreSQL 15+
- Comptes : Cloudinary, Anthropic (Claude), OpenWeatherMap, Stripe, Supabase (optionnel)

## Installation rapide

### 1. Cloner le projet

```bash
git clone <repo-url>
cd mon-dressing
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Remplir les variables dans .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Le serveur démarre sur `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# Remplir les variables dans .env.local
npm install
npm run dev
```

L'application démarre sur `http://localhost:3000`.

## Installation avec Docker

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Remplir les variables d'environnement

docker compose up -d
```

Services :
- Frontend : `http://localhost:3000`
- Backend : `http://localhost:4000`
- PostgreSQL : `localhost:5432`
- Redis : `localhost:6379`

## Variables d'environnement

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port du serveur (défaut: 4000) |
| `DATABASE_URL` | URL PostgreSQL |
| `JWT_SECRET` | Secret JWT pour l'authentification |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary |
| `ANTHROPIC_API_KEY` | Clé API Anthropic (Claude) |
| `OPENWEATHER_API_KEY` | Clé API OpenWeatherMap |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `FRONTEND_URL` | URL du frontend (CORS) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe |
| `NEXT_PUBLIC_SOCKET_URL` | URL Socket.io |

## Scripts

### Backend

```bash
npm run dev      # Développement avec hot-reload
npm run build    # Compilation TypeScript
npm start        # Production
```

### Frontend

```bash
npm run dev      # Développement
npm run build    # Build production
npm start        # Serveur production
```

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Backend | Express 5, TypeScript |
| Base de données | PostgreSQL + Prisma ORM |
| Temps réel | Socket.io |
| IA | Claude (Anthropic) — Vision + génération |
| Images | Cloudinary (upload + suppression de fond) |
| Météo | OpenWeatherMap API |
| Paiements | Stripe (abonnements) |
| Auth | JWT + bcrypt |

## Licence

MIT
