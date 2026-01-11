# 🚀 Tada - Guide du Développeur

![Tada Hero](image.png)

Tada est une plateforme SaaS complète pour la recherche de marché en temps réel et la collecte de données. Ce guide complet vous aidera à démarrer rapidement sur le projet.

## 📋 Table des matières

1. [Aperçu du Projet](#-aperçu-du-projet)
2. [Architecture du Monorepo](#-architecture-du-monorepo)
3. [Prérequis](#-prérequis)
4. [Installation & Configuration](#-installation--configuration)
5. [Applications](#-applications)
6. [Packages Partagés](#-packages-partagés)
7. [Commandes de Développement](#-commandes-de-développement)
8. [Base de Données](#-base-de-données)
9. [Authentification](#-authentification)
10. [Workflow de Développement](#-workflow-de-développement)
11. [Tests & Qualité](#-tests--qualité)
12. [Déploiement](#-déploiement)
13. [Dépannage](#-dépannage)

## 🎯 Aperçu du Projet

**Tada** est une plateforme complète de recherche de marché qui permet :

- **Création et gestion de sondages** avec des outils avancés
- **Collecte de données en temps réel** avec des tableaux de bord interactifs
- **Analyse et visualisation** avec des graphiques personnalisables
- **Gestion multi-organisations** avec des permissions granulaires
- **Collaboration en temps réel** entre les équipes
- **Export de données** en CSV et PowerPoint

### Stack Technique Principal
- **Framework** : Next.js 14 avec App Router
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : better-auth avec OAuth multi-providers
- **UI** : TailwindCSS + shadcn/ui + HeroUI
- **Build System** : Turborepo (monorepo)
- **Package Manager** : Bun
- **Langages** : TypeScript (100%), React 18

## 🏗️ Architecture du Monorepo

```
tada/
├── apps/                    # Applications principales
│   ├── web/                # Landing page entreprise (port 3001)
│   ├── app/                # Application principale (port 3000)
│   ├── admin/              # Panel d'administration (port 3002)
│   ├── contributors/       # Landing page contributeurs (port 3003)
│   └── api/                # Backend Supabase
├── packages/               # Packages partagés
│   ├── ui/                 # Composants UI partagés
│   ├── supabase/          # Utilitaires base de données
│   ├── analytics/         # Fonctionnalités analytics
│   ├── email/             # Templates d'emails
│   ├── jobs/              # Tâches en arrière-plan
│   ├── kv/                # Stockage clé-valeur
│   └── logger/            # Système de logs
├── tooling/               # Configuration partagée
│   └── typescript/        # Config TypeScript
├── biome.json             # Configuration Biome (linting/formatting)
├── turbo.json             # Configuration Turborepo
└── package.json           # Dépendances du workspace
```

## 🔧 Prérequis

### Outils Requis
- **Node.js** ≥ 18.17.0
- **Bun** ≥ 1.1.26 (package manager)
- **Docker** (pour la base de données locale)
- **Git**

### Services Externes
- **Supabase** (base de données, auth, stockage)
- **Stripe** (paiements et abonnements)
- **Resend** (envoi d'emails)
- **Upstash** (cache Redis)
- **Sentry** (monitoring d'erreurs)
- **OpenPanel** (analytics)
- **Trigger.dev** (jobs en arrière-plan)

## 🚀 Installation & Configuration

### 1. Clonage du Dépôt

```bash
git clone <repository-url> tada
cd tada
```

### 2. Installation des Dépendances

```bash
bun install
```

### 3. Configuration des Variables d'Environnement

Copiez les fichiers d'exemple et configurez-les :

```bash
# Pour chaque application
cp apps/app/.env.example apps/app/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
cp apps/contributors/.env.example apps/contributors/.env
```

#### Variables d'Environnement Critiques

**Base de Données (Supabase)**
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_KEY="..."
```

**Authentification (better-auth)**
```env
BETTER_AUTH_SECRET="your-secret-key"
APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
APPLE_CLIENT_ID="..."
APPLE_CLIENT_SECRET="..."
```

**Services Externes**
```env
STRIPE_SECRET_KEY="sk_test_..."
RESEND_API_KEY="re_..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
SENTRY_DSN="https://..."
OPENPANEL_CLIENT_ID="..."
```

### 4. Configuration de la Base de Données

```bash
# Générer le client Prisma
bun run build:db

# Exécuter les migrations
cd apps/app
bunx prisma migrate deploy

# Optionnel : seed de données de test
bunx prisma db seed
```

### 5. Démarrage du Développement

```bash
# Démarrer toutes les applications
bun dev

# Ou démarrer des applications spécifiques
bun dev:app           # Application principale (localhost:3000)
bun dev:admin         # Panel admin (localhost:3002)  
bun dev:web           # Landing page entreprise (localhost:3001)
bun dev:contributors  # Landing page contributeurs (localhost:3003)
```

## 🎯 Applications

### 🌐 Web App (`@tada/web` - Port 3001)
**Landing page entreprise et site marketing**

- **Rôle** : Site vitrine pour les entreprises clientes
- **Fonctionnalités** :
  - Pages marketing multilingues (FR/EN)
  - Présentation des solutions pour entreprises
  - Formulaires de contact et démonstration
  - Pricing et plans d'abonnement
  - SEO optimisé avec Next.js 14
- **Stack** : Next.js 14, next-international, Tailwind CSS
- **Cible** : Entreprises cherchant des solutions de recherche de marché

### 👥 Contributors App (`@tada/contributors` - Port 3003)
**Landing page pour les contributeurs**

- **Rôle** : Site vitrine pour attirer les contributeurs/répondants
- **Fonctionnalités** :
  - Présentation des opportunités de participation
  - Processus d'inscription contributeur
  - Avantages et récompenses
  - Témoignages et success stories
  - Formulaires de candidature
- **Stack** : Next.js 14, next-international, Tailwind CSS
- **Cible** : Particuliers souhaitant participer aux sondages

### 🏠 Main App (`@tada/app` - Port 3000)
**Application principale - plateforme de sondages**

- **Rôle** : Cœur de la plateforme, gestion complète des sondages
- **Fonctionnalités** :
  - **Dashboard interactif** avec widgets personnalisables  
  - **Créateur de sondages** avec éditeur drag & drop
  - **Tableaux de bord analytiques** (Chart.js, Recharts, Vega)
  - **Gestion des réponses** en temps réel
  - **Export de données** (CSV, PowerPoint)
  - **Collaboration temps réel** avec Velt
  - **IA intégrée** pour l'analyse qualitative
- **Stack** : Next.js 14, Prisma, better-auth, HeroUI, Chart.js
- **Cible** : Utilisateurs connectés (entreprises et contributeurs)

### ⚙️ Admin Panel (`@tada/admin` - Port 3002)
**Interface d'administration système**

- **Rôle** : Gestion des organisations, utilisateurs et configuration système
- **Fonctionnalités** :
  - **Gestion des organisations** et permissions
  - **Contrôle qualité automatisé** avec IA (OpenAI)
  - **Analyse des missions** et validation
  - **Gestion des utilisateurs** et rôles
  - **Templates de sondages** pré-configurés
  - **Monitoring système** et métriques
- **Stack** : Next.js 14, Prisma, Assistant UI, OpenAI SDK
- **Cible** : Administrateurs système et équipes internes

### 🔧 API (`@tada/api`)
**Backend Supabase et Edge Functions**

- **Rôle** : Services backend, authentification, stockage
- **Fonctionnalités** :
  - **Edge Functions** Supabase
  - **Webhooks** et intégrations
  - **Traitement de données** en arrière-plan
  - **API endpoints** personnalisées
- **Stack** : Supabase, PostgreSQL, Edge Runtime

## 📦 Packages Partagés

### 🎨 UI Package (`@tada/ui`)
**Système de design unifié**

```typescript
// Import des composants
import { Button, Card, Input } from "@tada/ui/components"
import { cn } from "@tada/ui/lib/utils"
```

- **Composants** : shadcn/ui + composants métier personnalisés
- **Thèmes** : Configuration Tailwind partagée
- **Utilitaires** : Helpers CSS et fonctions communes
- **Icons** : Icônes Lucide et personnalisées

### 🗄️ Supabase Package (`@tada/supabase`)
**Abstraction base de données**

```typescript
// Clients pré-configurés
import { createClient } from "@tada/supabase/client"
import { createServerClient } from "@tada/supabase/server"

// Queries et mutations
import { getUser } from "@tada/supabase/queries"
import { updateMission } from "@tada/supabase/mutations"
```

- **Clients** : Server/Client Supabase pré-configurés
- **Queries** : Requêtes réutilisables avec cache
- **Mutations** : Opérations d'écriture typées
- **Types** : Types générés automatiquement
- **Storage** : Utilitaires de gestion fichiers

### 📊 Analytics Package (`@tada/analytics`)
**Suivi et métriques**

```typescript
import { track, identify } from "@tada/analytics"

// Suivi d'événements
track("survey_completed", { missionId, userId })
```

- **OpenPanel** : Intégration analytics
- **Events** : Système d'événements typés
- **Funnels** : Suivi des conversions
- **Dashboards** : Métriques temps réel

### 📧 Email Package (`@tada/email`)
**Templates d'emails React**

```typescript
import { WelcomeEmail } from "@tada/email/templates"

// Rendu d'email
const html = render(<WelcomeEmail name="John" />)
```

- **Templates** : Emails responsive avec React Email
- **Layouts** : Mise en page commune
- **Components** : Composants d'email réutilisables
- **Styling** : CSS inline optimisé

### ⚡ Jobs Package (`@tada/jobs`)
**Tâches en arrière-plan**

```typescript
import { sendSurveyReminder } from "@tada/jobs"

// Déclenchement de job
await sendSurveyReminder.trigger({ surveyId })
```

- **Trigger.dev** : Orchestration des tâches
- **Schedules** : Jobs programmés (cron)
- **Webhooks** : Intégrations externes
- **Retry** : Gestion d'échecs automatique

### 🔄 KV Package (`@tada/kv`)
**Cache et stockage clé-valeur**

```typescript
import { kv } from "@tada/kv"

// Cache avec expiration
await kv.set("user:123", userData, { ex: 3600 })
const user = await kv.get("user:123")
```

- **Upstash Redis** : Cache distribué
- **Rate limiting** : Limitation de débit
- **Sessions** : Stockage session temporaire
- **Queues** : Files d'attente simples

### 📝 Logger Package (`@tada/logger`)
**Système de logs centralisé**

```typescript
import { logger } from "@tada/logger"

logger.info("User logged in", { userId, timestamp })
logger.error("Payment failed", { error, orderId })
```

- **Structured logging** : Logs JSON structurés
- **Niveaux** : debug, info, warn, error
- **Context** : Métadonnées automatiques
- **Intégration** : Compatible avec Sentry

## ⚡ Commandes de Développement

### Commandes Globales (depuis la racine)

```bash
# 🚀 Développement
bun dev                    # Démarre toutes les apps
bun dev:web               # Landing page entreprise uniquement
bun dev:app               # App principale uniquement  
bun dev:admin             # Panel admin uniquement
bun dev:contributors      # Landing page contributeurs uniquement

# 🏗️ Build & Production
bun build                 # Build toutes les apps
bun start:web             # Prod: landing page entreprise
bun start:app             # Prod: app principale
bun start:admin           # Prod: panel admin
bun start:contributors    # Prod: landing page contributeurs

# 🧹 Maintenance
bun clean                 # Nettoie tout (node_modules inclus)
bun clean:workspaces      # Nettoie uniquement les builds

# ✅ Qualité de Code
bun lint                  # Lint avec Biome
bun format                # Formate le code
bun typecheck             # Vérification TypeScript
bun test --parallel       # Tests en parallèle

# 📊 Repository
bun lint:repo             # Vérifie la structure monorepo
bun lint:repo:fix         # Corrige automatiquement
```

### Commandes par Application

```bash
# Depuis le dossier d'une app (ex: apps/app/)
bun dev                   # Dev server local
bun build                 # Build production
bun lint                  # Lint l'app
bun format                # Format l'app
bun typecheck             # Types l'app
bun clean                 # Nettoie l'app
```

## 🗄️ Base de Données

### Schema Prisma Principal

**Entités Clés :**
- **User** : Utilisateurs avec rôles et permissions
- **Organization** : Organisations multi-tenant
- **Mission** : Projets de sondage (core business)
- **Survey/SurveyResponse** : Sondages et réponses
- **Subscription/Payment** : Abonnements Stripe
- **MissionPermission** : Permissions granulaires

### Gestion des Migrations

```bash
# Génération du client Prisma
cd apps/app
bunx prisma generate

# Nouvelle migration
bunx prisma migrate dev --name add-new-feature

# Déploiement en production
bunx prisma migrate deploy

# Reset de la DB (dev uniquement)
bunx prisma migrate reset

# Interface d'administration
bunx prisma studio
```

### Seed des Données

```bash
# Exécuter le seed
cd apps/app
bunx prisma db seed

# Le seed inclut :
# - Utilisateurs de test
# - Organisations exemple
# - Missions de démonstration
# - Rôles et permissions
```

## 🔐 Authentification

### Système better-auth

**Stratégies supportées :**
- **Email/Password** avec vérification OTP
- **OAuth Google** (Web & Mobile)
- **OAuth Apple** (Web & Mobile)
- **Invitations** d'organisation

### Rôles et Permissions

```typescript
// Hiérarchie des rôles
const roles = {
  superAdmin: "Accès système complet",
  organizationAdmin: "Gestion organisation",
  userOrganization: "Membre standard",
  contributor: "Accès missions limitées",
  operationsAdmin: "Opérations internes",
  financialAdmin: "Gestion financière",
  contentModerator: "Modération contenu"
}

// Permissions granulaires par mission
const missionPermissions = [
  "create", "read", "update", "delete", 
  "validate", "export", "manage_contributors"
]
```

### Middleware de Protection

```typescript
// Protection automatique des routes
// app/[locale]/(dashboard)/* = authentification requise
// app/[locale]/(public)/* = accès libre
// app/[locale]/(setup)/* = setup organisation
```

## 🔄 Workflow de Développement

### 1. Création d'une Nouvelle Fonctionnalité

```bash
# 1. Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développement avec hot reload
bun dev:app

# 3. Tests et qualité
bun lint
bun typecheck
bun test

# 4. Commit et push
git add .
git commit -m "feat: ajout nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

### 2. Patterns de Développement

**Server Actions (Recommandé)**
```typescript
// actions/missions/create-mission-action.ts
"use server"

import { authActionClient } from "@/lib/safe-action"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
})

export const createMissionAction = authActionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    
    // Logique métier
    const mission = await prisma.mission.create({
      data: {
        ...parsedInput,
        userId: user.id
      }
    })
    
    return { mission }
  })
```

**Composants Server vs Client**
```typescript
// ✅ Server Component (par défaut)
export default async function MissionsPage() {
  const missions = await getMissions()
  return <MissionsList missions={missions} />
}

// ✅ Client Component (quand nécessaire)
"use client"
export function InteractiveChart({ data }: Props) {
  const [filter, setFilter] = useState("")
  return <Chart data={filteredData} />
}
```

### 3. Architecture des Composants

```
src/components/
├── ui/                 # Composants UI de base (Button, Input...)
├── missions/           # Composants métier missions
│   ├── forms/         # Formulaires
│   ├── tables/        # Tableaux
│   └── charts/        # Graphiques
├── auth/              # Authentification
├── dashboard/         # Dashboard
└── layout/            # Layout (Header, Sidebar...)
```

### 4. Conventions de Nommage

- **Fichiers** : kebab-case (`create-mission-form.tsx`)
- **Composants** : PascalCase (`CreateMissionForm`)
- **Variables** : camelCase (`missionData`)
- **Constantes** : SCREAMING_SNAKE_CASE (`MAX_MISSIONS_PER_ORG`)
- **Types** : PascalCase avec suffixe (`UserType`, `MissionData`)

## ✅ Tests & Qualité

### Outils de Qualité

**Biome** (remplace ESLint + Prettier)
```bash
# Configuration dans biome.json
bun lint      # Vérifications
bun format    # Formatage automatique
```

**TypeScript Strict Mode**
```json
// Tous les apps utilisent le mode strict
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

### Validation avec Zod

```typescript
// Schémas réutilisables
export const MissionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(["survey", "interview", "focus_group"]),
  organizationId: z.string().uuid()
})

// Utilisation dans Server Actions
export const createMissionAction = authActionClient
  .schema(MissionSchema)
  .action(async ({ parsedInput }) => {
    // parsedInput est typé automatiquement
  })
```

### Tests (À implémenter)

```bash
# Structure recommandée
__tests__/
├── components/        # Tests de composants
├── actions/          # Tests Server Actions  
├── utils/            # Tests utilitaires
└── integration/      # Tests d'intégration
```

## 🚀 Déploiement

### Environments

- **Development** : `localhost:3000-3003`
- **Staging** : `staging.tada.app`
- **Production** : `app.tada.com`

### Build Production

```bash
# Build complet
bun build

# Build spécifique
bun run build --filter=@tada/app

# Variables d'environnement requises en prod
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
STRIPE_SECRET_KEY=...
RESEND_API_KEY=...
```

### Docker (Optionnel)

```dockerfile
# Dockerfile exemple pour app
FROM node:18-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
```

## 🔧 Dépannage

### Problèmes Courants

**1. Erreur de Build Prisma**
```bash
# Solution
cd apps/app
bunx prisma generate
bun run build
```

**2. Variables d'Environnement Manquantes**
```bash
# Vérifier tous les .env nécessaires
ls apps/*/.env
# Copier depuis les exemples si manquants
```

**3. Conflits de Ports**
```bash
# Vérifier les ports occupés
lsof -i :3000-3003
# Tuer les processus si nécessaire
kill -9 <PID>
```

**4. Erreurs TypeScript Workspace**
```bash
# Rebuilder les types partagés
bun run build --filter=@tada/ui
bun run typecheck
```

**5. Cache Turbo Corrompu**
```bash
# Nettoyer le cache Turbo
bun run clean
bun install
```

### Logs et Debugging

```typescript
// Utiliser le logger partagé
import { logger } from "@tada/logger"

logger.debug("Debug info", { context })
logger.info("Important event", { data })
logger.error("Error occurred", { error, stack })
```

### Performance

```bash
# Analyser le bundle
cd apps/app
bunx @next/bundle-analyzer

# Monitorer les Web Vitals
# Intégré dans chaque app Next.js
```

## 📚 Ressources Utiles

### Documentation
- [Next.js 14](https://nextjs.org/docs)
- [Prisma](https://prisma.io/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [better-auth](https://better-auth.com)
- [Turborepo](https://turbo.build/repo/docs)

### Outils de Développement
- **VS Code Extensions** : Prisma, Tailwind IntelliSense, TypeScript
- **Browser Extensions** : React DevTools, Redux DevTools
- **Desktop Apps** : Prisma Studio, TablePlus (DB)

---

## 🤝 Contribution

Pour contribuer au projet :

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Standards de Code
- Respecter les règles Biome
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les API publiques
- Suivre les conventions de nommage
- Utiliser TypeScript strict

---

**🎉 Félicitations ! Vous êtes maintenant prêt à développer sur Tada !**

Pour toute question, consultez la documentation interne ou contactez l'équipe de développement.