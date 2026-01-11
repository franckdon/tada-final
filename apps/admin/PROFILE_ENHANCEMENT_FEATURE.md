# Fonctionnalité : Enrichissement de Profil des Contributeurs

## 📋 Vue d'ensemble

Cette fonctionnalité permet de créer un type de mission spécial appelé **"profile_enhancement"** qui collecte des informations supplémentaires sur les contributeurs. Ces données sont ensuite utilisées comme filtres d'audience pour les clients entreprises.

## 🎯 Objectifs

1. **Collecter des informations supplémentaires** sur les contributeurs via des missions dédiées
2. **Enrichir les profils contributeurs** de manière dynamique
3. **Permettre aux clients de filtrer** l'audience selon ces nouveaux attributs
4. **Améliorer le ciblage** des missions futures

## 🏗️ Architecture Technique

### Modèles Prisma Existants

#### Mission
```prisma
model Mission {
  id                  String         @id @default(uuid())
  name                String
  type                String?        // ⭐ Nouveau type: "profile_enhancement"
  audiences           Json?          // Filtres d'audience
  contributorData     ContributorData[] // Données collectées
  // ...
}
```

#### ContributorData (Existant)
```prisma
model ContributorData {
  id               String   @id @default(uuid())
  key              String   // Question formatée (ex: "skills", "equipment")
  value            String   // Réponse du contributeur
  missionId        String
  userId           String
  questionType     String?  // Type de question
  originalQuestion String?  // Question originale
  // ...
}
```

### Types de Données à Collecter

#### 1. Compétences Professionnelles
- **Key**: `professional_skills`
- **Type**: Multiple choice / Tags
- **Exemples**: Marketing, IT, Finance, Healthcare, Education

#### 2. Centres d'Intérêt
- **Key**: `interests`
- **Type**: Multiple choice
- **Exemples**: Sport, Technologie, Cuisine, Voyage, Mode

#### 3. Équipements
- **Key**: `equipment`
- **Type**: Multiple choice
- **Exemples**: 
  - Microphone professionnel
  - Webcam HD
  - Smartphone récent
  - Connexion internet stable

#### 4. Langues
- **Key**: `languages`
- **Type**: Multiple choice avec niveau
- **Exemples**: Français (natif), Anglais (courant), Espagnol (intermédiaire)

#### 5. Disponibilités
- **Key**: `availability`
- **Type**: Time slots
- **Exemples**: Matin, Après-midi, Soir, Week-end

#### 6. Expérience en Recherche
- **Key**: `research_experience`
- **Type**: Single choice
- **Options**: 
  - Débutant (0-2 missions)
  - Intermédiaire (3-10 missions)
  - Expérimenté (10+ missions)

## 🚀 Implémentation

### Étape 1: Créer le Type de Mission

```typescript
// constants/mission-types.ts
export const MISSION_TYPES = {
  SURVEY: "survey",
  INTERVIEW: "interview",
  FOCUS_GROUP: "focus_group",
  PROFILE_ENHANCEMENT: "profile_enhancement", // ⭐ Nouveau
} as const;

export const MISSION_TYPE_LABELS = {
  survey: "Sondage",
  interview: "Interview",
  focus_group: "Groupe de discussion",
  profile_enhancement: "Enrichissement de profil", // ⭐ Nouveau
};
```

### Étape 2: Template de Questions Standards

```typescript
// constants/profile-enhancement-questions.ts
export const PROFILE_ENHANCEMENT_QUESTIONS = [
  {
    id: "professional_skills",
    title: "Quelles sont vos compétences professionnelles ?",
    type: "multiple_choice",
    options: [
      "Marketing & Communication",
      "Informatique & Technologies",
      "Finance & Comptabilité",
      "Santé & Médical",
      "Éducation & Formation",
      "Vente & Commerce",
      "Ressources Humaines",
      "Logistique & Transport",
      "Droit & Juridique",
      "Arts & Création",
    ],
    required: false,
  },
  {
    id: "interests",
    title: "Quels sont vos centres d'intérêt ?",
    type: "multiple_choice",
    options: [
      "Sport & Fitness",
      "Technologie & Gadgets",
      "Cuisine & Gastronomie",
      "Voyage & Découverte",
      "Mode & Beauté",
      "Culture & Arts",
      "Écologie & Environnement",
      "Finance & Investissement",
      "Gaming & E-sport",
      "Musique & Concerts",
    ],
    required: false,
  },
  {
    id: "equipment",
    title: "De quel équipement disposez-vous ?",
    type: "multiple_choice",
    options: [
      "Microphone professionnel",
      "Webcam HD",
      "Smartphone récent (moins de 2 ans)",
      "Ordinateur performant",
      "Connexion internet stable (>10 Mbps)",
      "Espace calme pour enregistrement",
      "Éclairage adapté",
    ],
    required: false,
  },
  {
    id: "languages",
    title: "Quelles langues parlez-vous ?",
    type: "multiple_choice",
    options: [
      "Français (natif)",
      "Français (courant)",
      "Anglais (natif)",
      "Anglais (courant)",
      "Anglais (intermédiaire)",
      "Espagnol",
      "Allemand",
      "Italien",
      "Arabe",
      "Mandarin",
    ],
    required: true,
  },
  {
    id: "availability",
    title: "Quelles sont vos disponibilités habituelles ?",
    type: "multiple_choice",
    options: [
      "Lundi-Vendredi Matin (8h-12h)",
      "Lundi-Vendredi Après-midi (12h-18h)",
      "Lundi-Vendredi Soir (18h-22h)",
      "Weekend Matin",
      "Weekend Après-midi",
      "Weekend Soir",
      "Flexible",
    ],
    required: false,
  },
  {
    id: "research_experience",
    title: "Quelle est votre expérience en recherche de marché ?",
    type: "single_choice",
    options: [
      "Débutant (première fois)",
      "Intermédiaire (2-5 missions)",
      "Expérimenté (6-15 missions)",
      "Expert (16+ missions)",
    ],
    required: true,
  },
];
```

