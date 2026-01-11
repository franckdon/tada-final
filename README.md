# Tada Admin
 Voici comment démarrer rapidement.

## Avant de commencer

Tu auras besoin de **Bun** (>= 1.3.1) et **PostgreSQL** installés sur ta machine. 

## Installation

```bash
# Clone le projet et installe les dépendances
git clone <repo-url>
cd Tada
bun install

# Crée ta base de données locale
createdb tada_admin

# Configure ton environnement
cd apps/app
cp .env.example .env.local
```

Ouvre le fichier `.env.local` et modifie au minimum ces lignes avec tes credentials PostgreSQL :
```env
DATABASE_URL="postgresql://ton_user:ton_password@localhost:5432/tada_admin"
DATABASE_URL_DIRECT="postgresql://ton_user:ton_password@localhost:5432/tada_admin"
```

Les autres variables peuvent rester telles quelles pour le développement.

```bash
# Génère le client Prisma (important !)
bunx prisma generate

# Lance l'application
bun run dev
```

Voilà ! L'app tourne sur **http://localhost:3000/en/**

## Points importants

L'authentification est **désactivée par défaut** en développement grâce à `NEXT_PUBLIC_BYPASS_AUTH=1` dans le `.env.local`. Tu peux accéder à toutes les pages sans te connecter.

L'application supporte deux langues : anglais (`/en/`) et français (`/fr/`). Change la langue via le sélecteur en bas de la sidebar.

## Commandes utiles

```bash
bun run dev              # Lance le serveur de dev
bunx prisma studio       # Ouvre l'interface graphique de la DB
bunx prisma generate     # Régénère le client Prisma (après un pull)
```

## Si ça ne marche pas

Parfois après un `git pull`, tu peux avoir des erreurs. Voici comment nettoyer :
```bash
rm -rf node_modules .next
bun install
bunx prisma generate
bun run dev
```