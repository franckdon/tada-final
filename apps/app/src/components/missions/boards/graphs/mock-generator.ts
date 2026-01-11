import { SurveyData } from "@/lib/utils";

export const responses: SurveyData = {
  survey_title: "Étude de marché sur la marque d'eau Awa à Abidjan",
  questions_responses: {
    "À quelle fréquence achetez-vous de l'eau embouteillée ?": {
      type: "dropdown",
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer: "Souvent",
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer: "Toujours",
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer: "Parfois",
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer: "Souvent",
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer: "Rarement",
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer: "Toujours",
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: "Parfois",
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer: "Souvent",
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer: "Toujours",
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer: "Parfois",
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: "Jamais",
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer: "Toujours",
        },
      ],
    },
    "Quel est votre nom ?": {
      type: "text",
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer: "Koffi Adjé",
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer: "Aminata Traoré",
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer: "Ibrahim Coulibaly",
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer: "Fatou Koné",
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer: "Ousmane Diabaté",
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer: "Mariam Bamba",
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: "Seydou Sanogo",
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer: "Aissata Ouattara",
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer: "Konan Yao",
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer: "Nafissatou Doumbia",
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: "Abdoulaye Cissé",
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer: "Salimata Keita",
        },
      ],
    },

    "Quelles marques d'eau embouteillée préférez-vous ?": {
      type: "checkbox",
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer: ["Awa", "Marque B"],
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer: ["Marque C", "Awa"],
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer: ["Awa"],
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer: ["Awa", "Marque D"],
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer: ["Marque B", "Autre"],
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer: ["Awa", "Marque C"],
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: ["Awa"],
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer: ["Marque B", "Awa"],
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer: ["Awa"],
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer: ["Marque C", "Awa"],
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: ["Autre"],
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer: ["Awa", "Marque D"],
        },
      ],
    },
    "Pourquoi préférez-vous ces marques ?": {
      type: "comment",
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer:
            "La qualité de l'eau Awa est excellente et le goût est pur. Les prix sont aussi abordables.",
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer:
            "J'achète selon la disponibilité et le prix. Awa est souvent moins chère.",
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer:
            "Awa est une marque locale que je fais confiance, et le rapport qualité-prix est bon.",
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer:
            "Awa est disponible partout à Yopougon et le prix est correct.",
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer:
            "Je préfère l'eau du robinet filtrée, mais quand j'achète c'est selon ce qui est disponible.",
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer:
            "Awa a un goût naturel et est produite localement, c'est important pour moi.",
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: "Prix abordable et qualité correcte.",
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer:
            "J'alterne entre les marques selon les promotions et la disponibilité.",
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer:
            "Awa est la marque la plus répandue dans notre quartier et elle est de bonne qualité.",
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer:
            "Je choisis selon la qualité et les recommandations des autres.",
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: "Je préfère filtrer l'eau du robinet à la maison.",
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer:
            "Awa est fiable et toujours fraîche. Marque D a un bon packaging.",
        },
      ],
    },
    "Connaissez-vous la marque Awa ?": {
      type: "boolean",
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer: true,
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer: true,
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer: true,
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer: true,
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer: true,
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer: true,
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: true,
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer: true,
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer: true,
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer: true,
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: false,
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer: true,
        },
      ],
    },
    "Pensez-vous que la marque Awa est facilement accessible ?": {
      type: "boolean",
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer: true,
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer: true,
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer: false,
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer: true,
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer: true,
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer: true,
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: false,
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer: true,
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer: true,
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer: true,
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: true,
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer: true,
        },
      ],
    },
    "Quel est votre avis sur les marques concurrentes d'Awa ?": {
      type: "comment",
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer:
            "Les autres marques sont correctes mais Awa reste ma préférée pour sa pureté.",
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer: "Marque C a une bonne réputation mais est plus chère qu'Awa.",
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer:
            "Les marques étrangères sont chères pour nous les Ivoiriens ordinaires.",
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer:
            "Marque D est bien mais plus chère, Awa reste le meilleur choix.",
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer: "Toutes les marques se valent selon moi.",
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer:
            "Les marques importées sont bonnes mais Awa me convient mieux.",
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: "Peu de différence entre les marques au niveau du goût.",
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer: "Marque B a une bonne campagne publicitaire.",
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer: "Les autres marques sont moins disponibles à Abobo.",
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer:
            "Marque C est premium mais Awa offre un bon rapport qualité-prix.",
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: "Je ne connais pas vraiment les marques d'eau embouteillée.",
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer:
            "Marque D est bien mais plus chère, les autres sont correctes.",
        },
      ],
    },
    "Comment évaluez-vous la qualité des produits Awa ?": {
      type: "rating",
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer: 5,
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer: 4,
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer: 4,
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer: 4,
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer: 3,
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer: 5,
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: 3,
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer: 4,
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer: 4,
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer: 4,
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: 3,
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer: 5,
        },
      ],
    },
    "Comment évaluez-vous la qualité des produits des concurrents ?": {
      type: "rating",
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer: 3,
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer: 4,
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer: 3,
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer: 3,
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer: 3,
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer: 4,
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: 3,
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer: 4,
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer: 2,
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer: 5,
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: 3,
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer: 4,
        },
      ],
    },
    "Avez-vous des suggestions pour améliorer la marque Awa ?": {
      type: "comment",
      isRequired: false,
      responses: [
        {
          response_id: "001",
          location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
          age: "28",
          sex: "male",
          answer: "Peut-être diversifier les formats de bouteilles",
        },
        {
          response_id: "002",
          location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
          age: "35",
          sex: "female",
          answer: "Améliorer la distribution dans certains quartiers",
        },
        {
          response_id: "003",
          location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
          age: "42",
          sex: "male",
          answer: "Plus de points de vente à Adjamé",
        },
        {
          response_id: "004",
          location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
          age: "25",
          sex: "female",
          answer: "Organiser plus de promotions",
        },
        {
          response_id: "005",
          location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
          age: "31",
          sex: "male",
          answer: "Sensibiliser sur les bienfaits de l'eau embouteillée",
        },
        {
          response_id: "006",
          location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
          age: "29",
          sex: "female",
          answer: "Continuer à maintenir la qualité",
        },
        {
          response_id: "007",
          location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
          age: "38",
          sex: "male",
          answer: "Améliorer la distribution à Koumassi",
        },
        {
          response_id: "008",
          location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
          age: "26",
          sex: "female",
          answer: "Plus de publicité pour Awa",
        },
        {
          response_id: "009",
          location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
          age: "33",
          sex: "male",
          answer: "Maintenir les prix actuels",
        },
        {
          response_id: "010",
          location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
          age: "40",
          sex: "female",
          answer: "Améliorer l'emballage pour le rendre plus attractif",
        },
        {
          response_id: "011",
          location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
          age: "45",
          sex: "male",
          answer: "Éduquer sur les avantages de l'eau embouteillée",
        },
        {
          response_id: "012",
          location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
          age: "27",
          sex: "female",
          answer: "Garder la qualité actuelle",
        },
      ],
    },
    "Veuillez télécharger des photos des points de vente que vous avez visités ainsi que des produits concurrents que vous avez remarqués.":
      {
        type: "file",
        responses: [
          {
            response_id: "001",
            location: { lat: 5.3364, lng: -4.0267, label: "Cocody" },
            age: "28",
            sex: "male",
            answer: "photo_cocody_001.jpg",
          },
          {
            response_id: "002",
            location: { lat: 5.3236, lng: -4.027, label: "Plateau" },
            age: "35",
            sex: "female",
            answer: "photo_plateau_002.jpg",
          },
          {
            response_id: "003",
            location: { lat: 5.3514, lng: -4.0294, label: "Adjamé" },
            age: "42",
            sex: "male",
            answer: "photo_adjame_003.jpg",
          },
          {
            response_id: "004",
            location: { lat: 5.3369, lng: -4.0858, label: "Yopougon" },
            age: "25",
            sex: "female",
            answer: "photo_yopougon_004.jpg",
          },
          {
            response_id: "005",
            location: { lat: 5.3097, lng: -4.0156, label: "Treichville" },
            age: "31",
            sex: "male",
            answer: "photo_treichville_005.jpg",
          },
          {
            response_id: "006",
            location: { lat: 5.2872, lng: -4.0069, label: "Marcory" },
            age: "29",
            sex: "female",
            answer: "photo_marcory_006.jpg",
          },
          {
            response_id: "007",
            location: { lat: 5.2897, lng: -3.9525, label: "Koumassi" },
            age: "38",
            sex: "male",
            answer: "photo_koumassi_007.jpg",
          },
          {
            response_id: "008",
            location: { lat: 5.2458, lng: -3.9606, label: "Port-Bouët" },
            age: "26",
            sex: "female",
            answer: "photo_portbouet_008.jpg",
          },
          {
            response_id: "009",
            location: { lat: 5.4172, lng: -4.0322, label: "Abobo" },
            age: "33",
            sex: "male",
            answer: "photo_abobo_009.jpg",
          },
          {
            response_id: "010",
            location: { lat: 5.3719, lng: -4.0553, label: "Attécoubé" },
            age: "40",
            sex: "female",
            answer: "photo_attecoube_010.jpg",
          },
          {
            response_id: "011",
            location: { lat: 5.3458, lng: -4.0183, label: "Cocody" },
            age: "45",
            sex: "male",
            answer: "photo_cocody_011.jpg",
          },
          {
            response_id: "012",
            location: { lat: 5.3144, lng: -4.0244, label: "Plateau" },
            age: "27",
            sex: "female",
            answer: "photo_plateau_012.jpg",
          },
        ],
      },
  },
  metadata: {
    total_responses: 12,
    collection_period: "2024-01-15 to 2024-01-30",
    locations_covered: [
      "Cocody",
      "Plateau",
      "Adjamé",
      "Yopougon",
      "Treichville",
      "Marcory",
      "Koumassi",
      "Port-Bouët",
      "Abobo",
      "Attécoubé",
    ],
    age_range: "25-45 years",
    gender_distribution: {
      male: 6,
      female: 6,
    },
    response_rate: "100%",
  },
};

