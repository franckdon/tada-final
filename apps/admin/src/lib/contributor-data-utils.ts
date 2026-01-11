/**
 * Utilitaires pour la gestion des données contributeur
 */

/**
 * Formate une question en clé de recherche utilisable
 * @param question La question originale
 * @returns Clé formatée pour la recherche
 */
export function formatQuestionAsKey(question: string): string {
  return question
    .toLowerCase()
    // Supprimer les accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remplacer les espaces et caractères spéciaux par des underscores
    .replace(/[^a-z0-9]/g, '_')
    // Supprimer les underscores multiples
    .replace(/_+/g, '_')
    // Supprimer les underscores en début/fin
    .replace(/^_|_$/g, '')
    // Limiter la longueur à 100 caractères
    .slice(0, 100);
}

/**
 * Extrait et formate les réponses d'un survey response pour les stocker
 * Utilise l'approche de normalisation : une ligne par valeur pour les réponses multiples
 * @param responses Objet des réponses au format {"question": {"type": "...", "answer": "..."}}
 * @returns Array d'objets {key, value, questionType, originalQuestion}
 */
export function extractContributorData(
  responses: Record<string, { type: string; answer: any }>
): Array<{
  key: string;
  value: string;
  questionType: string;
  originalQuestion: string;
}> {
  const contributorDataItems: Array<{
    key: string;
    value: string;
    questionType: string;
    originalQuestion: string;
  }> = [];

  // Traiter chaque question/réponse
  Object.entries(responses).forEach(([questionText, questionData]) => {
    if (!questionData || typeof questionData !== 'object') return;

    const { type, answer } = questionData;

    // Ignorer les réponses vides
    if (answer === null || answer === undefined || answer === '' || 
        (Array.isArray(answer) && answer.length === 0)) return;

    // Formater la clé
    const formattedKey = formatQuestionAsKey(questionText);

    // Traitement spécial pour les réponses multiples (checkbox)
    if (type === 'checkbox' && Array.isArray(answer)) {
      // Créer une ligne par valeur sélectionnée
      answer.forEach((singleValue) => {
        if (singleValue !== null && singleValue !== undefined && singleValue !== '') {
          contributorDataItems.push({
            key: formattedKey,
            value: String(singleValue),
            questionType: type,
            originalQuestion: questionText,
          });
        }
      });
    } else {
      // Pour tous les autres types, une seule ligne
      let valueString: string;
      
      switch (type) {
        case 'boolean':
          valueString = answer ? 'Oui' : 'Non';
          break;
        case 'rating':
          valueString = `${answer}/5`;
          break;
        case 'radiogroup':
        case 'text':
        case 'comment':
        default:
          valueString = String(answer);
          break;
      }

      contributorDataItems.push({
        key: formattedKey,
        value: valueString,
        questionType: type,
        originalQuestion: questionText,
      });
    }
  });

  return contributorDataItems;
}