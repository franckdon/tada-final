# 📝 Guide de Commits

Voici les commits à effectuer dans l'ordre pour une historique Git propre.

## 🎯 Commits Recommandés

### Commit 1 : Police DM Sans ✅

```bash
git add apps/admin/src/app/[locale]/layout.tsx apps/admin/tailwind.config.ts
git commit -m "feat(admin): remplacer Geist par DM Sans comme police principale

- Configuration de DM Sans avec next/font/google
- Ajout de la variable CSS --font-dm-sans
- Mise à jour de tailwind.config pour utiliser DM Sans par défaut
- Poids de police : 400, 500, 600, 700"
```

### Commit 2 : Mode Dev Sans Authentification ✅

```bash
git add apps/admin/src/middleware.ts
git commit -m "feat(admin): ajouter mode dev sans authentification

- Ajout de la constante DISABLE_AUTH pour désactiver l'auth en dev
- Permet de tester l'application sans se connecter
- Facilite le développement et les tests
- Pour réactiver l'auth: changer DISABLE_AUTH à false"
```

### Commit 3 : Constantes et Types ✅

```bash
git add apps/admin/src/constants/mission-types.ts \
        apps/admin/src/constants/profile-enhancement-questions.ts \
        apps/admin/src/constants/enriched-audience-filters.ts \
        apps/admin/src/types/audience-filters.ts

git commit -m "feat(admin): ajouter constantes et types pour l'enrichissement de profil

Mission Types:
- Ajout du type 'profile_enhancement' pour les missions d'enrichissement
- Labels et descriptions pour chaque type de mission
- Icônes associées aux types

Questions Standards (9 questions):
- Compétences professionnelles (15 options)
- Secteur d'activité (8 options)
- Centres d'intérêt (15 options)
- Équipement disponible (9 options)
- Langues parlées (19 options)
- Disponibilités (8 options)
- Expérience en recherche (5 niveaux)
- Fréquence de participation (5 options)
- Durée de mission préférée (5 options)

Filtres d'Audience:
- Système complet de filtrage avec opérateurs (equals, in, contains, etc.)
- Catégories de filtres (démographiques, professionnel, intérêts, technique, disponibilité)
- Helpers pour obtenir filtres et opérateurs disponibles
- Support logique AND/OR entre filtres

Filtres Enrichis UI:
- 5 groupes de filtres pour l'interface
- Conversion automatique des questions en filtres UI
- Helpers pour identifier et récupérer les filtres enrichis"
```

### Commit 4 : Server Actions ✅

```bash
git add apps/admin/src/actions/contributors/save-contributor-profile-data-action.ts \
        apps/admin/src/actions/contributors/filter-contributors-by-profile-action.ts

git commit -m "feat(admin): ajouter server actions pour les données de profil contributeur

Save Profile Data Action:
- Sauvegarde des données de profil enrichies dans ContributorData
- Utilise une transaction Prisma pour garantir l'atomicité
- Évite les doublons avec deleteMany + createMany
- Revalidation automatique des caches

Filter Contributors Action:
- Filtrage des contributeurs selon leurs attributs de profil
- Support logique AND (intersection) et OR (union)
- Optimisation avec distinct et index sur les clés
- Action helper pour filtrer par compétence spécifique

Validation:
- Schémas Zod pour la validation des données
- Gestion d'erreurs avec try/catch
- Authentification via authActionClient"
```

### Commit 5 : Composants et Pages ✅

```bash
git add apps/admin/src/components/missions/modals/create-mission-modal.tsx \
        apps/admin/src/app/[locale]/\(dashboard\)/missions/create/page.tsx

git commit -m "feat(admin): ajouter l'option Enrichissement de Profil dans la création de mission

Modal de Création:
- Nouvelle option 'Enrichissement de profil' avec design violet
- Icône SVG personnalisée (groupe d'utilisateurs)
- Features: collecte d'attributs enrichis + amélioration du ciblage
- Redirection vers /missions/create?mode=profile-enhancement

Page de Création:
- Support du mode 'profile-enhancement' pour afficher ConversationCard
- Préparation pour l'interface de création de mission enrichie

Design:
- Couleur: Violet (bg-purple-500)
- Hover: bg-purple-50, text-purple-600
- Cohérent avec le design system existant"
```

