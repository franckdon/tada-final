# 🛡️ Setup Guide - Système de Contrôle Qualité Automatique

## 📋 Étapes de déploiement

### 1. **Migration de la base de données**

```bash
cd apps/admin
npx prisma migrate dev --name "add_quality_control_system"
npx prisma generate
```

### 2. **Activer l'include qualityControl**

Dans `/apps/admin/src/app/[locale]/(dashboard)/contributors/[id]/[missionId]/page.tsx`, décommenter les lignes 45-57 :

```typescript
qualityControl: {
  include: {
    qualityIssues: {
      select: {
        id: true,
        type: true,
        level: true,
        title: true,
        description: true,
      },
    },
  },
},
```

### 3. **Configuration des variables d'environnement**

Assurez-vous d'avoir les clés OpenAI dans votre `.env` :

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. **Test du système**

1. Allez sur une page de contributeur avec des soumissions
2. Vous devriez voir des badges "Non analysé" sur les `SurveyResponseCard`
3. Cliquez sur "Analyser" pour lancer l'analyse automatique
4. Le système analysera la qualité et affichera le score

## 🎯 Fonctionnalités disponibles

### **Dans SurveyResponseCard :**
- ✅ Badge de qualité avec score coloré
- ✅ Bouton d'analyse automatique
- ✅ Section détaillée avec problèmes détectés
- ✅ Détection d'images génériques/icônes

### **Actions disponibles :**
- `autoQualityLLMAction` - Analyse complète avec LLM
- `batchQualityAnalysisAction` - Analyse en lot
- `addFeedbackAction` - Système de feedback

### **Critères d'analyse automatique :**
1. **Cohérence des réponses** (0-100)
2. **Complétude des données** (0-100)  
3. **Authenticité** (0-100)
4. **Validité géographique** (0-100)
5. **Intégrité temporelle** (0-100)

### **Détection automatique :**
- 🚨 Images identiques/génériques (comme vos 7 PNGs d'icônes)
- 🚨 Réponses toutes identiques
- 🚨 Soumissions trop rapides (< 10 secondes)
- 🚨 Coordonnées GPS par défaut (0,0)
- 🚨 Patterns suspects d'automatisation

## 🔧 Utilisation

### **Analyse individuelle :**
```typescript
import { autoQualityLLMAction } from "@/actions/quality-control/auto-quality-llm-action";

// Dans un composant
const { execute } = useAction(autoQualityLLMAction);
await execute({ surveyResponseId: "uuid" });
```

### **Analyse en lot :**
```typescript
import { batchQualityAnalysisAction } from "@/actions/quality-control/batch-quality-analysis-action";

// Analyser toutes les réponses d'une mission
await batchQualityAnalysisAction({ 
  missionId: "uuid", 
  limit: 50 
});
```

### **Ajout de feedback :**
```typescript
import { addFeedbackAction } from "@/actions/quality-control/add-feedback-action";

// Corriger une décision
await addFeedbackAction({
  qualityControlId: "uuid",
  feedbackType: "correction",
  correctedDecision: "accept",
  explanation: "Actually this submission is valid"
});
```

## 📊 Scores et décisions

- **90-100** : ✅ Accepté automatiquement
- **50-89** : ⚠️ Nécessite révision humaine  
- **0-49** : ❌ Rejeté automatiquement

## 🎨 Interface utilisateur

Le système est intégré directement dans vos `SurveyResponseCard` existantes sans créer de nouvelles pages. L'utilisateur voit :

1. **Badge de statut** : "Non analysé" → "Qualité: 85/100" 
2. **Bouton d'action** : "Analyser" avec icône ⚡
3. **Détails complets** : Scores détaillés, problèmes détectés, recommandations

Parfait pour votre cas d'usage avec les images PNG d'icônes qui seront automatiquement détectées comme problématiques ! 🎯