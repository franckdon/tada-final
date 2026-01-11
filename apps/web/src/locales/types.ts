export interface TranslationKeys {
  auth: {
    signup: {
      verifyEmail: string;
      verifyEmailDescription: string;
    };
    verifyEmail: {
      title: string;
      description: string;
      checkEmail: string;
      resendLink: string;
      backToSignIn: string;
      createAnotherAccount: string;
    };
  };
  filters: {
    groups: {
      personal_info: {
        label: string;
        filters: {
          gender: { label: string };
          age: { label: string };
          marital_status: { label: string };
          has_children: { label: string };
          nationality: { label: string };
        };
      };
      location: {
        label: string;
        filters: {
          country: { label: string };
          city: { label: string };
          neighborhood: { label: string };
          residential_density: { label: string };
          area_type: { label: string };
          residence_duration: { label: string };
        };
      };
      demographics: {
        label: string;
        filters: {
          education: { label: string };
          diploma: { label: string };
          languages: { label: string };
          religion: { label: string };
          ethnicity: { label: string };
        };
      };
      professional: {
        label: string;
        filters: {
          sector: { label: string };
          professional_status: { label: string };
          work_time: { label: string };
          work_experience: { label: string };
          work_environment: { label: string };
        };
      };
      financial: {
        label: string;
        filters: {
          income: { label: string };
          income_source: { label: string };
          bank_account: { label: string };
          mobile_money: { label: string };
          budget_sufficiency: { label: string };
        };
      };
      equipment: {
        label: string;
        filters: {
          phone_type: { label: string };
          has_computer: { label: string };
          internet_connection: { label: string };
          internet_provider: { label: string };
          connected_devices: { label: string };
        };
      };
      consumption: {
        label: string;
        filters: {
          shopping_frequency: { label: string };
          shopping_location: { label: string };
          online_shopping: { label: string };
          brand_loyalty: { label: string };
          purchase_motivation: { label: string };
        };
      };
      lifestyle: {
        label: string;
        filters: {
          transport_mode: { label: string };
          housing: { label: string };
          housing_status: { label: string };
          sport: { label: string };
          travel: { label: string };
        };
      };
      media: {
        label: string;
        filters: {
          social_media: { label: string };
          social_media_time: { label: string };
          communication_means: { label: string };
          entertainment: { label: string };
          streaming: { label: string };
        };
      };
      animals: {
        label: string;
        filters: {
          pet_types: { label: string };
          pet_count: { label: string };
          pet_food_location: { label: string };
          vet_frequency: { label: string };
          pet_expenses: { label: string };
          pet_specialized_products: { label: string };
          pet_food_behavior: { label: string };
          pet_training: { label: string };
          pet_cleanliness: { label: string };
        };
      };
      social_engagement: {
        label: string;
        filters: {
          volunteering: { label: string };
          organization_member: { label: string };
          supported_causes: { label: string };
          charity_events: { label: string };
          regular_donations: { label: string };
          volunteering_frequency: { label: string };
          fundraising_organization: { label: string };
          social_impact_consumption: { label: string };
          social_platforms: { label: string };
        };
      };
      environment: {
        label: string;
        filters: {
          waste_sorting: { label: string };
          eco_products: { label: string };
          green_space: { label: string };
          reusable_products: { label: string };
          energy_saving: { label: string };
          sustainable_transport: { label: string };
          local_food: { label: string };
          composting: { label: string };
          public_space_cleaning: { label: string };
          packaging_awareness: { label: string };
        };
      };
      lifestyle_routines: {
        label: string;
        filters: {
          morning_routine: { label: string };
          evening_routine: { label: string };
          regular_exercise: { label: string };
          exercise_type: { label: string };
          exercise_time: { label: string };
          diet: { label: string };
          motivation_source: { label: string };
          productivity_habits: { label: string };
          health_tracking: { label: string };
          work_life_balance: { label: string };
        };
      };
      trends_innovation: {
        label: string;
        filters: {
          trends_information: { label: string };
          latest_innovation: { label: string };
          latest_products: { label: string };
          trend_reaction: { label: string };
          influencer_following: { label: string };
          regretted_trend: { label: string };
          innovation_testing: { label: string };
          tech_impact_consumption: { label: string };
          current_trend_interest: { label: string };
          innovation_participation: { label: string };
        };
      };
    };
  };
  surveys: {
    title: string;
    publishSurvey: string;
    published: string;
    publishedDescription: string;
    publishedError: string;
    publishedErrorDescription: string;
    addNewQuestion: {
      title: string;
      searchPlaceholder: string;
      backToTypes: string;
      questionType: string;
      questionText: string;
      questionPlaceholder: string;
      options: string;
      addOption: string;
      ratingOptions: string;
      minRating: string;
      maxRating: string;
      displayAsStars: string;
      required: string;
    };
    questionTypes: {
      text: {
        title: string;
        description: string;
      };
      comment: {
        title: string;
        description: string;
      };
      checkbox: {
        title: string;
        description: string;
      };
      radiogroup: {
        title: string;
        description: string;
      };
      dropdown: {
        title: string;
        description: string;
      };
      boolean: {
        title: string;
        description: string;
      };
      ranking: {
        title: string;
        description: string;
      };
      rating: {
        title: string;
        description: string;
      };
      imagepicker: {
        title: string;
        description: string;
      };
      file: {
        title: string;
        description: string;
      };
      date: {
        title: string;
        description: string;
      };
      datetime: {
        title: string;
        description: string;
      };
      email: {
        title: string;
        description: string;
      };
      number: {
        title: string;
        description: string;
      };
      phone: {
        title: string;
        description: string;
      };
      expression: {
        title: string;
        description: string;
      };
      image: {
        title: string;
        description: string;
      };
      address: {
        title: string;
        description: string;
      };
      multipletext: {
        title: string;
        description: string;
      };
      slider: {
        title: string;
        description: string;
      };
      nps: {
        title: string;
        description: string;
      };
    };
  };
}
