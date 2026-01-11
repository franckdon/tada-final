# Guide d'implémentation - Gestion des attributs d'audience

## 📋 Vue d'ensemble

Ce guide documente l'implémentation du système de gestion des attributs d'audience et d'enrichissement de profil pour l'application Tada Admin.

## ✅ Fonctionnalités implémentées

### 1. Police DM Sans ✓
- **Statut** : Déjà configurée
- **Fichier** : `src/app/[locale]/layout.tsx`
- La police DM Sans est correctement configurée avec les poids 400, 500, 600, 700

### 2. Gestion des attributs d'audience
- **Page d'administration** : `/settings/audience-attributes`
- **Composants créés** :
  - `AttributeManager` : Modal pour créer/modifier des attributs
  - `AttributeList` : Liste des attributs avec actions CRUD
  - `ProfileEnrichmentConfig` : Configuration des attributs pour missions d'enrichissement

### 3. Système d'enrichissement de profil
- Permet de créer des missions spéciales qui collectent des données pour enrichir les profils
- Les données collectées deviennent automatiquement des filtres d'audience
- Configuration par catégories : Professionnel, Intérêts, Technique, Disponibilité, etc.

## 🗄️ Schéma Prisma requis

Ajoutez ces modèles à votre fichier `schema.prisma` :

```prisma
// Modèle pour les attributs d'audience personnalisés
model AudienceAttribute {
  id               String   @id @default(cuid())
  name             String   // Nom affiché (ex: "Compétences professionnelles")
  key              String   @unique // Clé technique (ex: "professional_skills")
  type             String   // Type: text, number, select, multiselect, date, boolean, range
  category         String   // Catégorie: demographics, profile, professional, interests, technical, availability
  description      String?  // Description de l'attribut
  required         Boolean  @default(false) // Champ obligatoire
  enrichmentOnly   Boolean  @default(false) // Collecté uniquement via missions d'enrichissement
  options          String?  // Options pour select/multiselect (JSON)
  active           Boolean  @default(true) // Attribut actif
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  values           ContributorAttributeValue[]

  @@index([category])
  @@index([active])
}

// Modèle pour les valeurs des attributs par contributeur
model ContributorAttributeValue {
  id          String   @id @default(cuid())
  attributeId String
  userId      String
  value       String   // Valeur stockée (peut être JSON pour multiselect)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  attribute   AudienceAttribute @relation(fields: [attributeId], references: [id], onDelete: Cascade)
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([attributeId, userId])
  @@index([userId])
  @@index([attributeId])
}
```

Ajoutez également ce champ au modèle `Mission` existant :

```prisma
model Mission {
  // ... champs existants ...
  
  // Nouveau champ pour les missions d'enrichissement
  enrichmentAttributes String[] @default([]) // IDs des attributs à collecter
  isEnrichmentMission  Boolean  @default(false) // Indique si c'est une mission d'enrichissement
}
```

Et ajoutez cette relation au modèle `User` :

```prisma
model User {
  // ... champs existants ...
  
  // Nouvelle relation
  attributeValues ContributorAttributeValue[]
}
```

## 🚀 Étapes de déploiement

### 1. Mettre à jour le schéma Prisma

```bash
# Ajouter les modèles ci-dessus à votre schema.prisma
# Puis générer la migration
npx prisma migrate dev --name add_audience_attributes
```

### 2. Installer les dépendances manquantes (si nécessaire)

Les composants utilisent des composants UI de shadcn/ui. Vérifiez que vous avez :
- `Card`
- `Badge`
- `Switch`
- `Tooltip`
- `ScrollArea`
- `DropdownMenu`
- `Table`

Si manquants, installez-les :

```bash
npx shadcn-ui@latest add card badge switch tooltip scroll-area dropdown-menu table
```

### 3. Ajouter la route dans la navigation

Ajoutez un lien vers `/settings/audience-attributes` dans votre menu de paramètres.

## 📁 Structure des fichiers créés

```
apps/admin/src/
├── app/[locale]/(dashboard)/settings/
│   └── audience-attributes/
│       └── page.tsx                          # Page principale de gestion
├── components/
│   ├── settings/
│   │   ├── attribute-manager.tsx             # Modal de création/édition
│   │   └── attribute-list.tsx                # Liste des attributs
│   └── missions/
│       └── profile-enrichment-config.tsx     # Config pour missions d'enrichissement
└── actions/
    └── attributes/
        └── manage-attributes-action.ts       # Actions serveur CRUD
```

## 🎯 Utilisation

### Pour les administrateurs

