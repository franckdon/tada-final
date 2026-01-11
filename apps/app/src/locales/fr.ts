import { remove } from "lodash";
import { title } from "vega-lite/types_unstable/channeldef.js";

export default {
  common: {
    search: {
      placeholder: "Rechercher...",
    },
    dateRange: {
      default: "6 jan. 2024 - 13 jan. 2024",
    },
    language: "Langue",
    currency: "Devise",
    cancel: "Annuler",
    save: "Enregistrer",
    success: "Succès",
    add: "Ajouter",
    edit: "Éditer",
    remove: "Supprimer",
    deleting: "Suppression…",
    delete: "Supprimer",
    update: "Modifier",
    updateConfig: "Modifier la configuration",
    loading: "Chargement...",
    close: "Fermer",
    all: "Tous",
    choose: "Choisir",
    upgrade: "Mettre à niveau",
    popular: "Le plus populaire",
    unlimited: "Illimité",
    month: "mois",
    year: "an",
    waitPlease: "Veuillez patienter",
    continue: "Continuer",
    next: "Suivant",
    contactUs: "Contactez-nous",
    loadingOverlay: {
      title: "Chargement de la mission...",
      subtitle: "Veuillez patienter pendant que nous préparons votre contenu",
    },
    or: "Ou",
    error: {
      somethingWentWrong: "Une erreur est survenue",
      tryAgain: "Réessayer",
    },
    noResults: {
      title: "Pas de résultats",
      noItems: "Aucune items n'a été créée pour le moment.",
      withFilters: "Essayez une autre recherche ou ajustez les filtres.",
      clearFilters: "Annuler les filtres",
    },
  },
  visualizations:{
      bar: "Diagramme à barres",
      column: "Diagramme à colonnes",
      stacked_bar: "Diagramme à barres empilées",
      stacked_column: "Diagramme à colonnes empilées",
      pie: "Diagramme circulaire",
      table: "Tableau",
      turf: "Diagramme radar / turf",
  },
  comments:{
    title: "Commentaires",
    titleQuestion : "Commentaires sur la question",
    countLabel: "{count} commentaire(s)",
    loading: "Chargement des commentaires...",
    newQuestion: "Nouveau commentaire sur la question",
    empty: "Pas encore de commentaires.",
    emptyQuestion: "Pas encore de commentaires sur cette question.",
    newGlobal: "Nouveau commentaire",
    newPlaceholder: "Écrire un commentaire...",
    newPlaceholderQuestion: "Commenter cette question...",
    sending: "Envoi en cours...",
    send: "Envoyer",
    openButton: "Ouvrir les commentaires",
    searchPlaceholder: "Rechercher des commentaires...",
    button: "Commentaires",
    filter:{
      sortByDate: "Trier par date",
      sortByUnread: "Trier par non lus",
      showResolved: "Afficher les résolus",
      onlyYours: "Seulement les vôtres",
      onlyCurrentPage: "Seulement la page actuelle",
      all: "Tous",
      resolved: "Résolus",
      open: "Ouverts",
    },
    bubble:{
      title: "Commentaires",
      description: "Voir et ajouter des commentaires à cette question du sondage.",
      new: "Nouveau commentaire",
      placeholder: "Écrire un commentaire...",
    },
    status:{
      open: "Ouvert",
      resolved: "Résolu",
      archived: "Archivé",
    },
    actions: {
      reply: "Répondre",
      edit: "Modifier",
      reopen: "Rouvrir",
      resolve: "Résoudre",
      delete: "Supprimer",
      cancel: "Annuler",
      save: "Enregistrer",
      replyPlaceholder: "Écrire une réponse...",
      sendReply: "Envoyer la réponse",
      markOpen: "Marquer comme ouvert",
      markResolved: "Marquer comme résolu",
    },
  },
  billing: {
    success: {
      title: "Paiement réussi !",
      subscriptionActivated: "Abonnement activé avec succès",
    },
    error: {
      title: "Erreur",
    },
    errors: {
      missingSessionId: "Session ID manquant.",
      generalError: "Une erreur est survenue.",
      sessionRetrievalError: "Erreur lors de la récupération de la session.",
    },
    loading: {
      verifyingPayment: "Vérification de votre paiement...",
    },
    invoice: {
      title: "Facture",
      number: "Numéro",
      viewOnline: "Voir en ligne",
      downloadPdf: "Télécharger PDF",
    },
    actions: {
      backToPricing: "Retour aux tarifs",
      continueToDashboard: "Continuer vers le tableau de bord",
    },
  },
  invoices: {
    title: "Mes factures",
    total: "{count} facture(s)",
    paidOn: "Payée le",
    loading: {
      fetchingInvoices: "Chargement des factures...",
    },
    error: {
      title: "Erreur de chargement",
    },
    errors: {
      fetchError: "Impossible de charger les factures.",
    },
    empty: {
      title: "Aucune facture",
      description: "Vous n'avez pas encore de factures.",
    },
    status: {
      paid: "Payée",
      open: "En attente",
      void: "Annulée",
      uncollectible: "Impayée",
      draft: "Brouillon",
    },
    actions: {
      view: "Voir",
      download: "Télécharger",
      retry: "Réessayer",
      loadMore: "Charger plus",
      loading: "Chargement...",
    },
  },
  support: {
    title: "Support",
    description:
      "Veuillez remplir le formulaire ci-dessous pour soumettre une demande de support.",
    subject: "Sujet",
    priority: "Gravité",
    selectSeverity: "Sélectionner la gravité",
    low: "Faible",
    normal: "Normal",
    high: "Élevé",
    urgent: "Urgent",
    message: "Message",
    messagePlaceholder:
      "Décrivez le problème que vous rencontrez, ainsi que toutes les informations pertinentes. Veuillez être aussi précis et spécifique que possible.",
    product: "Produit",
    selectProduct: "Sélectionner le produit",
    subjectPlaceholder: "Résumé du problème que vous avez",
    submit: "Envoyer",
    mission: "Mission",
    marketBeats: "Tendances du marché",
    general: "Général",
    messageSent: "Ticket de support envoyé.",
    messageError: "Une erreur est survenue, veuillez réessayer.",
  },
  export: {
    errors: {
      missingId: "Identifiant de mission manquant",
      notFound: "Mission non trouvée",
    },
    columns: {
      mission: "Mission",
      problemSummary: "Résumé du problème",
      objectives: "Objectifs",
      assumptions: "Hypothèses",
      organization: "Organisation",
      questionnaire: "Questionnaire",
      responseId: "Id réponse",
      age: "Âge",
      gender: "Genre",
      ipAddress: "Adresse IP",
      userAgent: "Navigateur",
      submittedAt: "Soumis à",
      status: "Statut",
    },
  },
  header: {
    credits: "Crédits",
    billingAddressTitle: "Saisir l'adresse de facturation",
    billingAddressInfo:
      "Vous devez saisir votre adresse de facturation pour acheter des crédits.",
    street: "Nom et numéro de rue",
    postalCode: "Code postal",
    city: "Ville",
    country: "Pays",
    company: "Entreprise",
    latestUpdates: "Dernières mises à jour",
    improved: "AMÉLIORÉ",
    new: "NOUVEAU",
    aiInsightsTitle: "Insights IA pour plusieurs questions à la fois",
    aiInsightsDesc:
      "L'ajout d'insights IA à votre tableau de résultats est devenu beaucoup plus facile. Vous pouvez maintenant sélectionner...",
    pValuesTitle:
      "Afficher les valeurs P non significatives dans les tests de signification",
    pValuesDesc:
      "Vous pouvez maintenant choisir d'afficher toutes les valeurs P dans vos visualisations de signification, de manière critique...",
    filterMatchingTitle:
      "Correspondance intelligente des filtres lors de la création de sondages",
    filterMatchingDesc:
      "Fatigué de répéter manuellement la même logique de filtre pour chaque option de réponse dans vos sondages...",
    poweredBy: "Propulsé par Canny • RSS",
    seeAllChanges: "Voir tous les changements",
  },
  creditsModal: {
    title: "Ajout de crédits",
    approvedBy: "Apprécié et approuvé par plus de 2000 équipes",
    researchAsYouGo: {
      title: "Ajouter du crédit supplémentaire",
      price: "1.50€/Crédit",
      creditCount: "Nombre de crédits",
      totalHT: "Total HT :",
    },
    plan: {
      maxMissions: "Missions max",
      maxUsers: "Utilisateurs max",
      maxResponses: "Réponses max",
      manageSubscription: "Gérer l’abonnement",
    },
    noPlan: {
      title: "Aucun plan actif",
      description: "Vous devez d’abord souscrire à un plan pour continuer.",
      seePricing: "Voir les offres",
    },
    starterPlan: {
      title: "Plan Starter",
      desc: "20 000 Crédits / année",
      feature1: "Onboarding personnalisé",
      feature2: "Jusqu’à 5 études ad hoc",
    },
    teamPlan: {
      title: "Plan Équipe",
      desc: "100 000 Crédits / année",
      feature1: "Expert en réussite client",
      feature2: "Jusqu’à 12 études ad hoc",
    },
    businessPlan: {
      title: "Plan Business",
      desc: "275 000 Crédits / année",
      feature1: "Expert à l’écoute",
      feature2: "Jusqu’à 36 études ad hoc",
      feature3: "Étude en full-service",
    },
  },
  paymentModal: {
    title: "Résumé de la commande",
    summarySection: {
      title: "Résumé",
      creditsLabel: "Crédits Appinio 'Recherche à la demande'",
      pricePerCredit: "Prix par crédit :",
      totalHT: "Total HT :",
      disclaimer:
        "L'acceptation des termes et conditions est obligatoire. En cliquant sur « Acheter », vous vous engagez à régler le montant mentionné. Les crédits sont valables pour une période de 12 mois à compter de la date d'achat. Tous les prix sont indiqués hors taxe.",
      gdpr: "Conforme au RGPD",
      ssl: "Chiffrage SSL sécurisé",
      capterra: "Noté 4,9 sur Capterra",
    },
    paymentSuccess: "Payment successful! Your credits have been added.",
    paymentMethodSection: {
      title: "Mode de paiement",
      invoice: "Payer sur facture",
      payWith: "Payer avec",
    },
    form: {
      civility: "Civilité",
      firstName: "Prénom",
      lastName: "Nom de famille",
      streetNumber: "Numéro et rue",
      postalCode: "Code postal",
      city: "Ville",
      country: "Pays",
      company: "Entreprise",
      acceptTerms: "J'accepte les",
      termsAndConditions: "Termes et conditions",
    },
    buyCreditsButton: "Acheter {credits} crédits",
  },
  countries: {
    germany: "Allemagne",
    france: "France",
    spain: "Espagne",
    uk: "Royaume-Uni",
    usa: "USA",
    ivoryCoast: "Côte d'Ivoire",
  },
  form: {
    civility: {
      mr: "M.",
      mrs: "Mme.",
    },
  },
  studies: {
    title: "Études menées par Tada",
    searchPlaceholder: "Rechercher une étude...",
    typeSelector: {
      placeholder: "Type d'étude",
      allTypes: "Tous les types",
      hypeTrain: "Hype Train",
      hypeTracker: "Hype Tracker",
      reports: "Rapports",
    },
    subscription: {
      freeVersion: "Version gratuite",
      freeDescription:
        "Vous pouvez consulter jusqu'à {count} missions du super admin avec votre plan actuel.",
      limitReached: "Limite de missions atteinte",
      limitDescription:
        "Vous avez consulté {current} missions sur {max} disponibles pour votre plan actuel.",
    },
    navigation: {
      hypeTrain: "Hype Train",
      cooperation: "Coopération",
      reports: "Rapports",
      all: "Tout",
    },
    card: {
      premium: "Premium",
      loadingStudy: "Chargement de l'étude...",
    },
  },
  upgrade: {
    plans: {
      priceFormat: "{price}/{interval}",
      unlimitedStudies: "Missions illimitées",
      studiesPerMonth: "{count} missions par mois",
      upgradeButton: "Mettre à niveau",
    },
    modal: {
      close: "Fermer",
      title: "Accès limité",
      description:
        'La mission "{studyTitle}" nécessite un abonnement supérieur. Votre plan actuel vous permet de consulter {count} missions. Veuillez mettre à niveau votre abonnement pour accéder à plus de contenu.',
    },
  },
  errors: {
    loadingSubscription: "Erreur lors du chargement de l'abonnement",
    loadingPlans: "Impossible de charger les plans",
    createCheckout: "Impossible de créer la session de paiement",
    accessStudy: "Impossible d'accéder à l'étude",
    unexpectedError: "Une erreur inattendue s'est produite",
    consultMission: "Échec de la consultation de la mission du super admin.",
  },
  navigation: {
    home: "Accueil",
    cards: "Cartes",
    orders: "Commandes",
    settings: "Paramètres",
    missions: "Projets",
    templatesSurveys: "Modèles",
    workspace: "Espace de travail",
    createWorkspace: "Créer un espace de travail",
    workspaceSettings: "Paramètres de l’espace de travail",
    explore: "Explorer",
    knowledge: "Connaissances",
    dashboard: "Tableau de bord",
    projects: "Projets",
    multiprojects: "Multi-projets",
    templates: "Modèles",
    marketBeats: "Tendances du marché",
    help: "Centre d'aide",
    analysis: "Analyse IA",
    contactUs: "Contact us",
    userManagement: "Gestion utilisateur",
  },
  user: {
    menu: {
      title: "Mon compte",
      profile: "Profil",
      settings: "Paramètres",
      pricings: "Tarifs",
      signOut: "Se déconnecter",
      support: "Support",
    },
  },
  welcome: "Bonjour {name}!",
  auth: {
    invitation: {
      titleDefault: "Invitation",
      subtitleDefault: "Finalisez l’accès à votre workspace.",
      title: "Rejoindre {workspace}",
      subtitleNew: "Créez votre compte pour {email}",
      subtitleExisting: "Connectez-vous pour accepter l’invitation.",
      loading: "Vérification de l’invitation…",

      password: "Mot de passe",
      passwordPlaceholder: "Minimum 8 caractères",
      passwordHint: "Utilisez au moins 8 caractères.",
      confirmPassword: "Confirmer le mot de passe",
      confirmPasswordPlaceholder: "Confirmez votre mot de passe",
      passwordMismatch: "Les mots de passe ne correspondent pas.",

      submit: "Créer mon compte et rejoindre",
      creating: "Création…",

      existingHint: "Un compte existe déjà avec cet email. Veuillez vous connecter pour accepter l’invitation.",
      goToLogin: "Se connecter",

      alreadyHaveAccount: "Vous avez déjà un compte ?",
      loginLink: "Se connecter",

      errors: {
        missingToken: "Token manquant.",
        resolveFailed: "Impossible de vérifier l’invitation.",
        acceptFailed: "Impossible d’accepter l’invitation.",
        completeFailed: "Impossible de finaliser l’invitation.",
        network: "Erreur réseau."
      }
    },
    login: {
      title:
        "Débloquez les données en temps réel pour prendre de meilleures décisions — partout, à tout moment.",
      testimonial: {
        quote1:
          "80 % des professionnels trouvent les études de marché intimidantes, ennuyeuses et trop chères. Les 20 % restants sont déjà chez nous.",
        quote2:
          "Quel que soit votre secteur ou votre mission, Tada vous fournit l’intelligence nécessaire pour générer un véritable impact.",
        quote3:
          "Nos solutions de données personnalisables vous aident à résoudre vos défis les plus critiques — plus rapidement, plus intelligemment et à grande échelle.",
        author: {
          name: "Thomas Dubois",
          role: "Directeur de Portfolio, AHL Partners",
        },
      },
      trustedBy: "Fait confiance par les leaders mondiaux de tous les secteurs",
      description: "Connectez-vous à votre compte pour continuer.",
      email: "Email",
      password: "Mot de passe",
      submit: "Se connecter",
      loading: "Connexion en cours...",
      orSignInWith: "Ou connectez-vous avec:",
      noAccount: "Vous n'avez pas de compte?",
      signUp: "S'inscrire",
      google: "Continuer avec Google",
      apple: "Apple",
      forgotPassword: "Mot de passe oublié ?",
      welcomeBack: "Bon retour",
      rememberMe: "Se souvenir de moi",
      emailVerified: {
        title: "Email vérifié",
        description:
          "Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.",
      },
    },
    signup: {
      title: "Créer un compte",
      description: "Inscrivez-vous pour commencer avec Tada.",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      submit: "S'inscrire",
      loading: "Création du compte...",
      orSignUpWith: "Ou inscrivez-vous avec",
      haveAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
      google: "Google",
      apple: "Apple",
      name: "Nom",
      organizationName: "Nom de l'organisation",
    },
    verifyEmail: {
      title: "Vérifiez votre email",
      description: "Nous vous avons envoyé un lien de confirmation par email",
      checkEmail:
        "Vérifiez votre boîte de réception et cliquez sur le lien de confirmation",
      backToSignIn: "Retour à la connexion",
    },
    forgotPassword: {
      title: "Réinitialiser votre mot de passe",
      description:
        "Entrez votre email pour recevoir un lien de réinitialisation.",
      email: "Email",
      submit: "Envoyer le lien",
      loading: "Envoi en cours...",
      backToLogin: "Retour à la connexion",
      success: "Un email de réinitialisation a été envoyé.",
      error: "Une erreur est survenue. Veuillez réessayer.",
    },
    resetPassword: {
      title: "Réinitialiser votre mot de passe",
      description: "Entrez votre nouveau mot de passe ci-dessous",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      passwordPlaceholder: "Entrez votre nouveau mot de passe",
      confirmPasswordPlaceholder: "Confirmez votre nouveau mot de passe",
      submit: "Réinitialiser le mot de passe",
      backToSignIn: "Retour à la connexion",
      success: "Le mot de passe a été réinitialisé avec succès",
      errors: {
        invalidToken: "Lien de réinitialisation invalide ou expiré",
        tokenExpired: "Ce lien de réinitialisation a expiré",
        failed:
          "Échec de la réinitialisation du mot de passe. Veuillez réessayer.",
      },
      requestNewLink: "Demander un nouveau lien",
    },
    validation: {
      email: {
        required: "L'email est requis",
        invalid: "Adresse email invalide",
      },
      password: {
        required: "Le mot de passe est requis",
        minLength: "Le mot de passe doit contenir au moins 8 caractères",
        pattern:
          "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre",
      },
      confirmPassword: {
        required: "Veuillez confirmer votre mot de passe",
        match: "Les mots de passe ne correspondent pas",
      },
      name: {
        required: "Le nom est requis",
      },
      organizationName: {
        required: "Le nom de l'organisation est requis",
      },
    },
  },
  settings: {
    tabs: {
      profile: "Profil",
      password: "Mot de passe",
      users: "Utilisateurs",
      organizations: "Organisation",
    },
    personalInfo: {
      title: "Informations personnelles",
      description: "Mettre à jour vos informations personnelles",
      name: "Nom complet",
      email: "Adresse email",
      position: "Poste",
      country: "Pays de résidence",
      sector: "Secteur d'activité",
      avatar: "Votre avatar",
      avatarDescription: "Cela sera affiché sur votre profil",
      uploadText: "Cliquer pour télécharger",
      dragAndDrop: "ou glisser-déposer",
      fileTypes: "SVG, PNG, JPG ou GIF (max. 800x400px)",
      selectCountry: "Sélectionner un pays",
      selectSector: "Sélectionner un secteur",
      success: "Informations personnelles mises à jour avec succès",
      error: "Échec de la mise à jour des informations personnelles",
      firstName: "Prénom",
      lastName: "Nom",
      sectors: {
        education: "Education",
        technology: "Technologie",
        healthcare: "Santé",
        finance: "Finance",
        other: "Autre",
      },
      validation: {
        name: {
          required: "Le nom est requis",
          tooShort: "Le nom doit contenir au moins 2 caractères",
        },
        email: {
          required: "L'email est requis",
          invalid: "Adresse email invalide",
        },
        position: {
          required: "Le poste est requis",
          tooShort: "Le poste doit contenir au moins 2 caractères",
        },
        country: {
          required: "Veuillez sélectionner un pays",
        },
        sector: {
          required: "Veuillez sélectionner un secteur",
        },
      },
    },
    title: "Paramètres",
    profile: {
      meta: {
        title: "Profil",
      },
    },
    password: {
      title: "Mot de passe",
      description:
        "Veuillez entrer votre mot de passe actuel pour le modifier.",
      current: "Mot de passe actuel",
      new: "Nouveau mot de passe",
      confirm: "Confirmation du mot de passe",
      hint: "Votre mot de passe doit contenir au moins 8 caractères",
      success: "Votre mot de passe a été modifié avec succès",
      error: "Une erreur est survenue lors de la modification du mot de passe",
      validation: {
        currentRequired: "Le mot de passe actuel est requis",
        newRequired: "Le nouveau mot de passe est requis",
        confirmRequired: "La confirmation du mot de passe est requise",
        tooShort: "Le mot de passe doit contenir au moins 8 caractères",
        noMatch: "Les mots de passe ne correspondent pas",
      },
    },
  },
  teamMembers: {
    invite: {
      title: "Inviter des membres",
      emailPlaceholder: "vous@exemple.com",
      selectRolePlaceholder: "Sélectionner un rôle",
      submit: "Inviter",
      delete: {
        title: "Supprimer un membre",
        description: "Le membre a été supprimé avec succès",
      },
      roles: {
        admin: "Administrateur",
        member: "Membre",
        owner: "Propriétaire",
        viewer: "Observateur",
      },
      success: {
        title: "Invitation envoyée",
        description: "Un email d'invitation a été envoyé à {email}",
      },
      error: {
        title: "Erreur d'invitation",
        description: "Une erreur est survenue lors de l'envoi de l'invitation",
      },
    },
    current: {
      title: "Membres actuels",
      description:
        "Gérez votre équipe existante et modifiez les rôles / autorisations.",
      membersCountLabel: "membre(s)",
      empty: "Aucun membre d'équipe pour le moment.",
      columns: {
        name: "Nom",
        role: "Rôle",
        actions: "Actions",
      },
      actions: {
        delete: "Supprimer",
        edit: "Modifier",
      },
    },
    organization: {
      title: "Parametres de l'organisation",
      description: "Gérez votre organisation.",
      namePlaceholder: "Nom de l'organisation",
      submit: "Modifier",
      sector: "Secteur d'activité",
      sectorPlaceholder: "Sélectionner un secteur",
      country: "Pays",
      countryPlaceholder: "Sélectionner un pays",
      edit: {
        missingId: "ID de l'organisation manque",
        success: {
          title: "Organisation mise à jour",
          description: "Le {name} a été modifié en {newName}.",
        },
        error: {
          title: "Erreur",
          description:
            "Une erreur est survenue lors de la mise à jour de l'organisation.",
        },
      },
      avatar: {
        title: "Photo de profil",
        description:
          "Téléversez et gérez votre avatar de profil. Il sera visible par les autres membres de l'équipe.",
        upload: {
          button: "Cliquez pour téléverser",
          formats: "SVG, PNG, JPG ou GIF (max. 800x400px)",
          maxSize: "Taille maximale du fichier : 5 Mo",
        },
      },
      name: {
        title: "Nom de l'organisation",
        description:
          "Gérez le nom et les paramètres de votre organisation. Ils seront visibles dans tout votre espace de travail.",
        label: "Nom de l'organisation",
        placeholder: "Entrez le nom de votre organisation",
        save: "Enregistrer les modifications",
        saving: "Enregistrement...",
      },
    },
    edit: {
      title: "Modifier le rôle de {name}",
      selectRolePlaceholder: "Sélectionner un nouveau rôle",
      success: {
        title: "Rôle mis à jour",
        description: "Le rôle de {name} a été changé en {role}",
      },
      error: {
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du rôle",
      },
    },
  },
  invitation: {
    title: "Invitation à rejoindre l'équipe",
    description:
      "Vous avez été invité à rejoindre {organization} par {inviter}",
    accept: "Accepter l'invitation",
    decline: "Décliner",
    backToLogin: "Retour à la connexion",
    errors: {
      notFound: "Cette invitation n'existe pas ou a expiré",
      invalid: "Cette invitation n'est pas valide",
      acceptFailed: "Impossible d'accepter l'invitation",
    },
    success: {
      title: "Invitation acceptée",
      description: "Vous avez rejoint {organization} avec succès",
    },
    error: {
      title: "Erreur",
      description:
        "Une erreur est survenue lors de l'acceptation de l'invitation",
    },
    createAndAccept: "Créer un compte et accepter",
    signInAndAccept: "Se connecter et accepter",
    alreadyHaveAccount: "Déjà un compte ? Se connecter",
    needAccount: "Besoin d'un compte ? S'inscrire",
  },
  organization: {
    setup: {
      title: "Configuration de votre espace",
      description: "Créez votre organisation ou rejoignez-en une existante",
      create: {
        title: "Créer une nouvelle organisation",
        namePlaceholder: "Nom de votre organisation",
        submit: "Créer l'organisation",
      },
      join: {
        title: "Rejoindre une organisation existante",
        submit: "Utiliser une invitation",
      },
    },
    created: {
      title: "Organisation créée",
      description: "Votre organisation a été créée avec succès",
    },
    error: {
      title: "Erreur",
      description:
        "Une erreur est survenue lors de la création de l'organisation",
    },
    join: {
      title: "Rejoindre une organisation",
      needInvitation:
        "Demandez à votre entreprise de vous inviter pour rejoindre leur espace",
    },
  },
  workspace: {
    defaultName: "My Workspace",
      defaultNamePlaceholder: "Entrez le nom du workspace",
      helper: "Entrez le nom de votre workspace.",
    informationTitle: "Informations sur le workspace",
      inviteTitle: "Inviter des membres de l'équipe",
      inviteHint:
        "Ajoutez des membres de l'équipe pour collaborer sur des projets au sein de cet espace de travail.",
      saveButton: "Enregistrer les modifications",
          settings: {
            title: "Paramètres du workspace",
            generalTitle: "Informations générales",
            subtitle:
              "Gérez les paramètres de votre workspace, y compris les membres de l'équipe et les options de suppression.",
            teamTitle: "Équipe du workspace",
            invitePlaceholder: "Invitez des membres de l'équipe par email",
            rolePlaceholder: "Sélectionner un rôle",
            emptyMembers: "Aucun membre n'a été ajouté pour le moment.",
            inviteButton: "Envoyer l'invitation",
            deleteInvitationTitle: "Supprimer l'invitation",
            deleteInvitationDescription:
              "Êtes-vous sûr de vouloir supprimer cette invitation ?",
            deleteInvitationCancel: "Annuler",
            deleteInvitationConfirm: "Oui, supprimer l'invitation",
            billingTitle: "Facturation du workspace",
            billingEmpty: "Aucune information de facturation disponible.",
            fields:{
              logo: "Logo du workspace",
              name: "Nom du workspace",
              slug: "Slug du workspace",
              slugHelp: "Le slug du workspace est utilisé dans l'URL pour identifier votre workspace.",
        },
        menu: {
          generalTitle: "Général",
          generalSubtitle: "Informations de base du workspace",
          membersTitle: "Membres",
          membersSubtitle: "Gérer les membres de l'équipe",
          billingTitle: "Facturation & Plans",
          billingSubtitle: "Gérer la facturation",
        },
            columns: {
              member: "Membre",
              role: "Rôle",
              status: "Statut",
              actions: "Actions",
            },
            dangerTitle: "Zone dangereuse",
            dangerDescription:
              "Supprimez définitivement ce workspace et toutes ses données. Cette action est irréversible.",
            deleteButton: "Supprimer le workspace",
            deleteDialogTitle: "Supprimer le workspace «{{name}}»",
        deleteDialogDescription:
      "Veuillez taper le nom du workspace «{{name}}» pour confirmer la suppression.",
    workspaceNameLabel: "Nom du workspace",
    confirmDeleteButton: "Supprimer le workspace",
            deleteConfirmTitle: "Êtes-vous sûr ?",
            deleteConfirmDescription:
              "Cette action supprimera définitivement le workspace et toutes ses données. Cette action est irréversible.",
            deleteConfirmInputPlaceholder: "Tapez SUPPRIMER pour confirmer",
            deleteConfirmButton: "Oui, supprimer le workspace",
            deleteSuccessTitle: "Workspace supprimé",
            deleteSuccessDescription:
              "Le workspace a été supprimé avec succès.",
          },
        },
  missions: {
      list:{
          columns: {
            name: "Nom",
            progress: "Progression",
            submissions: "Soumissions",
            updated: "Dernière mise à jour",
            actions: "Actions",
          },
        },
      delete: {
            title: "Supprimer la mission",
            description: "Voulez-vous supprimer cette mission ?",
            cancel: "Non",
            confirmCta: "Oui, supprimer",
            deleting: "Suppression en cours...",
            successTitle: "Mission supprimée",
            successMessage: "La mission a été supprimée avec succès.",
            successDescription: "La mission a été supprimée avec succès.",
            label: "Supprimer la mission",
            disabledTooltip:
          "Cette mission ne peut pas être supprimée car elle a des soumissions.",
            errorTitle: "Erreur",
            errorMessage: "Une erreur est survenue lors de la suppression de la mission.",
            errorDescription:
              "Une erreur est survenue lors de la suppression de la mission. Veuillez réessayer.",
          },
      duplicate: {
        success: "Mission dupliquée avec succès",
        error: "Une erreur est survenue lors de la duplication de la mission",
        redirect: "Vous serez redirigé vers le projet dupliqué...",
        descriptionSuccess: "La mission a été dupliquée avec succès.",
        descriptionError: "Une erreur est survenue lors de la duplication.",
        loading: "Duplication de la mission en cours...",
      },
    errors: {
      notFound: "Mission non trouvée",
    },
    update: {
      alreadyPending: "Modification déjà en attente de validation",
      submittedForReview: "Mission modifiée et soumise pour validation",
      genericError: "Erreur lors de la modification",
      editTooSoon: "Modification impossible. Attendez le mois prochain",
    },
    navigation: {
      overview: "Aperçu",
      dashboards: "Tableau de bord",
      submissions: "Soumissions",
      edit: "Modifier le projet",
      delete: "Supprimer la mission",
    },
    overview: {
      title: "Sous tableau de bord",
      empty: "Aucune réponse soumise pour le moment.",
      noSurvey: "Aucun questionnaire trouvé.",
      addSubDash: "Ajouter un sous  TDB",
      tableColumns: {
        name: "Nom",
        status: "Statut",
        author: "Auteur",
        email: "Email",
        createdAt: "Date",
      },
    },
    createSurveyModal: {
      createButton: "Créer le questionnaire",
      title: "Créer le questionnaire",
      loading: "Chargement...",
      ai: {
        title: "Construire avec l'IA",
        feature1: "Lancement rapide",
        feature2: "Questions illimitées, plus de 20 formats, ciblage complet",
        description:
          "Décrivez votre objectif, et l'IA génère automatiquement le brief et le questionnaire. Modifiez les questions, définissez le ciblage et soumettez pour validation",
      },
      template: {
        title: "Commencer à partir d'un modèle",
        feature1: "Études rapides et standard",
        feature2: "Structure préconstruite, 1 à 10 questions, livraison rapide",
        description:
          "Choisissez un format d'enquête prêt à l'emploi et lancez-le en quelques minutes.",
      },
      upload: {
        title: "Importer votre questionnaire",
        feature1: "Enquêtes internes nécessitant une exécution sur le terrain",
        feature2: "Importation de fichiers, audience personnalisée, tableau de bord analytique",
        description:
          "Importez votre questionnaire existant — nous nous occupons de la distribution",
      },
      manuel: {
        title: "Construire manuellement",
        feature1: "Recherche personnalisée avancée",
        feature2: "Questions illimitées, tâches média + GPS, contrôles logiques",
        description:
          "Créez votre questionnaire de A à Z avec une flexibilité totale.",
      },
      comingSoon: "Bientôt disponible",
    },
    addSubDashboard: {
      title: "Ajouter un sous dashboard",
      notFound: {
        title: "Mission introuvable",
        description:
          "La mission que vous recherchez n’existe pas ou a été supprimée.",
        backToMission: "Retour aux missions",
      },
      form: {
        nameLabel: "Nom",
        namePlaceholder: "Entrez le nom",
        visibilityLabel: "Partager ce tableau de bord",
        visibilityDescription:
          "Ce TDB sera visible par tous les membres du workspace.",
        cancelButton: "Annuler",
        addButton: "Ajouter",
        submittingButton: "Ajout en cours...",
      },
      validation: {
        nameMin: "Minimum 3 caractères",
        nameMax: "Maximum 50 caractères",
        typeRequired: "Le type est requis",
      },
      imageViewer: {
        title: "Visualisation d'image",
        reset: "Réinitialiser",
        doubleClickHint:
          "Double-cliquez sur l'image pour réinitialiser le zoom",
      },
      imageItem: {
        editMode: "Modifier l'image",
        viewMode: "Aperçu de l'image",
        preview: "Aperçu :",
        selectImage: "Sélectionner une image",
        dragDropText: "Glissez-déposez ou cliquez pour parcourir",
        fileFormats: "PNG, JPG, GIF jusqu'à 10MB",
        saving: "Sauvegarde...",
        save: "Sauvegarder",
        cancel: "Annuler",
        deleteTitle: "Suppression de l'image",
        deleteMessage: "Voulez-vous supprimer cette image ?",
        deleteConfirm: "Oui",
        deleteCancel: "Non",
        deleting: "Suppression en cours...",
        updateSuccess: "Image mise à jour",
        updateSuccessDescription: "L'image a été mise à jour avec succès.",
        error: "Erreur",
        updateErrorDescription:
          "Une erreur est survenue lors de la mise à jour de l'image.",
        altText: "Image du dashboard",
      },
      textItem: {
        editMode: "Modifier le texte",
        placeholder: "Saisissez votre texte ici",
        saving: "Enregistrement...",
        save: "Enregistrer",
        cancel: "Annuler",
        deleteTitle: "Supprimer le texte",
        deleteMessage: "Voulez-vous supprimer ce texte ?",
        deleteConfirm: "Oui",
        deleteCancel: "Non",
        deleting: "Suppression en cours...",
        updateSuccess: "Texte mis à jour",
        updateSuccessDescription: "Le texte a été mis à jour avec succès.",
        error: "Erreur",
        updateErrorDescription:
          "Une erreur est survenue lors de la mise à jour du texte.",
      },
      surveyItem: {
        editMode: "Modifier le questionnaire",
        placeholder: "Saisissez votre question ici",
        saving: "Enregistrement...",
        save: "Enregistrer",
        cancel: "Annuler",
        deleteTitle: "Supprimer le questionnaire",
        deleteMessage: "Voulez-vous supprimer ce questionnaire ?",
        deleteConfirm: "Oui",
        deleteCancel: "Non",
        deleting: "Suppression...",
        updateSuccess: "Questionnaire mis à jour",
        updateSuccessDescription:
          "Le questionnaire a été mis à jour avec succès.",
        error: "Erreur",
        updateErrorDescription:
          "Une erreur est survenue lors de la mise à jour du questionnaire.",
        export: "Exporter le questionnaire",
        share: "Partager le questionnaire",
        comments: "Commentaires",
        exportCsv: "Exporter en CSV",
        exportPdf: "Exporter en PDF",
        exportPng: "Exporter en PNG",
        exportPpt: "Exporter en PowerPoint",
        viewComments: "Voir les commentaires",
        copyRawData: "Copier les données brutes",
        copyPublicLink: "Copier le lien public",
      },
      empty: {
        title: "Votre dashboard est vide",
        subtitle:
          "Commencez par ajouter des éléments à votre sous tableau de bord",
      },
      item: {
        title: "Ajouter un élément",
        text: {
          title: "Texte",
          description: "Ajouter du contenu textuel",
        },
        image: {
          title: "Image",
          description: "Ajouter une image",
        },
        survey: {
          title: "Questionnaire",
          description: "Intégrer un questionnaire",
        },
      },
      questionnaireEditor: {
        title: "Éditeur de questionnaire",
        editMode: "Modifier le questionnaire",
        viewMode: "Aperçu du questionnaire",
        addQuestion: "Ajouter une question",
        questionTypes: {
          text: "Texte court",
          comment: "Texte long",
          radiogroup: "Choix unique",
          checkbox: "Choix multiples",
          dropdown: "Liste déroulante",
          rating: "Évaluation",
          boolean: "Oui/Non",
          file: "Fichier",
          matrix: "Matrice",
          ranking: "Classement",
          imagepicker: "Sélection d'images",
          html: "Contenu HTML",
        },
        questionSettings: {
          title: "Titre de la question",
          titlePlaceholder: "Saisissez le titre de votre question",
          description: "Description (optionnel)",
          descriptionPlaceholder:
            "Ajoutez une description pour clarifier la question",
          required: "Question obligatoire",
          choices: "Choix disponibles",
          addChoice: "Ajouter un choix",
          choicePlaceholder: "Nouveau choix",
          ratingScale: "Échelle d'évaluation",
          minRating: "Note minimale",
          maxRating: "Note maximale",
          minLabel: "Libellé minimum",
          maxLabel: "Libellé maximum",
          fileTypes: "Types de fichiers acceptés",
          maxFileSize: "Taille maximale (MB)",
          multipleFiles: "Fichiers multiples",
          htmlContent: "Contenu HTML",
        },
        actions: {
          save: "Sauvegarder",
          saving: "Sauvegarde...",
          cancel: "Annuler",
          delete: "Supprimer",
          preview: "Aperçu",
          addQuestion: "Ajouter une question",
          moveUp: "Déplacer vers le haut",
          moveDown: "Déplacer vers le bas",
          duplicate: "Dupliquer",
        },
        messages: {
          deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette question ?",
          deleteQuestionnaireConfirm:
            "Êtes-vous sûr de vouloir supprimer ce questionnaire ?",
          noQuestions: "Aucune question ajoutée",
          noQuestionsDescription:
            "Commencez par ajouter votre première question",
          updateSuccess: "Questionnaire mis à jour",
          updateSuccessDescription:
            "Le questionnaire a été mis à jour avec succès.",
          error: "Erreur",
          updateErrorDescription:
            "Une erreur est survenue lors de la mise à jour.",
        },
        preview: {
          title: "Aperçu du questionnaire",
          sampleData: "Données d'exemple",
          responses: "réponses collectées",
          lastUpdated: "Dernière mise à jour",
        },
      },
      createSubDashboardState: {
        success: "Sous tableau de bord créé avec succès",
        error:
          "Une erreur est survenue lors de la création du sous tableau de bord",
      },
      create: {
        success: "Élément ajouté avec succès",
        error: "Une erreur est survenue lors de la création de l'élément",
      },
      update: {
        success: "Élément mis à jour avec succès",
        error: "Une erreur est survenue lors de la mise à jour de l'élément",
      },
      delete: {
        success: "Élément supprimé avec succès",
        error: "Une erreur est survenue lors de la suppression du élément",
      },
    },
    status: {
      live: "En cours",
      complete: "Terminée",
      paused: "En pause",
      cancelled: "Annulée",
      all: "Toutes les missions",
      "on hold": "En attente",
      draft: "Brouillon",
      on_hold: "En attente",
    },
    updated: "Mission mise à jour avec succès",
    updatedError:
      "Une erreur est survenue lors de la mise à jour de la mission",
    updatedDescription: "Mission mise à jour avec succès",
    updatedErrorDescription:
      "Une erreur est survenue lors de la mise à jour de la mission",
    filter: {
      title: "Filtrer les projets :",
      add: "Ajouter un projet",
    },
    completion: "{percentage}% complétée",
    submissions: "{submissions} soumissions",
    updated_type: {
      form: "Changements apportés au formulaire",
      audience: "Changements apportés à l'audience",
      objective: "Changements apportés à l'objectif",
      assumptions: "Changements apportés aux hypothèses",
      problem: "Changements apportés au problème",
      solution: "Changements apportés à la solution",
      other: "Autre",
    },
    ai: {
      tipsAiCard: {
        intro: "Voici quelques conseils pour bien utiliser cet outil :",
        provide: "Donnez-moi",
        provideDetail: "autant d'infos que possible pour un meilleur brief.",
        askMe: "N'hésitez",
        askMeDetail:
          "pas à demander des clarifications, je suis là pour expliquer.",
        youCanChange: "Modifiez",
        youCanChangeDetail:
          "le brief à tout moment en utilisant le bouton d'édition si nécessaire.",
      },
    },
    createMission: {
      filedFilled: "Champs remplis(...)",
      form: {
        researchMarket: "Analyse de marché",
        aiUpdateFromConversations: "Mettre à jour avec l'IA à partir des conversations",
        filterAudiences: "Filtrer les audiences",
        problemSummary: "Enoncé du problème",
        strategicGoal: "Objectifs stratégiques",
        assumptions:
          "Hypothèses potentielles à explorer - sélectionnez celles que vous pensez être les plus pertinentes",
        audiences: "Publics ciblés/marchés",
        name: "Nom de la mission",
        placeholder:
          "Répondez aux questions dans le chat pour générer cette section",
        targetPlaceholder: "Choisissez qui et où cibler—atteignez les bons répondants avec plus de 2500 caractéristiques",
        surveys: "Questionnaires",
        success: "Mission créée avec succès",
        error: "Une erreur est survenue lors de la création de la mission",
        showSurveys: "Afficher les questionnaires",
        aiProposeFullBrief: "Générer avec l'IA",
        aiProposeFullStudy: "Générer avec l'IA",
        aiGenerating: "L'IA génère votre brief...",
        aiBriefFilled: "L'IA a rempli votre brief",
        aiBriefGenerating: "L'IA génère votre brief...",
        audienceSuggestionHelper:
          "suggère des audiences basées sur votre brief. Nous ajouterons bientôt plus d'options de ciblage.",
        audienceSuggestionGroupPlaceholder: "Sélectionnez un groupe d'audience",
        audienceSuggestionLabelPlaceholder: "Libellé de l'audience suggérée",
        suggestionDescriptionPlaceholder:
          "Description de l'audience suggérée",
        useSuggestion: "Utiliser la suggestion",
        audienceSuggestionCta: "Envoyer la proposition d'audience",
        audienceSuggestionSending: "Envoi de la proposition...",
        audienceSuggestionSentTitle: "Suggestion envoyée",
        audienceSuggestionSentDescription:
          "Votre suggestion d'audience a été envoyée à l'équipe Tada pour examen.",
        sampleSizeTitle: "Recommandation de taille d'échantillon",
        sampleSizeDescription:
          "En fonction de votre public cible et de vos objectifs de recherche, nous recommandons la taille d'échantillon suivante :",
        iWantToSurvey: "Je veux interroger",
        participants: "participants",
        sampleSizeHint:
          "La taille d'échantillon recommandée garantit des résultats statistiquement significatifs pour votre étude.",
      },
    },
    missionSubmission: {
      title: "Réponse aux questions",
      noData: {
        title: "Pas de réponse",
        description: "Aucune réponse pour le momennt",
      },
      tabs: {
        list: "Liste",
        map: "Carte",
      },
      export: "Exporter",
    },
    progress: {
      title: "Progression",
      description: "Suivez la progression de votre mission",
      subtitle: "Suivez l'achèvement de chaque section",
      sectionTitle: "Section",
      briefScoreLabel: "Score du brief",
      briefScoreDescription:
        "Le score du brief est calculé en fonction de l'exhaustivité de votre brief. Plus le score est élevé, plus votre brief est complet.",
      briefHelperText:
        "Continuez à répondre aux questions pour améliorer votre brief",
      score: "Le score de votre brief",
      rating:
        "Répondez aux questions dans le chat pour améliorer la qualité de votre brief",
      empty: "Vide",
      great: "Excellent!",
      good: "Bon",
      fair: "Moyen",
      perfect: "Parfait!",
    },
    surveys: {
      title: "Questions du questionnaire",
      yourBrief: "Votre brief",
      aiInfoBanner: "L'IA a généré des questions de questionnaire basées sur votre brief.",
      saveAfterSurvey: "Enregistrer avant d'acceder au questionnaire",
      saveDraft: "Enregistrer",
      publishSurvey: "Soumettre",
      published: "Questionnaire publié",
      edited: "Questionnaire modifié",
      publishedDescription: "Le questionnaire a été publié avec succès",
      publishedError:
        "Une erreur est survenue lors de la publication du questionnaire",
      saveDraftError:
        "Une erreur est survenue lors de l'enregistrement du questionnaire",
      saveDraftErrorDescription: "Veuillez réessayer",
      saveDraftSuccess: "Questionnaire enregistré avec succès",
      saveDraftSuccessDescription:
        "Le questionnaire a été enregistré avec succès",
      publishedErrorDescription: "Veuillez réessayer",
      addNewQuestion: {
        title: "Ajouter une nouvelle question",
        searchPlaceholder: "Rechercher des types de questions...",
        searchPlaceholderAi: "Dites nous  ce que vous voulez comme question...",
        generateQuestion: "Générer une question",
        backToTypes: "Retour aux types de questions",
        questionType: "Type de question",
        questionText: "Texte de la question",
        questionPlaceholder: "Entrez votre question ici",
        options: "Options",
        addOption: "Ajouter une option",
        ratingOptions: "Options d'évaluation",
        minRating: "Note minimale",
        maxRating: "Note maximale",
        displayAsStars: "Afficher en étoiles",
        required: "Obligatoire",
        noResults: "Aucun type de question trouvé correspondant à la recherche",
        cancel: "Annuler",
        add: "Ajouter",
        update: "Mettre à jour",
        editQuestion: "Modifier la question",
        deleteQuestion: "Supprimer la question",
        aiModeDisabled:
          "Le mode IA est désactivé. Veuillez l'activer pour générer des questions.",
        deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette question ?",
        questionDescription: "Description de la question (optionnel)",
        scaleSettings: "Paramètres de l'échelle",
        minValue: "Valeur minimale",
        maxValue: "Valeur maximale",
        hasOtherOption: "Autre option",
        minLabel: "Minimum Label",
        maxLabel: "Maximum Label",
        matrixRows: "Ligne de la matrice",
        addRow: "Ajouter une ligne",
        matrixColumns: "Colonne de la matrice",
        addColumn: "Ajouter une colonne",
        mediaTypes: "Media Types",
        maxSizeMb: "Max size (MB)",
        maxFiles: "Max files",
        captureRequired: "Capture requise",
        gpsMode: "Mode GPS",
        locationLabel: "Étiquette de localisation",
        maxDistanceMeters: "Distance maximale (mètres)",
        minTimeOnSiteSeconds: "Temps minimum sur le site (secondes)",
        gpsTolerance: "Tolérance GPS",
        requiresPathTracking: "Nécessite le suivi du chemin",
        rankingOptionsLabel: "Étiquette de l'option de classement",
        rankingOptionsHelp:
          "Faites glisser et déposez pour réorganiser les options de classement",
        addRankingOption: "Ajouter une option de classement",
        sectionSelectLabel: "Sélectionner une section",
        noSection: "Aucune section",
        option: "Option {number}",
        editTitle: "Modifier la question",
        heatmap:{
                  title: "Paramètres de la carte de chaleur",
                  description: "Configurer les paramètres de la question carte de chaleur",
                  desc: "Les répondants peuvent cliquer sur l'image pour indiquer les zones d'intérêt.",
                  source: "Source de l'image",
                  sourceUpload: "Télécharger l'image",
                  sourceUrl: "URL de l'image",
                  noPreview: "Aucun aperçu disponible",
                  maxClicks: "Nombre maximum de clics",
                  uploadBtn: "Cliquez pour télécharger",
                  multiple: "Autoriser plusieurs clics",
                  reason: "Pouvez-vous donnez la raison de votre sélection ?",
                  advancedZones: "Zones avancées",
                  advancedZonesDescription:
                    "Définissez des zones spécifiques sur l'image pour une analyse plus détaillée.",
                },
        imageRanking: {
          imageLabel: "Étiquette de l'image",
          imagesLabel: "Étiquettes des images",
          imageUrlPlaceholder: "URL de l'image",
          addImage: "Ajouter une image",
          imagePlaceholder: "Télécharger une image",
          uploadButton: "Cliquez pour télécharger",
        },
        mediaMode:{
          title: "Type de Média",
          upload: "Télécharger",
          stimulus: "Stimulus",
          both: "Les deux",
        },
        mediaPresets: {
            title: "Préréglages Média",
          },
        stimulus: {
          title: "Type de Stimulus",
          sourceLabel: "Étiquette de la source",
          sourceUrl: "URL de la source",
          urlLabel: "Étiquette de l'URL",
          typeLabel: "Étiquette du type",
          sourceUpload: "Téléchargement de la source",
          uploadLabel: "Étiquette de téléchargement",
        },
      },
      questionCategories: {
        common: "Communes",
        advanced: "Avancées",
        input: "Entrée",
        specialized: "Spécialisées",
        ai: "IA",
      },
      questionTypes: {
        text: {
          title: "Texte",
          description: "Question à réponse courte",
        },
        comment: {
          title: "Commentaire",
          description: "Question à réponse longue",
        },
        checkbox: {
          title: "Cases à cocher",
          description: "Question à choix multiples avec cases à cocher",
        },
        heatmap:{
          title: "Carte de chaleur",
          description: "Configurer les paramètres de la question carte de chaleur",
          desc: "Les répondants peuvent cliquer sur l'image pour indiquer les zones d'intérêt.",
          source: "Source de l'image",
          sourceUpload: "Télécharger l'image",
          sourceUrl: "URL de l'image",
        },
        radiogroup: {
          title: "Boutons radio",
          description: "Question à choix unique avec boutons radio",
        },
        dropdown: {
          title: "Liste déroulante",
          description: "Question à choix unique avec liste déroulante",
        },
        boolean: {
          title: "Booléen",
          description: "Question Oui/Non",
        },
        ranking: {
          title: "Classement",
          description: "Classer les éléments par ordre de préférence",
        },
        rating: {
          title: "Évaluation",
          description: "Évaluer sur une échelle numérique",
        },
        imagepicker: {
          title: "Sélection d'image",
          description: "Choisir parmi un ensemble d'images",
        },
        file: {
          title: "Téléchargement de fichier",
          description: "Télécharger un fichier",
        },
        date: {
          title: "Date",
          description: "Sélectionner une date",
        },
        datetime: {
          title: "Date et heure",
          description: "Sélectionner une date et une heure",
        },
        email: {
          title: "Email",
          description: "Saisir une adresse email",
        },
        number: {
          title: "Nombre",
          description: "Saisir un nombre",
        },
        phone: {
          title: "Téléphone",
          description: "Saisir un numéro de téléphone",
        },
        expression: {
          title: "Expression",
          description: "Calculer une valeur",
        },
        image: {
          title: "Image",
          description: "Afficher une image",
        },
        address: {
          title: "Adresse",
          description: "Saisir une adresse",
        },
        multipletext: {
          title: "Textes multiples",
          description: "Plusieurs champs de texte",
        },
        slider: {
          title: "Curseur",
          description: "Sélectionner une valeur avec un curseur",
        },
        nps: {
          title: "NPS",
          description: "Question de Net Promoter Score",
        },
        singleChoice: {
          title: "Choix unique",
          description: "Choisissez une option dans une liste",
        },
        multipleChoice: {
          title: "Choix multiple",
          description: "Choisissez plusieurs options dans une liste",   
        },
        likert: {
          title: "Échelle de Likert",
          description: "Évaluez l'accord sur une échelle",
        },
        numericScale: {
          title: "Échelle numérique",
          description: "Évaluez sur une échelle numérique",
        },
        open: {
          title: "Question ouverte",
          description: "Fournissez une réponse détaillée",
        },
        matrix:{
          title: "Matrice",
          description: "Matrice de choix",
        },
        imageRanking: {
          title: "Classement d'images",
          description: "Classez les images par ordre de préférence",
        },
        media: {
          title: "Média",
          description: "Intégrez des vidéos ou audio",
        },
        gps: {
          title: "Localisation GPS",
          description: "Capture de la localisation GPS",
        },
        section: {
          title: "Section",
          description: "Regrouper les questions en sections",
        },
        dragDropRanking: {
          title: "Classement par glisser-déposer",
          description: "Classez les éléments en les faisant glisser et en les déposant",
        }
      },
    },
    templates: {
      title: "Modèles de questionnaires",
      chooseTemplate: "Choisi un model",
      description: "Choisissez un modèle de questionnaire pour commencer",
      createTemplate: "Créer un modèle de questionnaire",
      questions: "{count} questions",
      success: "Modèle de questionnaire créé avec succès",
      error:
        "Une erreur est survenue lors de la création du modèle de questionnaire",
      updateTemplate: "Mettre à jour le modèle de questionnaire",
      updateTemplateError:
        "Une erreur est survenue lors de la mise à jour du modèle de questionnaire",
      updateTemplateSuccess: "Modèle de questionnaire mis à jour avec succès",
      updateTemplateSuccessDescription:
        "Le modèle de questionnaire a été mis à jour avec succès",
      updateTemplateErrorDescription:
        "Une erreur est survenue lors de la mise à jour du modèle de questionnaire",
      deleteTemplate: "Supprimer le modèle de questionnaire",
      deleteTemplateError:
        "Une erreur est survenue lors de la suppression du modèle de questionnaire",
      deleteTemplateSuccess:
        "Le modèle de questionnaire a été supprimé avec succès",
      deleteTemplateSuccessDescription:
        "Le modèle de questionnaire a été supprimé avec succès",
      deleteTemplateErrorDescription:
        "Une erreur est survenue lors de la suppression du modèle de questionnaire",
      lastUpdate: "Dernière mise à jour",
      status: {
        all: "Tous les modèles",
        marketing: "Marketing",
        research: "Recherche",
      },
      navigation: {
        internal: "Base Interne",
        external: "Base Externe",
        owner: "Propriétaire",
        createdAt: "Date de création",
        updatedAt: "Date de mise à jour",
        actions: "Actions",
      },
      status_template: {
        active: "Actif",
        inactive: "Inactif",
        draft: "Brouillon",
        on_hold: "En attente",
        paused: "En pause",
        cancelled: "Annulé",
      },
    },
    boards: {
      title: "Tableau de bord",
      description: "Créez un tableau de bord pour visualiser vos données",
      add: "Créer un bord",
      name: "Nom du bord",
      layout: {
        welcome: "Bienvenue dans votre tableau de bord",
        empty: "Il n'y a rien ici. Commencez par créer un graphique.",
        add_chart: "Créer un graphique",
        title: "Disposition",
        description: "Choisissez la disposition de votre tableau de bord",
        preview_text:
          "Voir comment ce tableau de bord ressemble sur différents appareils. Vous pouvez modifier la disposition sur chaque appareil ici.",
        edit: "Modifier",
        save: "Enregistrer",
        cancel: "Annuler",
        screen_size: {
          xxxl: "4K",
          xxl: "2K",
          xl: "Grand écran",
          lg: "Ordinateur de bureau",
          md: "Ordinateur portable",
          sm: "Tablette",
          xs: "Téléphone",
        },
      },
      modals:{
        filterChangeChartType: {
          title: "Changer le type de graphique",
          description:
            "Changer le type de graphique réinitialisera tous les filtres appliqués. Voulez-vous continuer ?",
          filter: "Changer les filtres",
          standard: "Standard",
          age: "Âge",
          gender: "Genre",
          visualization: "Visualisation",
          sortResponses: "Trier par réponses",
          sortResponsesDescription:
            "Trier les réponses dans l'ordre croissant ou décroissant",
        },
      }
    },
    permissions: {
      title: "Permissions de la mission",
      description:
        'Gérez qui peut accéder à "{missionName}". Par défaut, les missions sont publiques.',
      success: "Permissions mises à jour avec succès",
      save: "Enregistrer les permissions",
      saving: "Enregistrement...",
      visibility: {
        label: "Visibilité",
        public: "Public",
        private: "Privé ({count})",
        publicDescription: "Accessible à tous les membres",
        privateDescription: "Accès restreint aux personnes sélectionnées",
      },
      authorizedUsers: {
        label: "Personnes autorisées",
        add: "Ajouter",
        empty: {
          title: "Aucune personne autorisée",
          description: "Ajoutez des personnes pour leur donner accès",
        },
      },
      search: {
        placeholder: "Rechercher une personne...",
        noResults: "Aucune personne trouvée.",
        allAdded: "Tous les utilisateurs sont déjà ajoutés.",
      },
      filters: {
        allRoles: "Tous les rôles",
      },
      selection: {
        count: "{count} personne(s) sélectionnée(s)",
        addAll: "Ajouter tout",
        selectAll: "Sélectionner tout",
        deselectAll: "Désélectionner tout",
      },
      loading: {
        users: "Chargement des utilisateurs...",
      },
      publicInfo: {
        title: "Mission publique",
        description:
          "Tous les membres de l'organisation peuvent accéder à cette mission",
      },
      errors: {
        loadUsers: "Impossible de charger les utilisateurs",
        update: "Erreur lors de la mise à jour des permissions",
      },
    },
  },
  analysis:{
    title: "Analyse des données",
    subtitle: "Explorez et analysez vos données collectées",
  },
  filters: {
    groups: {
      personal_info: {
        label: "Informations Personnelles",
        filters: {
          gender: { label: "Genre" },
          age: { label: "Âge" },
          marital_status: { label: "Situation matrimoniale" },
          has_children: { label: "Enfants" },
          nationality: { label: "Nationalité" },
        },
      },
      location: {
        label: "Localisation",
        filters: {
          country: { label: "Pays de résidence" },
          city: { label: "Ville" },
          neighborhood: { label: "Quartier" },
          residential_density: { label: "Densité du quartier" },
          area_type: { label: "Type de zone" },
          residence_duration: { label: "Durée de résidence" },
        },
      },
      demographics: {
        label: "Démographiques",
        filters: {
          education: { label: "Niveau d'éducation" },
          diploma: { label: "Diplôme" },
          languages: { label: "Langues parlées" },
          religion: { label: "Religion" },
          ethnicity: { label: "Ethnicité" },
        },
      },
      professional: {
        label: "Données Professionnelles",
        filters: {
          sector: { label: "Secteur d'activité" },
          professional_status: { label: "Statut professionnel" },
          work_time: { label: "Temps de travail" },
          work_experience: { label: "Expérience professionnelle" },
          work_environment: { label: "Environnement de travail" },
        },
      },
      financial: {
        label: "Données Financières",
        filters: {
          income: { label: "Revenu mensuel" },
          income_source: { label: "Source de revenu" },
          bank_account: { label: "Compte bancaire" },
          mobile_money: { label: "Mobile Money" },
          budget_sufficiency: { label: "Budget suffisant" },
        },
      },
      equipment: {
        label: "Équipement et Connectivité",
        filters: {
          phone_type: { label: "Type de téléphone" },
          has_computer: { label: "Possède un ordinateur" },
          internet_connection: { label: "Connexion Internet" },
          internet_provider: { label: "Fournisseur Internet" },
          connected_devices: { label: "Objets connectés" },
        },
      },
      consumption: {
        label: "Consommation",
        filters: {
          shopping_frequency: { label: "Fréquence d'achats alimentaires" },
          shopping_location: { label: "Lieu d'achats" },
          online_shopping: { label: "Achats en ligne" },
          brand_loyalty: { label: "Fidélité aux marques" },
          purchase_motivation: { label: "Motivation d'achat" },
        },
      },
      lifestyle: {
        label: "Mode de Vie",
        filters: {
          transport_mode: { label: "Mode de transport" },
          housing: { label: "Type de logement" },
          housing_status: { label: "Statut d'habitation" },
          sport: { label: "Pratique sportive" },
          travel: { label: "Voyage" },
        },
      },
      media: {
        label: "Médias et Communication",
        filters: {
          social_media: {
            label: "Réseaux sociaux",
          },
          social_media_time: {
            label: "Temps sur réseaux sociaux",
          },
          communication_means: {
            label: "Moyen de communication",
          },
          entertainment: {
            label: "Divertissement",
          },
          streaming: {
            label: "Plateforme de streaming",
          },
        },
      },
      animals: {
        label: "Animaux et Vie Domestique",
        filters: {
          pet_types: {
            label: "Types d'animaux possédés",
          },
          pet_count: {
            label: "Nombre d'animaux",
          },
          pet_food_location: {
            label: "Lieu de nourrissage",
          },
          vet_frequency: {
            label: "Fréquence des visites vétérinaires",
          },
          pet_expenses: {
            label: "Dépenses mensuelles principales",
          },
          pet_specialized_products: {
            label: "Produits spécialisés utilisés",
          },
          pet_food_behavior: {
            label: "Comportement alimentaire",
          },
          pet_training: {
            label: "Formation pour soins",
          },
          pet_cleanliness: {
            label: "Gestion de la propreté",
          },
        },
      },
      social_engagement: {
        label: "Engagement Social",
        filters: {
          volunteering: {
            label: "Participation au bénévolat",
          },
          organization_member: {
            label: "Membre d'organisation",
          },
          supported_causes: {
            label: "Causes soutenues",
          },
          charity_events: {
            label: "Participation à événements caritatifs",
          },
          regular_donations: {
            label: "Dons réguliers",
          },
          volunteering_frequency: {
            label: "Fréquence d'actions bénévoles",
          },
          fundraising_organization: {
            label: "Organisation de collectes",
          },
          social_impact_consumption: {
            label: "Impact sur consommation",
          },
          social_platforms: {
            label: "Plateformes d'engagement",
          },
        },
      },
      environment: {
        label: "Environnement et Durabilité",
        filters: {
          waste_sorting: {
            label: "Tri des déchets",
          },
          eco_products: {
            label: "Produits écologiques",
          },
          green_space: {
            label: "Espace vert",
          },
          reusable_products: {
            label: "Produits réutilisables",
          },
          energy_saving: {
            label: "Équipements économes",
          },
          sustainable_transport: {
            label: "Transport durable",
          },
          local_food: {
            label: "Produits locaux et de saison",
          },
          composting: {
            label: "Compostage",
          },
          public_space_cleaning: {
            label: "Nettoyage des espaces publics",
          },
          packaging_awareness: {
            label: "Attention aux emballages",
          },
        },
      },
      lifestyle_routines: {
        label: "Mode de Vie et Routines",
        filters: {
          morning_routine: {
            label: "Routine matinale",
          },
          evening_routine: {
            label: "Routine du soir",
          },
          regular_exercise: {
            label: "Exercice régulier",
          },
          exercise_type: {
            label: "Type d'exercice",
          },
          exercise_time: {
            label: "Temps d'exercice hebdomadaire",
          },
          diet: {
            label: "Régime alimentaire",
          },
          motivation_source: {
            label: "Source de motivation",
          },
          productivity_habits: {
            label: "Habitudes de productivité",
          },
          health_tracking: {
            label: "Suivi de santé",
          },
          work_life_balance: {
            label: "Équilibre vie pro/perso",
          },
        },
      },
      trends_innovation: {
        label: "Réactions aux Tendances et Innovations",
        filters: {
          trends_information: {
            label: "Source d'information sur les tendances",
          },
          latest_innovation: {
            label: "Dernière innovation adoptée",
          },
          latest_products: {
            label: "Achat de produits dernier cri",
          },
          trend_reaction: {
            label: "Réaction face aux tendances",
          },
          influencer_following: {
            label: "Suivi d'influenceurs",
          },
          regretted_trend: {
            label: "Tendance regrettée",
          },
          innovation_testing: {
            label: "Test de produits innovants",
          },
          tech_impact_consumption: {
            label: "Impact technologique sur consommation",
          },
          current_trend_interest: {
            label: "Tendance actuelle intrigante",
          },
          innovation_participation: {
            label: "Participation à projets innovants",
          },
        },
      },
    },
    options: {
      gender: {
        male: "Homme",
        female: "Femme",
        other: "Autre",
        prefer_not_to_say: "Préfère ne pas le dire",
      },
      marital_status: {
        single: "Célibataire",
        married: "Marié",
        divorced: "Divorcé",
        widowed: "Veuf/Veuve",
        separated: "Séparé",
      },
      age: {
        years_18_24: "18-24",
        years_25_34: "25-34 ",
        years_35_44: "35-44 ",
        years_45_54: "45-54 ",
        years_55_plus: "55+ ",
      },
      has_children: {
        no_children: "Pas d'enfants",
        child_1: "1 enfant",
        children_2: "2 enfants",
        children_3_plus: "3 enfants ou plus",
      },
      nationality: {
        ivory_coast: "Côte d'Ivoire",
        senegal: "Sénégal",
        cameroon: "Cameroun",
        morocco: "Maroc",
        tunisia: "Tunisie",
        algeria: "Algérie",
        nigeria: "Nigéria",
        ghana: "Ghana",
        other_africa: "Autre pays africain",
        other: "Autre pays",
      },
      country: {
        ivory_coast: "Côte d'Ivoire",
        senegal: "Sénégal",
        cameroon: "Cameroun",
        nigeria: "Nigéria",
        ghana: "Ghana",
        morocco: "Maroc",
        tunisia: "Tunisie",
        algeria: "Algérie",
        other_africa: "Autre pays africain",
        other: "Autre pays",
        europe: "Europe",
        north_america: "Amérique du Nord",
        south_america: "Amérique du Sud",
        asia: "Asie",
        oceania: "Océanie",
      },
      city: {
        abidjan: "Abidjan",
        dakar: "Dakar",
        yaounde: "Yaoundé",
        lagos: "Lagos",
        douala: "Douala",
        accra: "Accra",
        casablanca: "Casablanca",
        tunis: "Tunis",
        other: "Autre ville",
      },
      residential_density: {
        high: "Elevée",
        medium: "Moyenne",
        low: "Faible",
      },
      area_type: {
        urban: "Urbain",
        suburban: "Suburbain",
        rural: "Rural",
      },
      residence_duration: {
        less_than_1: "Moins d'un an",
        y_1_to_3: "1-3 ans",
        y_3_to_5: "3-5 ans",
        more_than_5: "Plus de 5 ans",
      },
      education: {
        primary: "Primaire",
        secondary: "Secondaire",
        bachelor: "Licence",
        higher: "Enseignement supérieur",
        autodidact: "Autodidacte",
      },
      diploma: {
        bepc: "BEPC",
        bac: "Baccalauréat",
        bachelor: "Licence",
        master: "Master",
        phd: "Doctorat",
        other: "Autre",
      },
      languages: {
        french: "Français",
        english: "Anglais",
        arabic: "Arabe",
        ethnic_language: "Langues ethniques",
        other: "Autre",
      },
      religion: {
        christianity: "Christianisme",
        islam: "Islam",
        traditional: "Croyances traditionnelles",
        other: "Autre",
        none: "Aucune",
        animism: "Animisme",
      },
      ethnicity: {
        akan: "Akan",
        krou: "Krou",
        mande: "Mandé",
        peul: "Peul",
        wolof: "Wolof",
        berbere: "Berbère",
        arab: "Arabe",
        other: "Autre",
      },
      professional: {
        sector: {
          commerce: "Commerce",
          education: "Education",
          health: "Santé",
          transport : "Transport",
          technology: "Technologie",
          other: "Autre",
        },
        professional_status: {
          employee: "Employé",
          independent: "Indépendant",
          employed: "Employé",
          unemployed: "Sans emploi",
          student: "Étudiant",
          freelancer: "Indépendant",
          retired: "Retraité",
          other: "Autre",
        },
        work_time: {
          full_time: "Temps plein",
          part_time: "Temps partiel",
          freelance: "Indépendant",
          internship: "Stage",
          other: "Autre",
        },
        work_experience: {
          less_than_1: "Moins d'un an",
          y_1_to_3: "1-3 ans",
          y_3_to_5: "3-5 ans",
          more_than_5: "Plus de 5 ans",
        },
        work_environment: {
          office: "Bureau",
          remote: "À distance",
          hybrid: "Hybride",
          field: "Travail sur le terrain",
          other: "Autre", 
        },
      },
      financial:{
        income: {
          less_than_50k: "Moins de 50k",
          m_to_200k: "50k - 200k",
          m_to_500k: "200k - 500k",
          more_than_500k: "Plus de 500k",
        },
        income_source: {
          salary: "Salaire",
          commerce: "Commerce",
          freelance: "Indépendant",
          savings: "Économies",
          business: "Entreprise",
          agriculture: "Agriculture",
          remittances: "Envois de fonds",
          other: "Autre",
        },
        bank_account: {
          yes: "Oui",
          no: "Non",
        },
        mobile_money: {
          orange_money: "Orange Money",
          mtn_money: "MTN Mobile Money",
          moov_money: "Moov Money",
          wave: "Wave",
          free_money: "Free Money",
          yup: "Yup",
          other: "Autre",
          none: "Aucun",
        },
        budget_sufficiency: {
          always: "Toujours suffisant",
          often: "Souvent suffisant",
          sometimes: "Parfois suffisant",
          rarely: "Rarement suffisant",
          never: "Jamais suffisant",
        }
      },
      equipment: {
        phone_type: {
          android: "Android",
          iphone: "iPhone",
          other: "Autre",
        },
        has_computer: {
          yes: "Oui",
          no: "Non",
        },
        internet_connection: {
          home: "Domicile",
          mobile: "Mobile",
          both: "Les deux",
          none: "Aucun",
        },
        internet_provider: {
          orange: "Orange",
          mtn: "MTN",
          moov: "Moov",
          free: "Free",
          other: "Autre",
        },
        connected_devices: {
          smartphone: "Smartphone",
          computer: "Ordinateur",
          smartwatch: "Montre intelligente",
          smart_tv: "Smart TV",
          home_automation: "Domotique",
          other: "Autre",
          none: "Aucun",
        },
      },
      consumption: {
        shopping_frequency: {
          daily: "Quotidien",
          weekly: "Hebdomadaire",
          bi_weekly: "Bi-hebdomadaire",
          monthly: "Mensuel",
          less: "Moins souvent",
        },
        shopping_location: {
          market: "Marché",
          supermarket: "Supermarché",
          local_shop: "Magasin local",
          online: "En ligne",
          other: "Autre",
        },
        online_shopping: {
          frequently: "Fréquemment",
          regular: "Régulièrement",
          occasional: "Occasionnellement",
          rarely: "Rarement",
          never: "Jamais",
        },
        brand_loyalty: {
          very_loyal: "Très fidèle",
          somewhat_loyal: "Assez fidèle",
          not_loyal: "Pas fidèle",
        },
        purchase_motivation: {
          price: "Prix",
          quality: "Qualité",
          reviews: "Avis",
          advertising: "Publicité",
          availability: "Disponibilité",
          recommendations: "Recommandations",
          brand: "Marque",
          sustainability: "Durabilité",
          convenience: "Commodité",
          other: "Autre",
        },
      },
      lifestyle: {
        transport_mode: {
          public_transport: "Transport public",
          personal_vehicle: "Véhicule personnel",
          motorcycle: "Moto",
          vtc: "VTC",
          walking: "Marche",
        },
        housing: {
          apartment: "Appartement",
          house: "Maison",
          shared: "Logement partagé",
          studio: "Studio",
          villa: "Villa",
          other: "Autre",
        },
        housing_status: {
          own: "Propriétaire",
          rent: "Locataire",
          free: "Gratuit",
          colocation: "Colocation",
        },
        sport: {
          regular: "Régulièrement",
          occasional: "Occasionnellement",
          rarely: "Rarement",
          never: "Jamais",
        },
        travel: {
          frequent: "Fréquent",
          occasional: "Occasionnel",
          rare: "Rare",
          never: "Jamais",
        }
      },
      media: {
        social_media: {
          facebook: "Facebook",
          instagram: "Instagram",
          twitter: "Twitter",
          tiktok: "TikTok",
          linkedin: "LinkedIn",
          snapchat: "Snapchat",
          other: "Autre",
          youtube: "YouTube",
          whatsapp: "WhatsApp",
        },
        social_media_time: {
          less_than_30min: "Moins de 30 minutes",
          time_to_1h: "30 minutes à 1 heure",
          time_to_2h: "1 à 2 heures",
          more_than_2h: "Plus de 2 heures",
        },
        communication_means: {
          calls: "Appels",
          sms: "SMS",
          whatsapp: "WhatsApp",
          email: "Email",
          social_media: "Réseaux sociaux",
          messenger: "Messenger",
        },
        entertainment: {
          music: "Musique",
          movies: "Films",
          series: "éries",
          gaming: "Jeux",
          videos: "Vidéos",
          video_games: "Jeux vidéo",
          shows: "Spectacles",
        },
        streaming: {
          netflix: "Netflix",
          spotify: "Spotify",
          disney: "Disney+",
          amazon: "Amazon Prime",
          youtube: "YouTube",
          other: "Autre",
          none: "Aucun",
        }
      },
      animals: {
        pet_types: {
          dog: "Chien",
          cat: "Chat",
          bird: "Oiseau",
          fish: "Poisson",
          reptile: "Reptile",
          small_mammal: "Petit mammifère",
          other: "Autre",
          none: "Aucun",
        },
        pet_count: {
          one_1: "un",
          two_2: "deux",
          three_3: "trois",
          four_plus_4: "quatre ou plus",
        },
        pet_food_location: {
          home: "À la maison",
          outside: "À l'extérieur",
          both: "Les deux",
          other: "Autre",
        },
        vet_frequency: {
          monthly: "Mensuel",
          quarterly: "Trimestriel",
          biannual: "Semestriel",
          annual: "Annuel",
          rarely: "Rarement",
          as_needed: "Au besoin",
        },
        pet_expenses: {
          food: "Nourriture",
          healthcare: "Soins de santé",
          care: "Produits de soin",
          accessories: "Accessoires",
          training: "Formation",
          other: "Autre",
        },
        pet_specialized_products: {
          shampoo: "Shampooing spécialisé",
          brushes: "Brosses",
          toys: "Jouets",
          other: "Autre",
          none: "Aucun",
        },
        pet_food_behavior: {
          scheduled: "Alimentation programmée",
          industrial: "Produits industriels",
          homemade: "Nourriture maison",
          mixed: "Alimentation mixte",
        },
        pet_training: {
          yes: "Oui",
          no: "Non",
        },
        pet_cleanliness: {
          regular_care: "Soins réguliers",
          occasional: "Soins occasionnels",
          rarely: "Soins rares",
          toilet: "Propre",
          other: "Autre",
        },
      },
      social_engagement: {
        volunteering: {
          yes: "Oui",
          no: "Non",
        },
        organization_member: {
          yes: "Oui",
          no: "Non",
        },
        supported_causes: {
          education: "Éducation",
          health: "Santé",
          environment: "Environnement",
          human_rights: "Droits de l'homme",
          other: "Autre",
          none: "Aucun",
        },
        charity_events: {
          yes: "Oui",
          no: "Non",
        },
        regular_donations: {
          yes: "Oui",
          no: "Non",
        },
        volunteering_frequency: {
          weekly: "Hebdomadaire",
          monthly: "Mensuel",
          quarterly: "Trimestriel",
          annual: "Annuel",
          rarely: "Rarement",
        },
        fundraising_organization: {
          yes: "Oui",
          no: "Non",
        },
        social_impact_consumption: {
          yes: "Oui",
          no: "Non",
        },
        social_platforms: {
          social_media: "Réseaux sociaux",
          forums: "Forums",
          other: "Autre",
          none: "Aucun",
        },
      },
      environment: {
        waste_sorting: {
          yes: "Oui",
          no: "Non",
        },
        eco_products: {
          yes: "Oui",
          no: "Non",
        },
        green_space: {
          yes: "Oui",
          no: "Non",
        },
        reusable_products: {
          yes: "Oui",
          no: "Non",
        },
        energy_saving: {
          solar_panels: "Panneaux solaires",
          led: "Ampoules LED",
          other: "Autre",
          none: "Aucun",
        },
        sustainable_transport: {
          bike: "Vélo",
          carpooling: "Covoiturage",
          public_transport: "Transport public",
        },
        local_food: {
          yes: "Oui",
          no: "Non",
        },
        composting: {
          yes: "Oui",
          no: "Non",
        },
        public_space_cleaning: {
          never: "Jamais",
          monthly: "Mensuel",
          multiple_monthly: "Plusieurs fois par mois",
        },
        packaging_awareness: {
          yes: "Oui",
          no: "Non",
        },
      },
      lifestyle_routines: {
        morning_routine: {
          early_riser: "Lève-tôt",
          late_riser: "Lève-tard",
          breakfast: "Petit-déjeuner",
          exercise: "Exercice",
        },
        evening_routine: {
          early_bedtime: "Coucher tôt",
          late_bedtime: "Coucher tard",
          relaxation: "Relaxation",
          preparation: "Préparation pour le lendemain",
        },
        regular_exercise: {
          yes: "Oui",
          no: "Non",
        },
        exercise_type: {
          running: "Footing",
          weight_training: "Musculation",
          yoga: "Yoga",
          other: "Autre",
        },
        exercise_time: {
          less_than_1h: "Moins d'une heure",
          t3h: "1-3 heures",
          t5h: "3-5 heures",
          more_than_5h: "Plus de 5 heures",
        },
        diet: {
          balanced: "Équilibré",
          vegetarian: "Végétarien",
          vegan: "Végétalien",
          omnivore: "Omnivore",
          other: "Autre",
        },
        motivation_source: {
          health: "Santé",
          appearance: "Apparence",
          wellbeing: "Bien-être",
          other: "Autre",
        },
        productivity_habits: {
          planning: "Planning",
          todo_list: "Listes de tâches",
          breaks: "Pauses régulières",
          meditation: "Méditation",
          other: "Autre",
        },
        health_tracking: {
          apps: "Applications",
          wearables: "Wearables",
          manual: "Manual Tracking",
          consultations: "Regular Consultations",
          none: "None",
        },
        work_life_balance: {
          good: "Bon",
          average: "Moyen",
          poor: "Mauvais",
          fair: "Passable",
          excellent: "Excellent",
        },
      },
      trends_innovation: {
        trends_information: {
          social_media: "Réseaux sociaux",
          blogs: "Blogs",
          podcasts: "Podcasts",
          events: "Événements",
          other: "Autre",
        },
        latest_innovation: {
          gadgets: "Gadgets",
          apps: "Applications",
          services: "Services",
          other: "Autre",
          none: "Aucun",
        },
        latest_products: {
          yes: "Oui",
          no: "Non",
        },
        trend_reaction: {
          immediate: "Adoptant immédiat",
          wait: "Attendre et voir",
          ignore: "Ignorer",
        },
        influencer_following: {
          yes: "Oui",
          no: "Non",
        },
        regretted_trend: {
          products: "Produits",
          fashion: "Mode",
          technology: "Technologie",
          other: "Autre",
          none: "Aucun",
        },
        innovation_testing: {
          yes: "Oui",
          no: "Non",
        },
        tech_impact_consumption: {
          yes: "Oui",
          no: "Non",
        },
        current_trend_interest: {
          fashion: "Mode",
          technology: "Technologie",
          lifestyle: "Style de vie",
          health: "Santé",
          other: "Autre",
        },
        innovation_participation: {
          yes: "Oui",
          no: "Non",
        },
      },
    }
  },
} as const;
