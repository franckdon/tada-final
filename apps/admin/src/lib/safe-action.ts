// src/lib/safe-action.ts
import { createSafeActionClient } from "next-safe-action";

// Création de l'instance du client safe action.
// C'est cette instance qui est LA fonction 'action' que vous utilisez partout.
export const action = createSafeActionClient({
    // Vous pouvez ajouter ici la configuration du côté serveur :
    // - handleReturnedValidationError: ({ error, input }) => ({ input, validationError: error.flatten() }),
    // - middleware: async ({ next }) => { /* ... */ return next({ ctx: {} }); },
});

// Si vous voulez exporter un alias pour la procédure publique (sans middleware, sans authentification)
export const publicProcedure = action;