### Étape 3: Système de Filtres d'Audience

```typescript
// types/audience-filters.ts
export interface AudienceFilter {
  field: string; // "age", "gender", "location", "professional_skills", etc.
  operator: "equals" | "in" | "not_in" | "contains" | "range";
  value: string | string[] | number | { min: number; max: number };
  label: string; // Pour l'affichage
}

export const AUDIENCE_FILTER_FIELDS = {
  // Filtres standards
  AGE: "age",
  GENDER: "gender",
  LOCATION: "location",
  
  // Filtres enrichis (depuis ContributorData)
  PROFESSIONAL_SKILLS: "professional_skills",
  INTERESTS: "interests",
  EQUIPMENT: "equipment",
  LANGUAGES: "languages",
  AVAILABILITY: "availability",
  RESEARCH_EXPERIENCE: "research_experience",
} as const;
```

### Étape 4: Composant de Création de Mission Profile Enhancement

Le composant permettra de :
1. Sélectionner les questions standards à inclure
2. Ajouter des questions personnalisées
3. Définir les récompenses
4. Cibler une audience spécifique

### Étape 5: Composant de Filtrage d'Audience Amélioré

Le composant `audiences-filter-modal.tsx` sera étendu pour :
1. Afficher les filtres standards (âge, genre, localisation)
2. Afficher les nouveaux filtres enrichis
3. Permettre des combinaisons de filtres (AND/OR)
4. Prévisualiser le nombre de contributeurs ciblés

## 📊 Flux de Données

```
1. Admin crée mission "profile_enhancement"
   ↓
2. Contributeurs répondent aux questions
   ↓
3. Réponses stockées dans ContributorData (key-value)
   ↓
4. Admin crée nouvelle mission standard
   ↓
5. Admin applique filtres d'audience enrichis
   ↓
6. Système calcule les contributeurs éligibles
   ↓
7. Mission assignée aux contributeurs filtrés
```

## 🎨 Interface Utilisateur

### Page: Créer Mission Profile Enhancement
- **Route**: `/missions/new?type=profile_enhancement`
- **Composants**:
  - Formulaire de base (titre, description)
  - Sélecteur de questions standards
  - Éditeur de questions personnalisées
  - Configuration des récompenses

### Modal: Filtres d'Audience Améliorés
- **Composant**: `AudienceFilterModal`
- **Features**:
  - Liste déroulante des attributs disponibles
  - Opérateurs conditionnels
  - Aperçu du nombre de contributeurs
  - Sauvegarde des filtres favoris

## 🔄 Requêtes SQL Optimisées

```sql
-- Récupérer les contributeurs avec compétences IT
SELECT DISTINCT u.* 
FROM "user" u
JOIN contributor_data cd ON u.id = cd.user_id
WHERE cd.key = 'professional_skills' 
  AND cd.value LIKE '%Informatique%';

-- Contributeurs avec équipement et disponibilité
SELECT DISTINCT u.* 
FROM "user" u
WHERE EXISTS (
  SELECT 1 FROM contributor_data cd1
  WHERE cd1.user_id = u.id 
    AND cd1.key = 'equipment'
    AND cd1.value LIKE '%Microphone%'
)
AND EXISTS (
  SELECT 1 FROM contributor_data cd2
  WHERE cd2.user_id = u.id 
    AND cd2.key = 'availability'
    AND cd2.value LIKE '%Matin%'
);
```

## ✅ Checklist d'Implémentation

- [x] Documentation de la fonctionnalité
- [ ] Constantes et types TypeScript
- [ ] Template de questions standards
- [ ] Composant de création de mission profile enhancement
- [ ] Extension du modal de filtres d'audience
- [ ] Actions serveur pour la création et filtrage
- [ ] Tests des requêtes de filtrage
- [ ] Documentation utilisateur

## 🚧 Prochaines Étapes

1. Implémenter les constantes et types
2. Créer le composant de mission profile enhancement
3. Étendre le système de filtrage d'audience
4. Tester avec des données réelles
5. Documenter pour les utilisateurs finaux