export const executiveSummaryMock = `
# Executive Summary - Awa Market Research
## Brand Performance
- **91.7%** brand awareness
- **75%** brand preference
- **66.6%** frequent buyers
- **83.3%** accessibility rating
## Quality & Perception
- **4.1/5** quality score vs **3.4/5** competitors
- Strong in: purity, price-value, availability
- High local brand trust
## Competitive Edge
- Leading quality and accessibility
- Strong distribution network
- Competitive pricing
## Improvement Areas
- Distribution gaps (Adjamé, Koumassi)
- Product diversification
- Marketing & packaging

*Dominant market position with high recognition and loyalty, with clear growth opportunities identified.*`;
function generateRandomSingleChoice(min = 20, max = 100) {
  const labels = ["OUI", "NON", "JE NE SAIS PAS"];
  return labels.map((name) => ({
    name,
    value: Math.floor(Math.random() * (max - min + 1)) + min,
  }));
}

export const singleChoice = generateRandomSingleChoice(100, 1000);

interface ChartConfigItem {
  label: string;
  color: string;
}

export function generateConfigFromObject(
  obj: Record<string, any>
): Record<string, ChartConfigItem> {
  return Object.keys(obj).reduce((acc, key, idx) => {
    acc[key] = {
      label: key,
      color: `hsl(var(--chart-${idx + 1}))`,
    };
    return acc;
  }, {} as Record<string, ChartConfigItem>);
}