### Commit 6 : Documentation ✅

```bash
git add apps/admin/PROFILE_ENHANCEMENT_FEATURE.md \
        apps/admin/IMPLEMENTATION_SUMMARY.md \
        apps/admin/COMMIT_GUIDE.md

git commit -m "docs(admin): ajouter documentation complète pour l'enrichissement de profil

PROFILE_ENHANCEMENT_FEATURE.md:
- Documentation technique détaillée de la fonctionnalité
- Architecture et modèles Prisma
- Types de données à collecter (9 catégories)
- Exemples d'implémentation TypeScript
- Flux de données complet
- Requêtes SQL optimisées
- Checklist d'implémentation

IMPLEMENTATION_SUMMARY.md:
- Récapitulatif complet des fonctionnalités implémentées
- Liste de tous les fichiers créés/modifiés
- Guide d'utilisation pour les admins
- Workflow complet avec diagramme
- Notes techniques (performance, sécurité, scalabilité)
- Bugs connus et solutions
- Checklist de déploiement

COMMIT_GUIDE.md:
- Guide de commits pour un historique Git propre
- 6 commits organisés logiquement
- Messages détaillés avec descriptions
- Commandes git prêtes à copier-coller"
```

---

## 🎨 Convention de Commits

Les commits suivent la convention [Conventional Commits](https://www.conventionalcommits.org/) :

### Format
```
<type>(<scope>): <description courte>

[Corps optionnel avec détails]

[Footer optionnel]
```

### Types Utilisés
- `feat`: Nouvelle fonctionnalité
- `docs`: Documentation
- `fix`: Correction de bug
- `refactor`: Refactoring de code
- `style`: Changements de style (formatage, etc.)
- `test`: Ajout ou modification de tests
- `chore`: Tâches de maintenance

### Scopes
- `admin`: Panel d'administration
- `app`: Application principale
- `web`: Landing page
- `contributors`: Landing page contributeurs

---

## 🔍 Vérifier Avant de Committer

```bash
# Vérifier les fichiers modifiés
git status

# Voir les changements
git diff

# Vérifier que l'app compile
bun run typecheck

# Vérifier le linting
bun run lint
```

---

## 🚀 Pousser Vers le Dépôt

Après tous les commits :

```bash
# Vérifier l'historique
git log --oneline -6

# Pousser vers la branche
git push origin feature/enhance-contributor-profile-and-filters
```

---

## 📋 Checklist Post-Commits

- [ ] Tous les fichiers sont commités
- [ ] Les messages de commit sont clairs
- [ ] L'historique Git est propre et logique
- [ ] L'application compile sans erreurs
- [ ] Les tests passent (si existants)
- [ ] La documentation est à jour
- [ ] La branche est poussée vers le dépôt distant

---

## 💡 Conseils

1. **Un commit = Une fonctionnalité logique**
   - Ne pas mélanger plusieurs features dans un commit
   - Chaque commit doit être autonome

2. **Messages descriptifs**
   - Utiliser l'impératif ("ajouter" pas "ajouté")
   - Être spécifique sur ce qui est fait
   - Expliquer le "pourquoi" dans le corps du commit

3. **Taille des commits**
   - Ni trop gros (difficile à review)
   - Ni trop petits (historique confus)
   - Un bon équilibre : une feature complète

4. **Review avant commit**
   - Relire tous les changements
   - Vérifier qu'il n'y a pas de console.log oubliés
   - S'assurer que le code est propre

---

**Bonne chance avec vos commits ! 🎉**