1. **Créer des attributs personnalisés** :
   - Aller sur `/settings/audience-attributes`
   - Cliquer sur "Nouvel attribut"
   - Remplir le formulaire (nom, type, catégorie, options, etc.)
   - Marquer comme "Enrichissement uniquement" si collecté via missions

2. **Créer une mission d'enrichissement** :
   - Lors de la création d'une mission
   - Utiliser le composant `ProfileEnrichmentConfig`
   - Sélectionner les attributs à collecter
   - Les contributeurs rempliront ces attributs pendant la mission

3. **Utiliser les attributs comme filtres** :
   - Les attributs enrichis apparaissent automatiquement dans les filtres d'audience
   - Utilisables lors de la création de missions pour cibler des contributeurs spécifiques

### Pour les développeurs

```tsx
// Exemple d'utilisation dans un formulaire de mission
import { ProfileEnrichmentConfig } from "@/components/missions/profile-enrichment-config";

function CreateMissionForm() {
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  return (
    <form>
      {/* Autres champs du formulaire */}
      
      <ProfileEnrichmentConfig
        selectedAttributes={selectedAttributes}
        onAttributesSelected={setSelectedAttributes}
      />
      
      {/* Soumettre avec selectedAttributes */}
    </form>
  );
}
```

## 🔄 Intégration avec le système existant

### Filtres d'audience existants

Le système s'intègre avec le contexte `AudiencesFilterContext` existant :
- Fichier : `src/context/audiences-filter-context.tsx`
- Les nouveaux attributs enrichis peuvent être ajoutés dynamiquement aux filtres
- Compatible avec la structure de filtres par groupes

### Types existants

Le système utilise les types définis dans :
- `src/types/audience-filters.ts`
- Les constantes `AUDIENCE_FILTER_FIELDS` peuvent être étendues dynamiquement

## 📊 Statistiques et métriques

La page d'administration affiche :
- Nombre d'attributs actifs
- Nombre de profils enrichis
- Taux de complétion des profils
- Utilisation des attributs dans les missions

## 🔐 Sécurité et validation

- Toutes les actions serveur utilisent `next-safe-action` pour la validation
- Les schémas Zod valident les entrées
- Les suppressions vérifient l'utilisation dans les missions
- Les relations Prisma utilisent `onDelete: Cascade` pour l'intégrité

## 🎨 Personnalisation

### Ajouter de nouvelles catégories

Modifiez les constantes dans les composants :

```tsx
const CATEGORY_LABELS = {
  demographics: "Démographiques",
  profile: "Profil",
  professional: "Professionnel",
  interests: "Intérêts",
  technical: "Technique",
  availability: "Disponibilité",
  // Ajoutez vos catégories ici
};
```

### Ajouter de nouveaux types de données

Étendez les types dans `AttributeManager` :

```tsx
<SelectItem value="custom_type">Type personnalisé</SelectItem>
```

## 🐛 Dépannage

### Erreurs Prisma

Si vous obtenez des erreurs sur les modèles Prisma :
1. Vérifiez que les modèles sont bien ajoutés au `schema.prisma`
2. Exécutez `npx prisma generate`
3. Redémarrez votre serveur de développement

### Erreurs de composants UI manquants

Si des composants shadcn/ui sont manquants :
```bash
npx shadcn-ui@latest add [component-name]
```

## 📝 Notes importantes

1. **Migration de données** : Si vous avez déjà des données d'audience, vous devrez peut-être créer une migration de données pour mapper les anciens filtres vers les nouveaux attributs.

2. **Performance** : Pour de grandes quantités de contributeurs, envisagez d'indexer les champs fréquemment filtrés.

3. **Traductions** : Les labels sont actuellement en français. Ajoutez les traductions i18n si nécessaire.

4. **Tests** : Testez particulièrement :
   - La création/modification/suppression d'attributs
   - La collecte de données via missions d'enrichissement
   - Le filtrage avec les nouveaux attributs

## 🔗 Ressources

- Documentation Prisma : https://www.prisma.io/docs
- shadcn/ui : https://ui.shadcn.com
- Next.js Server Actions : https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions

## ✨ Prochaines étapes suggérées

1. Implémenter l'API de collecte des données d'enrichissement
2. Créer des rapports sur l'enrichissement des profils
3. Ajouter des validations personnalisées par type d'attribut
4. Implémenter l'import/export d'attributs
5. Créer des templates d'attributs prédéfinis
6. Ajouter des règles de visibilité conditionnelle

---

**Auteur** : Cascade AI  
**Date** : 5 novembre 2025  
**Version** : 1.0
