export function assertMissionEditable(updatedAt: Date, createdAt: Date) {
  const lastModification = updatedAt || createdAt;
  if (!lastModification) return;

  const daysSinceLastModification = Math.floor(
    (Date.now() - new Date(lastModification).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastModification < 30) {
    return {
      success: true,
      message: `Modification impossible. Attendez encore ${
        30 - daysSinceLastModification
      } jours.`,
    };
  }
}
