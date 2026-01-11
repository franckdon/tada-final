import { title } from "process";

export interface Solution {
  id: string;
  name: string;
  title: string;
  category?: string;
  industry?: string;
  description: string;
  hero: {
    headline: string;
    subheadline: string;
    image?: string;
    benefits: string[];
    ctaPrimary: string;
    ctaPrimaryLink?: string;
    ctaSecondary: string;
    ctaSecondaryLink?: string;
  };
  features?: {
    title: string;
    subheadline?: string;
    subtitle: string;
    nbrOfItems?: number;
    items: {
      icon: string;
      title: string;
      description: string;
    }[];
  };
  howItWorks?: {
    title: string;
    subtitle: string;
    steps: {
      icon: string;
      title: string;
      subheadline?: string;
      description: string;
    }[];
  };
  zigZag?: {
    title: string;
    items: {
      eyebrow: string;
      title: string;
      description: string;
      buttonLabel: string;
      buttonLink: string;
      image: string;
    }[];
  };
  useCases?: {
    title: string;
    subtitle: string;
    otherSubtitle?: string;
    nbrOfItems?: number;
    cases: {
      icon: string;
      title: string;
      description: string;
      subheadline?: string;
      benefits: string[];
    }[];
  };
  testimonials?: {
    title: string;
    subtitle: string;
    items: {
      name: string;
      role: string;
      company: string;
      image: string;
      content: string;
      rating: number;
    }[];
  };
  questions?: {
    title: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  accordion?: {
    title?: string;
    items?: {
      question: string;
      answer: string;
    }[];
  }
  cta?: {
    title: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
    ctaPrimaryLink?: string;
    ctaSecondaryLink?: string;
  };
}

export const solutions: Solution[] = [
  {
    id: "availability-tracker",
    name: "solutions.availabilityTracker.name",
    title: "solutions.availabilityTracker.title",
    category: "Tracking",
    description: "solutions.availabilityTracker.description",
    hero: {
      headline: "solutions.availabilityTracker.hero.headline",
      subheadline: "solutions.availabilityTracker.hero.subheadline",
      image: "/images/availability-tracker.jpg",
      benefits: [],
      ctaPrimary: "solutions.availabilityTracker.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.availabilityTracker.hero.ctaSecondary",
    },
    features: {
      title: "solutions.availabilityTracker.features.title",
      subheadline: "solutions.availabilityTracker.features.subheadline",
      subtitle: "solutions.availabilityTracker.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.availabilityTracker.features.items.0.title",
          description: "solutions.availabilityTracker.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.availabilityTracker.features.items.1.title",
          description: "solutions.availabilityTracker.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.availabilityTracker.features.items.2.title",
          description: "solutions.availabilityTracker.features.items.2.description",
        },
      ],
    },
    useCases: {
      title: "solutions.availabilityTracker.useCases.title",
      subtitle: "solutions.availabilityTracker.useCases.subtitle",
      otherSubtitle: "solutions.availabilityTracker.useCases.otherSubtitle",
      nbrOfItems: 3,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.availabilityTracker.useCases.cases.0.title",
          subheadline: "solutions.availabilityTracker.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.availabilityTracker.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.availabilityTracker.useCases.cases.1.title",
          subheadline: "solutions.availabilityTracker.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.availabilityTracker.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.availabilityTracker.useCases.cases.2.title",
          subheadline: "solutions.availabilityTracker.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.availabilityTracker.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.availabilityTracker.useCases.cases.3.title",
          subheadline: "solutions.availabilityTracker.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.availabilityTracker.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.availabilityTracker.useCases.cases.4.title",
          subheadline: "solutions.availabilityTracker.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.availabilityTracker.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.availabilityTracker.useCases.cases.5.title",
          subheadline: "solutions.availabilityTracker.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.availabilityTracker.useCases.cases.5.description",
        },
      ],
    },
    cta: {
      title: "solutions.availabilityTracker.cta.title",
      subtitle: "solutions.availabilityTracker.cta.subtitle",
      primaryButton: "solutions.availabilityTracker.cta.primaryButton",
      secondaryButton: "solutions.availabilityTracker.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "rolling-retail-census",
    name: "solutions.rollingRetailCensus.name",
    title: "solutions.rollingRetailCensus.title",
    category: "Tracking",
    description: "solutions.rollingRetailCensus.description",
    hero: {
      headline: "solutions.rollingRetailCensus.hero.headline",
      subheadline: "solutions.rollingRetailCensus.hero.subheadline",
      image: "/images/rolling-retail-census.jpg",
      benefits: [],
      ctaPrimary: "solutions.rollingRetailCensus.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.rollingRetailCensus.hero.ctaSecondary",
    },
    features: {
      title: "solutions.rollingRetailCensus.features.title",
      subheadline: "solutions.rollingRetailCensus.features.subheadline",
      subtitle: "solutions.rollingRetailCensus.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.rollingRetailCensus.features.items.0.title",
          description: "solutions.rollingRetailCensus.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.rollingRetailCensus.features.items.1.title",
          description: "solutions.rollingRetailCensus.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.rollingRetailCensus.features.items.2.title",
          description: "solutions.rollingRetailCensus.features.items.2.description",
        },
      ],
    },
    useCases: {
      title: "solutions.rollingRetailCensus.useCases.title",
      subtitle: "solutions.rollingRetailCensus.useCases.subtitle",
      otherSubtitle: "solutions.rollingRetailCensus.useCases.otherSubtitle",
      nbrOfItems: 2,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.rollingRetailCensus.useCases.cases.0.title",
          subheadline: "solutions.rollingRetailCensus.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.rollingRetailCensus.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.rollingRetailCensus.useCases.cases.1.title",
          subheadline: "solutions.rollingRetailCensus.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.rollingRetailCensus.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.rollingRetailCensus.useCases.cases.2.title",
          subheadline: "solutions.rollingRetailCensus.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.rollingRetailCensus.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.rollingRetailCensus.useCases.cases.3.title",
          subheadline: "solutions.rollingRetailCensus.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.rollingRetailCensus.useCases.cases.3.description",
        },
      ],
    },
    cta: {
      title: "solutions.rollingRetailCensus.cta.title",
      subtitle: "solutions.rollingRetailCensus.cta.subtitle",
      primaryButton: "solutions.rollingRetailCensus.cta.primaryButton",
      secondaryButton: "solutions.rollingRetailCensus.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "ai-qualitative-insights-platform",
    name: "solutions.aiQualitativeInsightsPlatform.name",
    title: "solutions.aiQualitativeInsightsPlatform.title",
    category: "Innovation",
    description: "solutions.aiQualitativeInsightsPlatform.description",
    hero: {
      headline: "solutions.aiQualitativeInsightsPlatform.hero.headline",
      subheadline: "solutions.aiQualitativeInsightsPlatform.hero.subheadline",
      image: "/images/ai-qualitative-insights-platform.jpg",
      benefits: [],
      ctaPrimary: "solutions.aiQualitativeInsightsPlatform.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.aiQualitativeInsightsPlatform.hero.ctaSecondary",
    },
    features: {
      title: "solutions.aiQualitativeInsightsPlatform.features.title",
      subheadline: "solutions.aiQualitativeInsightsPlatform.features.subheadline",
      subtitle: "solutions.aiQualitativeInsightsPlatform.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.aiQualitativeInsightsPlatform.features.items.0.title",
          description: "solutions.aiQualitativeInsightsPlatform.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.aiQualitativeInsightsPlatform.features.items.1.title",
          description: "solutions.aiQualitativeInsightsPlatform.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.aiQualitativeInsightsPlatform.features.items.2.title",
          description: "solutions.aiQualitativeInsightsPlatform.features.items.2.description",
        },
      ],
    },
    useCases: {
      title: "solutions.aiQualitativeInsightsPlatform.useCases.title",
      subtitle: "solutions.aiQualitativeInsightsPlatform.useCases.subtitle",
      otherSubtitle: "solutions.aiQualitativeInsightsPlatform.useCases.otherSubtitle",
      nbrOfItems: 2,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.aiQualitativeInsightsPlatform.useCases.cases.0.title",
          subheadline: "solutions.aiQualitativeInsightsPlatform.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.aiQualitativeInsightsPlatform.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.aiQualitativeInsightsPlatform.useCases.cases.1.title",
          subheadline: "solutions.aiQualitativeInsightsPlatform.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.aiQualitativeInsightsPlatform.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.aiQualitativeInsightsPlatform.useCases.cases.2.title",
          subheadline: "solutions.aiQualitativeInsightsPlatform.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.aiQualitativeInsightsPlatform.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.aiQualitativeInsightsPlatform.useCases.cases.3.title",
          subheadline: "solutions.aiQualitativeInsightsPlatform.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.aiQualitativeInsightsPlatform.useCases.cases.3.description",
        },
      ],
    },
    cta: {
      title: "solutions.aiQualitativeInsightsPlatform.cta.title",
      subtitle: "solutions.aiQualitativeInsightsPlatform.cta.subtitle",
      primaryButton: "solutions.aiQualitativeInsightsPlatform.cta.primaryButton",
      secondaryButton: "solutions.aiQualitativeInsightsPlatform.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "geospatial-analytics",
    name: "solutions.geospatialAnalytics.name",
    title: "solutions.geospatialAnalytics.title",
    category: "Tracking",
    description: "solutions.geospatialAnalytics.description",
    hero: {
      headline: "solutions.geospatialAnalytics.hero.headline",
      subheadline: "solutions.geospatialAnalytics.hero.subheadline",
      image: "/images/geospatial-analytics.jpg",
      benefits: [],
      ctaPrimary: "solutions.geospatialAnalytics.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.geospatialAnalytics.hero.ctaSecondary",
    },
    features: {
      title: "solutions.geospatialAnalytics.features.title",
      subheadline: "solutions.geospatialAnalytics.features.subheadline",
      subtitle: "solutions.geospatialAnalytics.features.subtitle",
      nbrOfItems: 2,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.geospatialAnalytics.features.items.0.title",
          description: "solutions.geospatialAnalytics.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.geospatialAnalytics.features.items.1.title",
          description: "solutions.geospatialAnalytics.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.geospatialAnalytics.features.items.2.title",
          description: "solutions.geospatialAnalytics.features.items.2.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.geospatialAnalytics.features.items.3.title",
          description: "solutions.geospatialAnalytics.features.items.3.description",
        },
      ],
    },
    useCases: {
      title: "solutions.geospatialAnalytics.useCases.title",
      subtitle: "solutions.geospatialAnalytics.useCases.subtitle",
      otherSubtitle: "solutions.geospatialAnalytics.useCases.otherSubtitle",
      nbrOfItems: 3,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.geospatialAnalytics.useCases.cases.0.title",
          subheadline: "solutions.geospatialAnalytics.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.geospatialAnalytics.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.geospatialAnalytics.useCases.cases.1.title",
          subheadline: "solutions.geospatialAnalytics.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.geospatialAnalytics.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.geospatialAnalytics.useCases.cases.2.title",
          subheadline: "solutions.geospatialAnalytics.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.geospatialAnalytics.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.geospatialAnalytics.useCases.cases.3.title",
          subheadline: "solutions.geospatialAnalytics.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.geospatialAnalytics.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.geospatialAnalytics.useCases.cases.4.title",
          subheadline: "solutions.geospatialAnalytics.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.geospatialAnalytics.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.geospatialAnalytics.useCases.cases.5.title",
          subheadline: "solutions.geospatialAnalytics.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.geospatialAnalytics.useCases.cases.5.description",
        },
      ],
    },
    cta: {
      title: "solutions.geospatialAnalytics.cta.title",
      subtitle: "solutions.geospatialAnalytics.cta.subtitle",
      primaryButton: "solutions.geospatialAnalytics.cta.primaryButton",
      secondaryButton: "solutions.geospatialAnalytics.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "brand-tracking",
    name: "solutions.brandTracking.name",
    title: "solutions.brandTracking.title",
    category: "Tracking",
    description: "solutions.brandTracking.description",
    hero: {
      headline: "solutions.brandTracking.hero.headline",
      subheadline: "solutions.brandTracking.hero.subheadline",
      image: "/images/brand-tracking.jpg",
      benefits: [],
      ctaPrimary: "solutions.brandTracking.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.brandTracking.hero.ctaSecondary",
    },
    features: {
      title: "solutions.brandTracking.features.title",
      subheadline: "solutions.brandTracking.features.subheadline",
      subtitle: "solutions.brandTracking.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "MousePointerClick",
          title: "solutions.brandTracking.features.items.0.title",
          description: "solutions.brandTracking.features.items.0.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.brandTracking.features.items.1.title",
          description: "solutions.brandTracking.features.items.1.description",
        },
        {
          icon: "CircleUserRound",
          title: "solutions.brandTracking.features.items.2.title",
          description: "solutions.brandTracking.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.brandTracking.zigZag.title",
      items: [
        {
          eyebrow: "solutions.brandTracking.zigZag.items.0.eyebrow",
          title: "solutions.brandTracking.zigZag.items.0.title",
          description: "solutions.brandTracking.zigZag.items.0.description",
          buttonLabel: "solutions.brandTracking.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.brandTracking.zigZag.items.1.eyebrow",
          title: "solutions.brandTracking.zigZag.items.1.title",
          description: "solutions.brandTracking.zigZag.items.1.description",
          buttonLabel: "solutions.brandTracking.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.brandTracking.zigZag.items.2.eyebrow",
          title: "solutions.brandTracking.zigZag.items.2.title",
          description: "solutions.brandTracking.zigZag.items.2.description",
          buttonLabel: "solutions.brandTracking.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.brandTracking.useCases.title",
      subtitle: "solutions.brandTracking.useCases.subtitle",
      otherSubtitle: "solutions.brandTracking.useCases.otherSubtitle",
      nbrOfItems: 3,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.brandTracking.useCases.cases.0.title",
          subheadline: "solutions.brandTracking.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.brandTracking.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.brandTracking.useCases.cases.1.title",
          subheadline: "solutions.brandTracking.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.brandTracking.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.brandTracking.useCases.cases.2.title",
          subheadline: "solutions.brandTracking.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.brandTracking.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.brandTracking.useCases.cases.3.title",
          subheadline: "solutions.brandTracking.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.brandTracking.useCases.cases.3.description",
        },
      ],
    },
    questions: {
      title: "solutions.brandTracking.questions.title",
      items: [
        {
          title: "solutions.brandTracking.questions.items.0.title",
          description: "solutions.brandTracking.questions.items.0.description",
        },
        {
          title: "solutions.brandTracking.questions.items.1.title",
          description: "solutions.brandTracking.questions.items.1.description",
        },
        {
          title: "solutions.brandTracking.questions.items.2.title",
          description: "solutions.brandTracking.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.brandTracking.cta.title",
      subtitle: "solutions.brandTracking.cta.subtitle",
      primaryButton: "solutions.brandTracking.cta.primaryButton",
      secondaryButton: "solutions.brandTracking.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "consumer-tracking",
    name: "solutions.consumerTracking.name",
    title: "solutions.consumerTracking.title",
    category: "Tracking",
    description: "solutions.consumerTracking.description",
    hero: {
      headline: "solutions.consumerTracking.hero.headline",
      subheadline: "solutions.consumerTracking.hero.subheadline",
      image: "/images/consumer-tracking.jpg",
      benefits: [],
      ctaPrimary: "solutions.consumerTracking.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.consumerTracking.hero.ctaSecondary",
    },
    features: {
      title: "solutions.consumerTracking.features.title",
      subheadline: "solutions.consumerTracking.features.subheadline",
      subtitle: "solutions.consumerTracking.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.consumerTracking.features.items.0.title",
          description: "solutions.consumerTracking.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.consumerTracking.features.items.1.title",
          description: "solutions.consumerTracking.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.consumerTracking.features.items.2.title",
          description: "solutions.consumerTracking.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.consumerTracking.zigZag.title",
      items: [
        {
          eyebrow: "solutions.consumerTracking.zigZag.items.0.eyebrow",
          title: "solutions.consumerTracking.zigZag.items.0.title",
          description: "solutions.consumerTracking.zigZag.items.0.description",
          buttonLabel: "solutions.consumerTracking.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.consumerTracking.zigZag.items.1.eyebrow",
          title: "solutions.consumerTracking.zigZag.items.1.title",
          description: "solutions.consumerTracking.zigZag.items.1.description",
          buttonLabel: "solutions.consumerTracking.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.consumerTracking.zigZag.items.2.eyebrow",
          title: "solutions.consumerTracking.zigZag.items.2.title",
          description: "solutions.consumerTracking.zigZag.items.2.description",
          buttonLabel: "solutions.consumerTracking.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.consumerTracking.useCases.title",
      subtitle: "solutions.consumerTracking.useCases.subtitle",
      otherSubtitle: "solutions.consumerTracking.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.consumerTracking.useCases.cases.0.title",
          subheadline: "solutions.consumerTracking.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.consumerTracking.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.consumerTracking.useCases.cases.1.title",
          subheadline: "solutions.consumerTracking.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.consumerTracking.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.consumerTracking.useCases.cases.2.title",
          subheadline: "solutions.consumerTracking.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.consumerTracking.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.consumerTracking.useCases.cases.3.title",
          subheadline: "solutions.consumerTracking.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.consumerTracking.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.consumerTracking.useCases.cases.4.title",
          subheadline: "solutions.consumerTracking.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.consumerTracking.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.consumerTracking.useCases.cases.5.title",
          subheadline: "solutions.consumerTracking.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.consumerTracking.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.consumerTracking.useCases.cases.6.title",
          subheadline: "solutions.consumerTracking.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.consumerTracking.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.consumerTracking.useCases.cases.7.title",
          subheadline: "solutions.consumerTracking.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.consumerTracking.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.consumerTracking.questions.title",
      items: [
        {
          title: "solutions.consumerTracking.questions.items.0.title",
          description: "solutions.consumerTracking.questions.items.0.description",
        },
        {
          title: "solutions.consumerTracking.questions.items.1.title",
          description: "solutions.consumerTracking.questions.items.1.description",
        },
        {
          title: "solutions.consumerTracking.questions.items.2.title",
          description: "solutions.consumerTracking.questions.items.2.description",
        },
      ],
    },
    accordion: {
      title: "solutions.consumerTracking.accordion.title",
      items: [
        {
          question: "solutions.consumerTracking.accordion.items.0.question",
          answer: "solutions.consumerTracking.accordion.items.0.answer",
        },
        {
          question: "solutions.consumerTracking.accordion.items.1.question",
          answer: "solutions.consumerTracking.accordion.items.1.answer",
        },
        {
          question: "solutions.consumerTracking.accordion.items.2.question",
          answer: "solutions.consumerTracking.accordion.items.2.answer",
        }
      ]
    },
    cta: {
      title: "solutions.consumerTracking.cta.title",
      subtitle: "solutions.consumerTracking.cta.subtitle",
      primaryButton: "solutions.consumerTracking.cta.primaryButton",
      secondaryButton: "solutions.consumerTracking.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "pricing-analysis",
    name: "solutions.pricingAnalysis.name",
    title: "solutions.pricingAnalysis.title",
    category: "Strategy",
    description: "solutions.pricingAnalysis.description",
    hero: {
      headline: "solutions.pricingAnalysis.hero.headline",
      subheadline: "solutions.pricingAnalysis.hero.subheadline",
      image: "/images/pricing-analysis.jpg",
      benefits: [],
      ctaPrimary: "solutions.pricingAnalysis.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.pricingAnalysis.hero.ctaSecondary",
    },
    features: {
      title: "solutions.pricingAnalysis.features.title",
      subheadline: "solutions.pricingAnalysis.features.subheadline",
      subtitle: "solutions.pricingAnalysis.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.pricingAnalysis.features.items.0.title",
          description: "solutions.pricingAnalysis.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.pricingAnalysis.features.items.1.title",
          description: "solutions.pricingAnalysis.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.pricingAnalysis.features.items.2.title",
          description: "solutions.pricingAnalysis.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.pricingAnalysis.zigZag.title",
      items: [
        {
          eyebrow: "solutions.pricingAnalysis.zigZag.items.0.eyebrow",
          title: "solutions.pricingAnalysis.zigZag.items.0.title",
          description: "solutions.pricingAnalysis.zigZag.items.0.description",
          buttonLabel: "solutions.pricingAnalysis.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.pricingAnalysis.zigZag.items.1.eyebrow",
          title: "solutions.pricingAnalysis.zigZag.items.1.title",
          description: "solutions.pricingAnalysis.zigZag.items.1.description",
          buttonLabel: "solutions.pricingAnalysis.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.pricingAnalysis.useCases.title",
      subtitle: "solutions.pricingAnalysis.useCases.subtitle",
      otherSubtitle: "solutions.pricingAnalysis.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.pricingAnalysis.useCases.cases.0.title",
          subheadline: "solutions.pricingAnalysis.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.pricingAnalysis.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.pricingAnalysis.useCases.cases.1.title",
          subheadline: "solutions.pricingAnalysis.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.pricingAnalysis.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.pricingAnalysis.useCases.cases.2.title",
          subheadline: "solutions.pricingAnalysis.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.pricingAnalysis.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.pricingAnalysis.useCases.cases.3.title",
          subheadline: "solutions.pricingAnalysis.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.pricingAnalysis.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.pricingAnalysis.useCases.cases.4.title",
          subheadline: "solutions.pricingAnalysis.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.pricingAnalysis.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.pricingAnalysis.useCases.cases.5.title",
          subheadline: "solutions.pricingAnalysis.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.pricingAnalysis.useCases.cases.5.description",
        },
      ],
    },
    questions: {
      title: "solutions.pricingAnalysis.questions.title",
      items: [
        {
          title: "solutions.pricingAnalysis.questions.items.0.title",
          description: "solutions.pricingAnalysis.questions.items.0.description",
        },
        {
          title: "solutions.pricingAnalysis.questions.items.1.title",
          description: "solutions.pricingAnalysis.questions.items.1.description",
        },
        {
          title: "solutions.pricingAnalysis.questions.items.2.title",
          description: "solutions.pricingAnalysis.questions.items.2.description",
        },
      ],
    },
    accordion: {
      title: "solutions.pricingAnalysis.accordion.title",
      items: [
        {
          question: "solutions.pricingAnalysis.accordion.items.0.question",
          answer: "solutions.pricingAnalysis.accordion.items.0.answer",
        },
        {
          question: "solutions.pricingAnalysis.accordion.items.1.question",
          answer: "solutions.pricingAnalysis.accordion.items.1.answer",
        },
        {
          question: "solutions.pricingAnalysis.accordion.items.2.question",
          answer: "solutions.pricingAnalysis.accordion.items.2.answer",
        },
        {
          question: "solutions.pricingAnalysis.accordion.items.3.question",
          answer: "solutions.pricingAnalysis.accordion.items.3.answer",
        },
        {
          question: "solutions.pricingAnalysis.accordion.items.4.question",
          answer: "solutions.pricingAnalysis.accordion.items.4.answer",
        }
      ]
    },
    cta: {
      title: "solutions.pricingAnalysis.cta.title",
      subtitle: "solutions.pricingAnalysis.cta.subtitle",
      primaryButton: "solutions.pricingAnalysis.cta.primaryButton",
      secondaryButton: "solutions.pricingAnalysis.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "visual-test",
    name: "solutions.visualTest.name",
    title: "solutions.visualTest.title",
    category: "Innovation",
    description: "solutions.visualTest.description",
    hero: {
      headline: "solutions.visualTest.hero.headline",
      subheadline: "solutions.visualTest.hero.subheadline",
      image: "/images/visual-test.jpg",
      benefits: [],
      ctaPrimary: "solutions.visualTest.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.visualTest.hero.ctaSecondary",
    },
    features: {
      title: "solutions.visualTest.features.title",
      subheadline: "solutions.visualTest.features.subheadline",
      subtitle: "solutions.visualTest.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.visualTest.features.items.0.title",
          description: "solutions.visualTest.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.visualTest.features.items.1.title",
          description: "solutions.visualTest.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.visualTest.features.items.2.title",
          description: "solutions.visualTest.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.visualTest.zigZag.title",
      items: [
        {
          eyebrow: "solutions.visualTest.zigZag.items.0.eyebrow",
          title: "solutions.visualTest.zigZag.items.0.title",
          description: "solutions.visualTest.zigZag.items.0.description",
          buttonLabel: "solutions.visualTest.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.visualTest.zigZag.items.1.eyebrow",
          title: "solutions.visualTest.zigZag.items.1.title",
          description: "solutions.visualTest.zigZag.items.1.description",
          buttonLabel: "solutions.visualTest.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.visualTest.useCases.title",
      subtitle: "solutions.visualTest.useCases.subtitle",
      otherSubtitle: "solutions.visualTest.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.visualTest.useCases.cases.0.title",
          subheadline: "solutions.visualTest.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.visualTest.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.visualTest.useCases.cases.1.title",
          subheadline: "solutions.visualTest.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.visualTest.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.visualTest.useCases.cases.2.title",
          subheadline: "solutions.visualTest.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.visualTest.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.visualTest.useCases.cases.3.title",
          subheadline: "solutions.visualTest.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.visualTest.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.visualTest.useCases.cases.4.title",
          subheadline: "solutions.visualTest.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.visualTest.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.visualTest.useCases.cases.5.title",
          subheadline: "solutions.visualTest.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.visualTest.useCases.cases.5.description",
        },
      ],
    },
    questions: {
      title: "solutions.visualTest.questions.title",
      items: [
        {
          title: "solutions.visualTest.questions.items.0.title",
          description: "solutions.visualTest.questions.items.0.description",
        },
        {
          title: "solutions.visualTest.questions.items.1.title",
          description: "solutions.visualTest.questions.items.1.description",
        },
        {
          title: "solutions.visualTest.questions.items.2.title",
          description: "solutions.visualTest.questions.items.2.description",
        },
      ],
    },
    accordion: {
      title: "solutions.visualTest.accordion.title",
      items: [
        {
          question: "solutions.visualTest.accordion.items.0.question",
          answer: "solutions.visualTest.accordion.items.0.answer",
        },
        {
          question: "solutions.visualTest.accordion.items.1.question",
          answer: "solutions.visualTest.accordion.items.1.answer",
        },
        {
          question: "solutions.visualTest.accordion.items.2.question",
          answer: "solutions.visualTest.accordion.items.2.answer",
        }
      ]
    },
    cta: {
      title: "solutions.visualTest.cta.title",
      subtitle: "solutions.visualTest.cta.subtitle",
      primaryButton: "solutions.visualTest.cta.primaryButton",
      secondaryButton: "solutions.visualTest.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "campaign-tracking",
    name: "solutions.campaignTracking.name",
    title: "solutions.campaignTracking.title",
    category: "Tracking",
    description: "solutions.campaignTracking.description",
    hero: {
      headline: "solutions.campaignTracking.hero.headline",
      subheadline: "solutions.campaignTracking.hero.subheadline",
      image: "/images/campaign-tracking.jpg",
      benefits: [],
      ctaPrimary: "solutions.campaignTracking.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.campaignTracking.hero.ctaSecondary",
    },
    features: {
      title: "solutions.campaignTracking.features.title",
      subheadline: "solutions.campaignTracking.features.subheadline",
      subtitle: "solutions.campaignTracking.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.campaignTracking.features.items.0.title",
          description: "solutions.campaignTracking.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.campaignTracking.features.items.1.title",
          description: "solutions.campaignTracking.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.campaignTracking.features.items.2.title",
          description: "solutions.campaignTracking.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.campaignTracking.zigZag.title",
      items: [
        {
          eyebrow: "solutions.campaignTracking.zigZag.items.0.eyebrow",
          title: "solutions.campaignTracking.zigZag.items.0.title",
          description: "solutions.campaignTracking.zigZag.items.0.description",
          buttonLabel: "solutions.campaignTracking.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.campaignTracking.zigZag.items.1.eyebrow",
          title: "solutions.campaignTracking.zigZag.items.1.title",
          description: "solutions.campaignTracking.zigZag.items.1.description",
          buttonLabel: "solutions.campaignTracking.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.campaignTracking.zigZag.items.2.eyebrow",
          title: "solutions.campaignTracking.zigZag.items.2.title",
          description: "solutions.campaignTracking.zigZag.items.2.description",
          buttonLabel: "solutions.campaignTracking.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
        {
          eyebrow: "solutions.campaignTracking.zigZag.items.3.eyebrow",
          title: "solutions.campaignTracking.zigZag.items.3.title",
          description: "solutions.campaignTracking.zigZag.items.3.description",
          buttonLabel: "solutions.campaignTracking.zigZag.items.3.buttonLabel",
          buttonLink: "",
          image: "/images/heatmaps.png",
        },
      ],
    },
    useCases: {
      title: "solutions.campaignTracking.useCases.title",
      subtitle: "solutions.campaignTracking.useCases.subtitle",
      otherSubtitle: "solutions.campaignTracking.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.campaignTracking.useCases.cases.0.title",
          subheadline: "solutions.campaignTracking.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.campaignTracking.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.campaignTracking.useCases.cases.1.title",
          subheadline: "solutions.campaignTracking.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.campaignTracking.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.campaignTracking.useCases.cases.2.title",
          subheadline: "solutions.campaignTracking.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.campaignTracking.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.campaignTracking.useCases.cases.3.title",
          subheadline: "solutions.campaignTracking.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.campaignTracking.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.campaignTracking.useCases.cases.4.title",
          subheadline: "solutions.campaignTracking.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.campaignTracking.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.campaignTracking.useCases.cases.5.title",
          subheadline: "solutions.campaignTracking.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.campaignTracking.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.campaignTracking.useCases.cases.6.title",
          subheadline: "solutions.campaignTracking.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.campaignTracking.useCases.cases.6.description",
        },
      ],
    },
    questions: {
      title: "solutions.campaignTracking.questions.title",
      items: [
        {
          title: "solutions.campaignTracking.questions.items.0.title",
          description: "solutions.campaignTracking.questions.items.0.description",
        },
        {
          title: "solutions.campaignTracking.questions.items.1.title",
          description: "solutions.campaignTracking.questions.items.1.description",
        },
        {
          title: "solutions.campaignTracking.questions.items.2.title",
          description: "solutions.campaignTracking.questions.items.2.description",
        },
        {
          title: "solutions.campaignTracking.questions.items.3.title",
          description: "solutions.campaignTracking.questions.items.3.description",
        },
        {
          title: "solutions.campaignTracking.questions.items.4.title",
          description: "solutions.campaignTracking.questions.items.4.description",
        },
      ],
    },
    accordion: {
      title: "solutions.campaignTracking.accordion.title",
      items: [
        {
          question: "solutions.campaignTracking.accordion.items.0.question",
          answer: "solutions.campaignTracking.accordion.items.0.answer",
        },
        {
          question: "solutions.campaignTracking.accordion.items.1.question",
          answer: "solutions.campaignTracking.accordion.items.1.answer",
        },
        {
          question: "solutions.campaignTracking.accordion.items.2.question",
          answer: "solutions.campaignTracking.accordion.items.2.answer",
        }
      ]
    },
    cta: {
      title: "solutions.campaignTracking.cta.title",
      subtitle: "solutions.campaignTracking.cta.subtitle",
      primaryButton: "solutions.campaignTracking.cta.primaryButton",
      secondaryButton: "solutions.campaignTracking.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "media-testing",
    name: "solutions.mediaTesting.name",
    title: "solutions.mediaTesting.title",
    category: "Activation",
    description: "solutions.mediaTesting.description",
    hero: {
      headline: "solutions.mediaTesting.hero.headline",
      subheadline: "solutions.mediaTesting.hero.subheadline",
      image: "/images/media-testing.jpg",
      benefits: [],
      ctaPrimary: "solutions.mediaTesting.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.mediaTesting.hero.ctaSecondary",
    },
    features: {
      title: "solutions.mediaTesting.features.title",
      subheadline: "solutions.mediaTesting.features.subheadline",
      subtitle: "solutions.mediaTesting.features.subtitle",
      nbrOfItems: 2,
      items: [
        {
          icon: "Lightbulb",
          title: "",
          description: "solutions.mediaTesting.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "",
          description: "solutions.mediaTesting.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "",
          description: "solutions.mediaTesting.features.items.2.description",
        },
        {
          icon: "HeartPulse",
          title: "",
          description: "solutions.mediaTesting.features.items.3.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.mediaTesting.zigZag.title",
      items: [
        {
          eyebrow: "solutions.mediaTesting.zigZag.items.0.eyebrow",
          title: "solutions.mediaTesting.zigZag.items.0.title",
          description: "solutions.mediaTesting.zigZag.items.0.description",
          buttonLabel: "solutions.mediaTesting.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.mediaTesting.zigZag.items.1.eyebrow",
          title: "solutions.mediaTesting.zigZag.items.1.title",
          description: "solutions.mediaTesting.zigZag.items.1.description",
          buttonLabel: "solutions.mediaTesting.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.mediaTesting.zigZag.items.2.eyebrow",
          title: "solutions.mediaTesting.zigZag.items.2.title",
          description: "solutions.mediaTesting.zigZag.items.2.description",
          buttonLabel: "solutions.mediaTesting.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
        {
          eyebrow: "solutions.mediaTesting.zigZag.items.3.eyebrow",
          title: "solutions.mediaTesting.zigZag.items.3.title",
          description: "solutions.mediaTesting.zigZag.items.3.description",
          buttonLabel: "solutions.mediaTesting.zigZag.items.3.buttonLabel",
          buttonLink: "",
          image: "/images/heatmaps.png",
        },
      ],
    },
    useCases: {
      title: "solutions.mediaTesting.useCases.title",
      subtitle: "solutions.mediaTesting.useCases.subtitle",
      otherSubtitle: "solutions.mediaTesting.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.mediaTesting.useCases.cases.0.title",
          subheadline: "solutions.mediaTesting.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.mediaTesting.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.mediaTesting.useCases.cases.1.title",
          subheadline: "solutions.mediaTesting.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.mediaTesting.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.mediaTesting.useCases.cases.2.title",
          subheadline: "solutions.mediaTesting.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.mediaTesting.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.mediaTesting.useCases.cases.3.title",
          subheadline: "solutions.mediaTesting.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.mediaTesting.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.mediaTesting.useCases.cases.4.title",
          subheadline: "solutions.mediaTesting.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.mediaTesting.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.mediaTesting.useCases.cases.5.title",
          subheadline: "solutions.mediaTesting.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.mediaTesting.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.mediaTesting.useCases.cases.6.title",
          subheadline: "solutions.mediaTesting.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.mediaTesting.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.mediaTesting.useCases.cases.7.title",
          subheadline: "solutions.mediaTesting.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.mediaTesting.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.mediaTesting.questions.title",
      items: [
        {
          title: "solutions.mediaTesting.questions.items.0.title",
          description: "solutions.mediaTesting.questions.items.0.description",
        },
        {
          title: "solutions.mediaTesting.questions.items.1.title",
          description: "solutions.mediaTesting.questions.items.2.description",
        },
        {
          title: "solutions.mediaTesting.questions.items.2.title",
          description: "solutions.mediaTesting.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.mediaTesting.cta.title",
      subtitle: "solutions.mediaTesting.cta.subtitle",
      primaryButton: "solutions.mediaTesting.cta.primaryButton",
      secondaryButton: "solutions.mediaTesting.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "shopper-activation-testing",
    name: "solutions.shopperActivationTesting.name",
    title: "solutions.shopperActivationTesting.title",
    category: "Activation",
    description: "solutions.shopperActivationTesting.description",
    hero: {
      headline: "solutions.shopperActivationTesting.hero.headline",
      subheadline: "solutions.shopperActivationTesting.hero.subheadline",
      image: "/images/media-testing.jpg",
      benefits: [],
      ctaPrimary: "solutions.shopperActivationTesting.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.shopperActivationTesting.hero.ctaSecondary",
    },
    features: {
      title: "solutions.shopperActivationTesting.features.title",
      subheadline: "solutions.shopperActivationTesting.features.subheadline",
      subtitle: "solutions.shopperActivationTesting.features.subtitle",
      nbrOfItems: 2,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.shopperActivationTesting.features.items.0.title",
          description: "solutions.shopperActivationTesting.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.shopperActivationTesting.features.items.1.title",
          description: "solutions.shopperActivationTesting.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.shopperActivationTesting.features.items.2.title",
          description: "solutions.shopperActivationTesting.features.items.2.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.shopperActivationTesting.features.items.2.title",
          description: "solutions.shopperActivationTesting.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.shopperActivationTesting.zigZag.title",
      items: [
        {
          eyebrow: "solutions.shopperActivationTesting.zigZag.items.0.eyebrow",
          title: "solutions.shopperActivationTesting.zigZag.items.0.title",
          description: "solutions.shopperActivationTesting.zigZag.items.0.description",
          buttonLabel: "solutions.shopperActivationTesting.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.shopperActivationTesting.zigZag.items.1.eyebrow",
          title: "solutions.shopperActivationTesting.zigZag.items.1.title",
          description: "solutions.shopperActivationTesting.zigZag.items.1.description",
          buttonLabel: "solutions.shopperActivationTesting.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.shopperActivationTesting.zigZag.items.2.eyebrow",
          title: "solutions.shopperActivationTesting.zigZag.items.2.title",
          description: "solutions.shopperActivationTesting.zigZag.items.2.description",
          buttonLabel: "solutions.shopperActivationTesting.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
        {
          eyebrow: "solutions.shopperActivationTesting.zigZag.items.3.eyebrow",
          title: "solutions.shopperActivationTesting.zigZag.items.3.title",
          description: "solutions.shopperActivationTesting.zigZag.items.3.description",
          buttonLabel: "solutions.shopperActivationTesting.zigZag.items.3.buttonLabel",
          buttonLink: "",
          image: "/images/heatmaps.png",
        },
      ],
    },
    useCases: {
      title: "solutions.shopperActivationTesting.useCases.title",
      subtitle: "solutions.shopperActivationTesting.useCases.subtitle",
      otherSubtitle: "solutions.shopperActivationTesting.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.shopperActivationTesting.useCases.cases.0.title",
          subheadline: "solutions.shopperActivationTesting.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.shopperActivationTesting.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.shopperActivationTesting.useCases.cases.1.title",
          subheadline: "solutions.shopperActivationTesting.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.shopperActivationTesting.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.shopperActivationTesting.useCases.cases.2.title",
          subheadline: "solutions.shopperActivationTesting.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.shopperActivationTesting.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.shopperActivationTesting.useCases.cases.3.title",
          subheadline: "solutions.shopperActivationTesting.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.shopperActivationTesting.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.shopperActivationTesting.useCases.cases.4.title",
          subheadline: "solutions.shopperActivationTesting.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.shopperActivationTesting.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.shopperActivationTesting.useCases.cases.5.title",
          subheadline: "solutions.shopperActivationTesting.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.shopperActivationTesting.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.shopperActivationTesting.useCases.cases.6.title",
          subheadline: "solutions.shopperActivationTesting.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.shopperActivationTesting.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.shopperActivationTesting.useCases.cases.7.title",
          subheadline: "solutions.shopperActivationTesting.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.shopperActivationTesting.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.shopperActivationTesting.questions.title",
      items: [
        {
          title: "solutions.shopperActivationTesting.questions.items.0.title",
          description: "solutions.shopperActivationTesting.questions.items.0.description",
        },
        {
          title: "solutions.shopperActivationTesting.questions.items.1.title",
          description: "solutions.shopperActivationTesting.questions.items.2.description",
        },
        {
          title: "solutions.shopperActivationTesting.questions.items.2.title",
          description: "solutions.shopperActivationTesting.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.shopperActivationTesting.cta.title",
      subtitle: "solutions.shopperActivationTesting.cta.subtitle",
      primaryButton: "solutions.shopperActivationTesting.cta.primaryButton",
      secondaryButton: "solutions.shopperActivationTesting.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "public-engagement-effectiveness",
    name: "solutions.publicEngagementEffectiveness.name",
    title: "solutions.publicEngagementEffectiveness.title",
    category: "Activation",
    description: "solutions.publicEngagementEffectiveness.description",
    hero: {
      headline: "solutions.publicEngagementEffectiveness.hero.headline",
      subheadline: "solutions.publicEngagementEffectiveness.hero.subheadline",
      image: "/images/media-testing.jpg",
      benefits: [],
      ctaPrimary: "solutions.publicEngagementEffectiveness.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.publicEngagementEffectiveness.hero.ctaSecondary",
    },
    features: {
      title: "solutions.publicEngagementEffectiveness.features.title",
      subheadline: "solutions.publicEngagementEffectiveness.features.subheadline",
      subtitle: "solutions.publicEngagementEffectiveness.features.subtitle",
      nbrOfItems: 2,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.publicEngagementEffectiveness.features.items.0.title",
          description: "solutions.publicEngagementEffectiveness.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.publicEngagementEffectiveness.features.items.1.title",
          description: "solutions.publicEngagementEffectiveness.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.publicEngagementEffectiveness.features.items.2.title",
          description: "solutions.publicEngagementEffectiveness.features.items.2.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.publicEngagementEffectiveness.features.items.2.title",
          description: "solutions.publicEngagementEffectiveness.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.publicEngagementEffectiveness.zigZag.title",
      items: [
        {
          eyebrow: "solutions.publicEngagementEffectiveness.zigZag.items.0.eyebrow",
          title: "solutions.publicEngagementEffectiveness.zigZag.items.0.title",
          description: "solutions.publicEngagementEffectiveness.zigZag.items.0.description",
          buttonLabel: "solutions.publicEngagementEffectiveness.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.publicEngagementEffectiveness.zigZag.items.1.eyebrow",
          title: "solutions.publicEngagementEffectiveness.zigZag.items.1.title",
          description: "solutions.publicEngagementEffectiveness.zigZag.items.1.description",
          buttonLabel: "solutions.publicEngagementEffectiveness.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.publicEngagementEffectiveness.zigZag.items.2.eyebrow",
          title: "solutions.publicEngagementEffectiveness.zigZag.items.2.title",
          description: "solutions.publicEngagementEffectiveness.zigZag.items.2.description",
          buttonLabel: "solutions.publicEngagementEffectiveness.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
        {
          eyebrow: "solutions.publicEngagementEffectiveness.zigZag.items.3.eyebrow",
          title: "solutions.publicEngagementEffectiveness.zigZag.items.3.title",
          description: "solutions.publicEngagementEffectiveness.zigZag.items.3.description",
          buttonLabel: "solutions.publicEngagementEffectiveness.zigZag.items.3.buttonLabel",
          buttonLink: "",
          image: "/images/heatmaps.png",
        },
      ],
    },
    useCases: {
      title: "solutions.publicEngagementEffectiveness.useCases.title",
      subtitle: "solutions.publicEngagementEffectiveness.useCases.subtitle",
      otherSubtitle: "solutions.publicEngagementEffectiveness.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.publicEngagementEffectiveness.useCases.cases.0.title",
          subheadline: "solutions.publicEngagementEffectiveness.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.publicEngagementEffectiveness.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.publicEngagementEffectiveness.useCases.cases.1.title",
          subheadline: "solutions.publicEngagementEffectiveness.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.publicEngagementEffectiveness.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.publicEngagementEffectiveness.useCases.cases.2.title",
          subheadline: "solutions.publicEngagementEffectiveness.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.publicEngagementEffectiveness.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.publicEngagementEffectiveness.useCases.cases.3.title",
          subheadline: "solutions.publicEngagementEffectiveness.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.publicEngagementEffectiveness.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.publicEngagementEffectiveness.useCases.cases.4.title",
          subheadline: "solutions.publicEngagementEffectiveness.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.publicEngagementEffectiveness.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.publicEngagementEffectiveness.useCases.cases.5.title",
          subheadline: "solutions.publicEngagementEffectiveness.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.publicEngagementEffectiveness.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.publicEngagementEffectiveness.useCases.cases.6.title",
          subheadline: "solutions.publicEngagementEffectiveness.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.publicEngagementEffectiveness.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.publicEngagementEffectiveness.useCases.cases.7.title",
          subheadline: "solutions.publicEngagementEffectiveness.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.publicEngagementEffectiveness.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.publicEngagementEffectiveness.questions.title",
      items: [
        {
          title: "solutions.publicEngagementEffectiveness.questions.items.0.title",
          description: "solutions.publicEngagementEffectiveness.questions.items.0.description",
        },
        {
          title: "solutions.publicEngagementEffectiveness.questions.items.1.title",
          description: "solutions.publicEngagementEffectiveness.questions.items.2.description",
        },
        {
          title: "solutions.publicEngagementEffectiveness.questions.items.2.title",
          description: "solutions.publicEngagementEffectiveness.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.publicEngagementEffectiveness.cta.title",
      subtitle: "solutions.publicEngagementEffectiveness.cta.subtitle",
      primaryButton: "solutions.publicEngagementEffectiveness.cta.primaryButton",
      secondaryButton: "solutions.publicEngagementEffectiveness.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "behavior-change-activation",
    name: "solutions.behaviorChangeActivation.name",
    title: "solutions.behaviorChangeActivation.title",
    category: "Activation",
    description: "solutions.behaviorChangeActivation.description",
    hero: {
      headline: "solutions.behaviorChangeActivation.hero.headline",
      subheadline: "solutions.behaviorChangeActivation.hero.subheadline",
      image: "/images/media-testing.jpg",
      benefits: [],
      ctaPrimary: "solutions.behaviorChangeActivation.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.behaviorChangeActivation.hero.ctaSecondary",
    },
    features: {
      title: "solutions.behaviorChangeActivation.features.title",
      subheadline: "solutions.behaviorChangeActivation.features.subheadline",
      subtitle: "solutions.behaviorChangeActivation.features.subtitle",
      nbrOfItems: 2,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.behaviorChangeActivation.features.items.0.title",
          description: "solutions.behaviorChangeActivation.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.behaviorChangeActivation.features.items.1.title",
          description: "solutions.behaviorChangeActivation.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.behaviorChangeActivation.features.items.2.title",
          description: "solutions.behaviorChangeActivation.features.items.2.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.behaviorChangeActivation.features.items.2.title",
          description: "solutions.behaviorChangeActivation.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.behaviorChangeActivation.zigZag.title",
      items: [
        {
          eyebrow: "solutions.behaviorChangeActivation.zigZag.items.0.eyebrow",
          title: "solutions.behaviorChangeActivation.zigZag.items.0.title",
          description: "solutions.behaviorChangeActivation.zigZag.items.0.description",
          buttonLabel: "solutions.behaviorChangeActivation.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.behaviorChangeActivation.zigZag.items.1.eyebrow",
          title: "solutions.behaviorChangeActivation.zigZag.items.1.title",
          description: "solutions.behaviorChangeActivation.zigZag.items.1.description",
          buttonLabel: "solutions.behaviorChangeActivation.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.behaviorChangeActivation.zigZag.items.2.eyebrow",
          title: "solutions.behaviorChangeActivation.zigZag.items.2.title",
          description: "solutions.behaviorChangeActivation.zigZag.items.2.description",
          buttonLabel: "solutions.behaviorChangeActivation.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
        {
          eyebrow: "solutions.behaviorChangeActivation.zigZag.items.3.eyebrow",
          title: "solutions.behaviorChangeActivation.zigZag.items.3.title",
          description: "solutions.behaviorChangeActivation.zigZag.items.3.description",
          buttonLabel: "solutions.behaviorChangeActivation.zigZag.items.3.buttonLabel",
          buttonLink: "",
          image: "/images/heatmaps.png",
        },
      ],
    },
    useCases: {
      title: "solutions.behaviorChangeActivation.useCases.title",
      subtitle: "solutions.behaviorChangeActivation.useCases.subtitle",
      otherSubtitle: "solutions.behaviorChangeActivation.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.behaviorChangeActivation.useCases.cases.0.title",
          subheadline: "solutions.behaviorChangeActivation.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.behaviorChangeActivation.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.behaviorChangeActivation.useCases.cases.1.title",
          subheadline: "solutions.behaviorChangeActivation.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.behaviorChangeActivation.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.behaviorChangeActivation.useCases.cases.2.title",
          subheadline: "solutions.behaviorChangeActivation.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.behaviorChangeActivation.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.behaviorChangeActivation.useCases.cases.3.title",
          subheadline: "solutions.behaviorChangeActivation.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.behaviorChangeActivation.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.behaviorChangeActivation.useCases.cases.4.title",
          subheadline: "solutions.behaviorChangeActivation.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.behaviorChangeActivation.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.behaviorChangeActivation.useCases.cases.5.title",
          subheadline: "solutions.behaviorChangeActivation.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.behaviorChangeActivation.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.behaviorChangeActivation.useCases.cases.6.title",
          subheadline: "solutions.behaviorChangeActivation.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.behaviorChangeActivation.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.behaviorChangeActivation.useCases.cases.7.title",
          subheadline: "solutions.behaviorChangeActivation.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.behaviorChangeActivation.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.behaviorChangeActivation.questions.title",
      items: [
        {
          title: "solutions.behaviorChangeActivation.questions.items.0.title",
          description: "solutions.behaviorChangeActivation.questions.items.0.description",
        },
        {
          title: "solutions.behaviorChangeActivation.questions.items.1.title",
          description: "solutions.behaviorChangeActivation.questions.items.2.description",
        },
        {
          title: "solutions.behaviorChangeActivation.questions.items.2.title",
          description: "solutions.behaviorChangeActivation.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.behaviorChangeActivation.cta.title",
      subtitle: "solutions.behaviorChangeActivation.cta.subtitle",
      primaryButton: "solutions.behaviorChangeActivation.cta.primaryButton",
      secondaryButton: "solutions.behaviorChangeActivation.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "market-activation-blueprint-testing",
    name: "solutions.marketActivationBlueprintTesting.name",
    title: "solutions.marketActivationBlueprintTesting.title",
    category: "Activation",
    description: "solutions.marketActivationBlueprintTesting.description",
    hero: {
      headline: "solutions.marketActivationBlueprintTesting.hero.headline",
      subheadline: "solutions.marketActivationBlueprintTesting.hero.subheadline",
      image: "/images/media-testing.jpg",
      benefits: [],
      ctaPrimary: "solutions.marketActivationBlueprintTesting.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.marketActivationBlueprintTesting.hero.ctaSecondary",
    },
    features: {
      title: "solutions.marketActivationBlueprintTesting.features.title",
      subheadline: "solutions.marketActivationBlueprintTesting.features.subheadline",
      subtitle: "solutions.marketActivationBlueprintTesting.features.subtitle",
      nbrOfItems: 2,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.marketActivationBlueprintTesting.features.items.0.title",
          description: "solutions.marketActivationBlueprintTesting.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.marketActivationBlueprintTesting.features.items.1.title",
          description: "solutions.marketActivationBlueprintTesting.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.marketActivationBlueprintTesting.features.items.2.title",
          description: "solutions.marketActivationBlueprintTesting.features.items.2.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.marketActivationBlueprintTesting.features.items.2.title",
          description: "solutions.marketActivationBlueprintTesting.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.marketActivationBlueprintTesting.zigZag.title",
      items: [
        {
          eyebrow: "solutions.marketActivationBlueprintTesting.zigZag.items.0.eyebrow",
          title: "solutions.marketActivationBlueprintTesting.zigZag.items.0.title",
          description: "solutions.marketActivationBlueprintTesting.zigZag.items.0.description",
          buttonLabel: "solutions.marketActivationBlueprintTesting.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.marketActivationBlueprintTesting.zigZag.items.1.eyebrow",
          title: "solutions.marketActivationBlueprintTesting.zigZag.items.1.title",
          description: "solutions.marketActivationBlueprintTesting.zigZag.items.1.description",
          buttonLabel: "solutions.marketActivationBlueprintTesting.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.marketActivationBlueprintTesting.zigZag.items.2.eyebrow",
          title: "solutions.marketActivationBlueprintTesting.zigZag.items.2.title",
          description: "solutions.marketActivationBlueprintTesting.zigZag.items.2.description",
          buttonLabel: "solutions.marketActivationBlueprintTesting.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
        {
          eyebrow: "solutions.marketActivationBlueprintTesting.zigZag.items.3.eyebrow",
          title: "solutions.marketActivationBlueprintTesting.zigZag.items.3.title",
          description: "solutions.marketActivationBlueprintTesting.zigZag.items.3.description",
          buttonLabel: "solutions.marketActivationBlueprintTesting.zigZag.items.3.buttonLabel",
          buttonLink: "",
          image: "/images/heatmaps.png",
        },
      ],
    },
    useCases: {
      title: "solutions.marketActivationBlueprintTesting.useCases.title",
      subtitle: "solutions.marketActivationBlueprintTesting.useCases.subtitle",
      otherSubtitle: "solutions.marketActivationBlueprintTesting.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.marketActivationBlueprintTesting.useCases.cases.0.title",
          subheadline: "solutions.marketActivationBlueprintTesting.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.marketActivationBlueprintTesting.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.marketActivationBlueprintTesting.useCases.cases.1.title",
          subheadline: "solutions.marketActivationBlueprintTesting.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.marketActivationBlueprintTesting.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.marketActivationBlueprintTesting.useCases.cases.2.title",
          subheadline: "solutions.marketActivationBlueprintTesting.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.marketActivationBlueprintTesting.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.marketActivationBlueprintTesting.useCases.cases.3.title",
          subheadline: "solutions.marketActivationBlueprintTesting.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.marketActivationBlueprintTesting.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.marketActivationBlueprintTesting.useCases.cases.4.title",
          subheadline: "solutions.marketActivationBlueprintTesting.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.marketActivationBlueprintTesting.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.marketActivationBlueprintTesting.useCases.cases.5.title",
          subheadline: "solutions.marketActivationBlueprintTesting.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.marketActivationBlueprintTesting.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.marketActivationBlueprintTesting.useCases.cases.6.title",
          subheadline: "solutions.marketActivationBlueprintTesting.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.marketActivationBlueprintTesting.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.marketActivationBlueprintTesting.useCases.cases.7.title",
          subheadline: "solutions.marketActivationBlueprintTesting.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.marketActivationBlueprintTesting.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.marketActivationBlueprintTesting.questions.title",
      items: [
        {
          title: "solutions.marketActivationBlueprintTesting.questions.items.0.title",
          description: "solutions.marketActivationBlueprintTesting.questions.items.0.description",
        },
        {
          title: "solutions.marketActivationBlueprintTesting.questions.items.1.title",
          description: "solutions.marketActivationBlueprintTesting.questions.items.2.description",
        },
        {
          title: "solutions.marketActivationBlueprintTesting.questions.items.2.title",
          description: "solutions.marketActivationBlueprintTesting.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.marketActivationBlueprintTesting.cta.title",
      subtitle: "solutions.marketActivationBlueprintTesting.cta.subtitle",
      primaryButton: "solutions.marketActivationBlueprintTesting.cta.primaryButton",
      secondaryButton: "solutions.marketActivationBlueprintTesting.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "intervention-impact-simulation",
    name: "solutions.interventionImpactSimulation.name",
    title: "solutions.interventionImpactSimulation.title",
    category: "Activation",
    description: "solutions.interventionImpactSimulation.description",
    hero: {
      headline: "solutions.interventionImpactSimulation.hero.headline",
      subheadline: "solutions.interventionImpactSimulation.hero.subheadline",
      image: "/images/media-testing.jpg",
      benefits: [],
      ctaPrimary: "solutions.interventionImpactSimulation.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.interventionImpactSimulation.hero.ctaSecondary",
    },
    features: {
      title: "solutions.interventionImpactSimulation.features.title",
      subheadline: "solutions.interventionImpactSimulation.features.subheadline",
      subtitle: "solutions.interventionImpactSimulation.features.subtitle",
      nbrOfItems: 2,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.interventionImpactSimulation.features.items.0.title",
          description: "solutions.interventionImpactSimulation.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.interventionImpactSimulation.features.items.1.title",
          description: "solutions.interventionImpactSimulation.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.interventionImpactSimulation.features.items.2.title",
          description: "solutions.interventionImpactSimulation.features.items.2.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.interventionImpactSimulation.features.items.2.title",
          description: "solutions.interventionImpactSimulation.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.interventionImpactSimulation.zigZag.title",
      items: [
        {
          eyebrow: "solutions.interventionImpactSimulation.zigZag.items.0.eyebrow",
          title: "solutions.interventionImpactSimulation.zigZag.items.0.title",
          description: "solutions.interventionImpactSimulation.zigZag.items.0.description",
          buttonLabel: "solutions.interventionImpactSimulation.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.interventionImpactSimulation.zigZag.items.1.eyebrow",
          title: "solutions.interventionImpactSimulation.zigZag.items.1.title",
          description: "solutions.interventionImpactSimulation.zigZag.items.1.description",
          buttonLabel: "solutions.interventionImpactSimulation.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.interventionImpactSimulation.zigZag.items.2.eyebrow",
          title: "solutions.interventionImpactSimulation.zigZag.items.2.title",
          description: "solutions.interventionImpactSimulation.zigZag.items.2.description",
          buttonLabel: "solutions.interventionImpactSimulation.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
        {
          eyebrow: "solutions.interventionImpactSimulation.zigZag.items.3.eyebrow",
          title: "solutions.interventionImpactSimulation.zigZag.items.3.title",
          description: "solutions.interventionImpactSimulation.zigZag.items.3.description",
          buttonLabel: "solutions.interventionImpactSimulation.zigZag.items.3.buttonLabel",
          buttonLink: "",
          image: "/images/heatmaps.png",
        },
      ],
    },
    useCases: {
      title: "solutions.interventionImpactSimulation.useCases.title",
      subtitle: "solutions.interventionImpactSimulation.useCases.subtitle",
      otherSubtitle: "solutions.interventionImpactSimulation.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.interventionImpactSimulation.useCases.cases.0.title",
          subheadline: "solutions.interventionImpactSimulation.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.interventionImpactSimulation.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.interventionImpactSimulation.useCases.cases.1.title",
          subheadline: "solutions.interventionImpactSimulation.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.interventionImpactSimulation.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.interventionImpactSimulation.useCases.cases.2.title",
          subheadline: "solutions.interventionImpactSimulation.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.interventionImpactSimulation.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.interventionImpactSimulation.useCases.cases.3.title",
          subheadline: "solutions.interventionImpactSimulation.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.interventionImpactSimulation.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.interventionImpactSimulation.useCases.cases.4.title",
          subheadline: "solutions.interventionImpactSimulation.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.interventionImpactSimulation.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.interventionImpactSimulation.useCases.cases.5.title",
          subheadline: "solutions.interventionImpactSimulation.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.interventionImpactSimulation.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.interventionImpactSimulation.useCases.cases.6.title",
          subheadline: "solutions.interventionImpactSimulation.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.interventionImpactSimulation.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.interventionImpactSimulation.useCases.cases.7.title",
          subheadline: "solutions.interventionImpactSimulation.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.interventionImpactSimulation.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.interventionImpactSimulation.questions.title",
      items: [
        {
          title: "solutions.interventionImpactSimulation.questions.items.0.title",
          description: "solutions.interventionImpactSimulation.questions.items.0.description",
        },
        {
          title: "solutions.interventionImpactSimulation.questions.items.1.title",
          description: "solutions.interventionImpactSimulation.questions.items.2.description",
        },
        {
          title: "solutions.interventionImpactSimulation.questions.items.2.title",
          description: "solutions.interventionImpactSimulation.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.interventionImpactSimulation.cta.title",
      subtitle: "solutions.interventionImpactSimulation.cta.subtitle",
      primaryButton: "solutions.interventionImpactSimulation.cta.primaryButton",
      secondaryButton: "solutions.interventionImpactSimulation.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "concept-and-creative-route-screening",
    name: "solutions.conceptAndCreativeRouteScreening.name",
    title: "solutions.conceptAndCreativeRouteScreening.title",
    category: "Activation",
    description: "solutions.conceptAndCreativeRouteScreening.description",
    hero: {
      headline: "solutions.conceptAndCreativeRouteScreening.hero.headline",
      subheadline: "solutions.conceptAndCreativeRouteScreening.hero.subheadline",
      image: "/images/media-testing.jpg",
      benefits: [],
      ctaPrimary: "solutions.conceptAndCreativeRouteScreening.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.conceptAndCreativeRouteScreening.hero.ctaSecondary",
    },
    features: {
      title: "solutions.conceptAndCreativeRouteScreening.features.title",
      subheadline: "solutions.conceptAndCreativeRouteScreening.features.subheadline",
      subtitle: "solutions.conceptAndCreativeRouteScreening.features.subtitle",
      nbrOfItems: 2,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.conceptAndCreativeRouteScreening.features.items.0.title",
          description: "solutions.conceptAndCreativeRouteScreening.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.conceptAndCreativeRouteScreening.features.items.1.title",
          description: "solutions.conceptAndCreativeRouteScreening.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.conceptAndCreativeRouteScreening.features.items.2.title",
          description: "solutions.conceptAndCreativeRouteScreening.features.items.2.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.conceptAndCreativeRouteScreening.features.items.2.title",
          description: "solutions.conceptAndCreativeRouteScreening.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.conceptAndCreativeRouteScreening.zigZag.title",
      items: [
        {
          eyebrow: "solutions.conceptAndCreativeRouteScreening.zigZag.items.0.eyebrow",
          title: "solutions.conceptAndCreativeRouteScreening.zigZag.items.0.title",
          description: "solutions.conceptAndCreativeRouteScreening.zigZag.items.0.description",
          buttonLabel: "solutions.conceptAndCreativeRouteScreening.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.conceptAndCreativeRouteScreening.zigZag.items.1.eyebrow",
          title: "solutions.conceptAndCreativeRouteScreening.zigZag.items.1.title",
          description: "solutions.conceptAndCreativeRouteScreening.zigZag.items.1.description",
          buttonLabel: "solutions.conceptAndCreativeRouteScreening.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.conceptAndCreativeRouteScreening.zigZag.items.2.eyebrow",
          title: "solutions.conceptAndCreativeRouteScreening.zigZag.items.2.title",
          description: "solutions.conceptAndCreativeRouteScreening.zigZag.items.2.description",
          buttonLabel: "solutions.conceptAndCreativeRouteScreening.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
        {
          eyebrow: "solutions.conceptAndCreativeRouteScreening.zigZag.items.3.eyebrow",
          title: "solutions.conceptAndCreativeRouteScreening.zigZag.items.3.title",
          description: "solutions.conceptAndCreativeRouteScreening.zigZag.items.3.description",
          buttonLabel: "solutions.conceptAndCreativeRouteScreening.zigZag.items.3.buttonLabel",
          buttonLink: "",
          image: "/images/heatmaps.png",
        },
      ],
    },
    useCases: {
      title: "solutions.conceptAndCreativeRouteScreening.useCases.title",
      subtitle: "solutions.conceptAndCreativeRouteScreening.useCases.subtitle",
      otherSubtitle: "solutions.conceptAndCreativeRouteScreening.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.conceptAndCreativeRouteScreening.useCases.cases.0.title",
          subheadline: "solutions.conceptAndCreativeRouteScreening.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.conceptAndCreativeRouteScreening.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.conceptAndCreativeRouteScreening.useCases.cases.1.title",
          subheadline: "solutions.conceptAndCreativeRouteScreening.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.conceptAndCreativeRouteScreening.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.conceptAndCreativeRouteScreening.useCases.cases.2.title",
          subheadline: "solutions.conceptAndCreativeRouteScreening.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.conceptAndCreativeRouteScreening.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.conceptAndCreativeRouteScreening.useCases.cases.3.title",
          subheadline: "solutions.conceptAndCreativeRouteScreening.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.conceptAndCreativeRouteScreening.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.conceptAndCreativeRouteScreening.useCases.cases.4.title",
          subheadline: "solutions.conceptAndCreativeRouteScreening.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.conceptAndCreativeRouteScreening.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.conceptAndCreativeRouteScreening.useCases.cases.5.title",
          subheadline: "solutions.conceptAndCreativeRouteScreening.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.conceptAndCreativeRouteScreening.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.conceptAndCreativeRouteScreening.useCases.cases.6.title",
          subheadline: "solutions.conceptAndCreativeRouteScreening.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.conceptAndCreativeRouteScreening.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.conceptAndCreativeRouteScreening.useCases.cases.7.title",
          subheadline: "solutions.conceptAndCreativeRouteScreening.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.conceptAndCreativeRouteScreening.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.conceptAndCreativeRouteScreening.questions.title",
      items: [
        {
          title: "solutions.conceptAndCreativeRouteScreening.questions.items.0.title",
          description: "solutions.conceptAndCreativeRouteScreening.questions.items.0.description",
        },
        {
          title: "solutions.conceptAndCreativeRouteScreening.questions.items.1.title",
          description: "solutions.conceptAndCreativeRouteScreening.questions.items.2.description",
        },
        {
          title: "solutions.conceptAndCreativeRouteScreening.questions.items.2.title",
          description: "solutions.conceptAndCreativeRouteScreening.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.conceptAndCreativeRouteScreening.cta.title",
      subtitle: "solutions.conceptAndCreativeRouteScreening.cta.subtitle",
      primaryButton: "solutions.conceptAndCreativeRouteScreening.cta.primaryButton",
      secondaryButton: "solutions.conceptAndCreativeRouteScreening.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "attention-and-emotion-testing",
    name: "solutions.attentionAndEmotionTesting.name",
    title: "solutions.attentionAndEmotionTesting.title",
    category: "Activation",
    description: "solutions.attentionAndEmotionTesting.description",
    hero: {
      headline: "solutions.attentionAndEmotionTesting.hero.headline",
      subheadline: "solutions.attentionAndEmotionTesting.hero.subheadline",
      image: "/images/media-testing.jpg",
      benefits: [],
      ctaPrimary: "solutions.attentionAndEmotionTesting.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.attentionAndEmotionTesting.hero.ctaSecondary",
    },
    features: {
      title: "solutions.attentionAndEmotionTesting.features.title",
      subheadline: "solutions.attentionAndEmotionTesting.features.subheadline",
      subtitle: "solutions.attentionAndEmotionTesting.features.subtitle",
      nbrOfItems: 2,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.attentionAndEmotionTesting.features.items.0.title",
          description: "solutions.attentionAndEmotionTesting.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.attentionAndEmotionTesting.features.items.1.title",
          description: "solutions.attentionAndEmotionTesting.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.attentionAndEmotionTesting.features.items.2.title",
          description: "solutions.attentionAndEmotionTesting.features.items.2.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.attentionAndEmotionTesting.features.items.2.title",
          description: "solutions.attentionAndEmotionTesting.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.attentionAndEmotionTesting.zigZag.title",
      items: [
        {
          eyebrow: "solutions.attentionAndEmotionTesting.zigZag.items.0.eyebrow",
          title: "solutions.attentionAndEmotionTesting.zigZag.items.0.title",
          description: "solutions.attentionAndEmotionTesting.zigZag.items.0.description",
          buttonLabel: "solutions.attentionAndEmotionTesting.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.attentionAndEmotionTesting.zigZag.items.1.eyebrow",
          title: "solutions.attentionAndEmotionTesting.zigZag.items.1.title",
          description: "solutions.attentionAndEmotionTesting.zigZag.items.1.description",
          buttonLabel: "solutions.attentionAndEmotionTesting.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.attentionAndEmotionTesting.zigZag.items.2.eyebrow",
          title: "solutions.attentionAndEmotionTesting.zigZag.items.2.title",
          description: "solutions.attentionAndEmotionTesting.zigZag.items.2.description",
          buttonLabel: "solutions.attentionAndEmotionTesting.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
        {
          eyebrow: "solutions.attentionAndEmotionTesting.zigZag.items.3.eyebrow",
          title: "solutions.attentionAndEmotionTesting.zigZag.items.3.title",
          description: "solutions.attentionAndEmotionTesting.zigZag.items.3.description",
          buttonLabel: "solutions.attentionAndEmotionTesting.zigZag.items.3.buttonLabel",
          buttonLink: "",
          image: "/images/heatmaps.png",
        },
      ],
    },
    useCases: {
      title: "solutions.attentionAndEmotionTesting.useCases.title",
      subtitle: "solutions.attentionAndEmotionTesting.useCases.subtitle",
      otherSubtitle: "solutions.attentionAndEmotionTesting.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.attentionAndEmotionTesting.useCases.cases.0.title",
          subheadline: "solutions.attentionAndEmotionTesting.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.attentionAndEmotionTesting.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.attentionAndEmotionTesting.useCases.cases.1.title",
          subheadline: "solutions.attentionAndEmotionTesting.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.attentionAndEmotionTesting.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.attentionAndEmotionTesting.useCases.cases.2.title",
          subheadline: "solutions.attentionAndEmotionTesting.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.attentionAndEmotionTesting.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.attentionAndEmotionTesting.useCases.cases.3.title",
          subheadline: "solutions.attentionAndEmotionTesting.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.attentionAndEmotionTesting.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.attentionAndEmotionTesting.useCases.cases.4.title",
          subheadline: "solutions.attentionAndEmotionTesting.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.attentionAndEmotionTesting.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.attentionAndEmotionTesting.useCases.cases.5.title",
          subheadline: "solutions.attentionAndEmotionTesting.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.attentionAndEmotionTesting.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.attentionAndEmotionTesting.useCases.cases.6.title",
          subheadline: "solutions.attentionAndEmotionTesting.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.attentionAndEmotionTesting.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.attentionAndEmotionTesting.useCases.cases.7.title",
          subheadline: "solutions.attentionAndEmotionTesting.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.attentionAndEmotionTesting.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.attentionAndEmotionTesting.questions.title",
      items: [
        {
          title: "solutions.attentionAndEmotionTesting.questions.items.0.title",
          description: "solutions.attentionAndEmotionTesting.questions.items.0.description",
        },
        {
          title: "solutions.attentionAndEmotionTesting.questions.items.1.title",
          description: "solutions.attentionAndEmotionTesting.questions.items.2.description",
        },
        {
          title: "solutions.attentionAndEmotionTesting.questions.items.2.title",
          description: "solutions.attentionAndEmotionTesting.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.attentionAndEmotionTesting.cta.title",
      subtitle: "solutions.attentionAndEmotionTesting.cta.subtitle",
      primaryButton: "solutions.attentionAndEmotionTesting.cta.primaryButton",
      secondaryButton: "solutions.attentionAndEmotionTesting.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "customer-satisfaction-analysis",
    name: "solutions.customerSatisfactionAnalysis.name",
    title: "solutions.customerSatisfactionAnalysis.title",
    category: "Tracking",
    description: "solutions.customerSatisfactionAnalysis.description",
    hero: {
      headline: "solutions.customerSatisfactionAnalysis.hero.headline",
      subheadline: "solutions.customerSatisfactionAnalysis.hero.subheadline",
      image: "/images/customer-satisfaction-analysis.jpg",
      benefits: [],
      ctaPrimary: "solutions.customerSatisfactionAnalysis.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.customerSatisfactionAnalysis.hero.ctaSecondary",
    },
    features: {
      title: "solutions.customerSatisfactionAnalysis.features.title",
      subheadline: "solutions.customerSatisfactionAnalysis.features.subheadline",
      subtitle: "solutions.customerSatisfactionAnalysis.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.customerSatisfactionAnalysis.features.items.0.title",
          description: "solutions.customerSatisfactionAnalysis.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.customerSatisfactionAnalysis.features.items.1.title",
          description: "solutions.customerSatisfactionAnalysis.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.customerSatisfactionAnalysis.features.items.2.title",
          description: "solutions.customerSatisfactionAnalysis.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.customerSatisfactionAnalysis.zigZag.title",
      items: [
        {
          eyebrow: "solutions.customerSatisfactionAnalysis.zigZag.items.0.eyebrow",
          title: "solutions.customerSatisfactionAnalysis.zigZag.items.0.title",
          description: "solutions.customerSatisfactionAnalysis.zigZag.items.0.description",
          buttonLabel: "solutions.customerSatisfactionAnalysis.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.customerSatisfactionAnalysis.zigZag.items.1.eyebrow",
          title: "solutions.customerSatisfactionAnalysis.zigZag.items.1.title",
          description: "solutions.customerSatisfactionAnalysis.zigZag.items.1.description",
          buttonLabel: "solutions.customerSatisfactionAnalysis.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.customerSatisfactionAnalysis.useCases.title",
      subtitle: "solutions.customerSatisfactionAnalysis.useCases.subtitle",
      otherSubtitle: "solutions.customerSatisfactionAnalysis.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.customerSatisfactionAnalysis.useCases.cases.0.title",
          subheadline: "solutions.customerSatisfactionAnalysis.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.customerSatisfactionAnalysis.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.customerSatisfactionAnalysis.useCases.cases.1.title",
          subheadline: "solutions.customerSatisfactionAnalysis.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.customerSatisfactionAnalysis.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.customerSatisfactionAnalysis.useCases.cases.2.title",
          subheadline: "solutions.customerSatisfactionAnalysis.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.customerSatisfactionAnalysis.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.customerSatisfactionAnalysis.useCases.cases.3.title",
          subheadline: "solutions.customerSatisfactionAnalysis.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.customerSatisfactionAnalysis.useCases.cases.3.description",
        },
      ],
    },
    questions: {
      title: "solutions.customerSatisfactionAnalysis.questions.title",
      items: [
        {
          title: "solutions.customerSatisfactionAnalysis.questions.items.0.title",
          description: "solutions.customerSatisfactionAnalysis.questions.items.0.description",
        },
        {
          title: "solutions.customerSatisfactionAnalysis.questions.items.1.title",
          description: "solutions.customerSatisfactionAnalysis.questions.items.2.description",
        },
        {
          title: "solutions.customerSatisfactionAnalysis.questions.items.2.title",
          description: "solutions.customerSatisfactionAnalysis.questions.items.2.description",
        },
      ],
    },
    cta: {
      title: "solutions.customerSatisfactionAnalysis.cta.title",
      subtitle: "solutions.customerSatisfactionAnalysis.cta.subtitle",
      primaryButton: "solutions.customerSatisfactionAnalysis.cta.primaryButton",
      secondaryButton: "solutions.customerSatisfactionAnalysis.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "product-development",
    name: "solutions.productDevelopment.name",
    title: "solutions.productDevelopment.title",
    category: "Innovation",
    description: "solutions.productDevelopment.description",
    hero: {
      headline: "solutions.productDevelopment.hero.headline",
      subheadline: "solutions.productDevelopment.hero.subheadline",
      image: "/images/product-development.jpg",
      benefits: [],
      ctaPrimary: "solutions.productDevelopment.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.productDevelopment.hero.ctaSecondary",
    },
    features: {
      title: "solutions.productDevelopment.features.title",
      subheadline: "solutions.productDevelopment.features.subheadline",
      subtitle: "solutions.productDevelopment.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.productDevelopment.features.items.0.title",
          description: "solutions.productDevelopment.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.productDevelopment.features.items.1.title",
          description: "solutions.productDevelopment.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.productDevelopment.features.items.2.title",
          description: "solutions.productDevelopment.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.productDevelopment.zigZag.title",
      items: [
        {
          eyebrow: "solutions.productDevelopment.zigZag.items.0.eyebrow",
          title: "solutions.productDevelopment.zigZag.items.0.title",
          description: "solutions.productDevelopment.zigZag.items.0.description",
          buttonLabel: "solutions.productDevelopment.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.productDevelopment.zigZag.items.1.eyebrow",
          title: "solutions.productDevelopment.zigZag.items.1.title",
          description: "solutions.productDevelopment.zigZag.items.1.description",
          buttonLabel: "solutions.productDevelopment.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.productDevelopment.zigZag.items.2.eyebrow",
          title: "solutions.productDevelopment.zigZag.items.2.title",
          description: "solutions.productDevelopment.zigZag.items.2.description",
          buttonLabel: "solutions.productDevelopment.zigZag.items.2.buttonLabel",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.productDevelopment.useCases.title",
      subtitle: "solutions.productDevelopment.useCases.subtitle",
      otherSubtitle: "solutions.productDevelopment.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.productDevelopment.useCases.cases.0.title",
          subheadline: "solutions.productDevelopment.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.productDevelopment.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.productDevelopment.useCases.cases.1.title",
          subheadline: "solutions.productDevelopment.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.productDevelopment.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.productDevelopment.useCases.cases.2.title",
          subheadline: "solutions.productDevelopment.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.productDevelopment.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.productDevelopment.useCases.cases.3.title",
          subheadline: "solutions.productDevelopment.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.productDevelopment.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.productDevelopment.useCases.cases.4.title",
          subheadline: "solutions.productDevelopment.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.productDevelopment.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.productDevelopment.useCases.cases.5.title",
          subheadline: "solutions.productDevelopment.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.productDevelopment.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.productDevelopment.useCases.cases.6.title",
          subheadline: "solutions.productDevelopment.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.productDevelopment.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.productDevelopment.useCases.cases.7.title",
          subheadline: "solutions.productDevelopment.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.productDevelopment.useCases.cases.7.description",
        },
      ],
    },
    questions: {
      title: "solutions.productDevelopment.questions.title",
      items: [
        {
          title: "solutions.productDevelopment.questions.items.0.title",
          description: "solutions.productDevelopment.questions.items.0.description",
        },
        {
          title: "solutions.productDevelopment.questions.items.1.title",
          description: "solutions.productDevelopment.questions.items.2.description",
        },
        {
          title: "solutions.productDevelopment.questions.items.2.title",
          description: "solutions.productDevelopment.questions.items.2.description",
        },
        {
          title: "solutions.productDevelopment.questions.items.3.title",
          description: "solutions.productDevelopment.questions.items.2.description",
        },
        {
          title: "solutions.productDevelopment.questions.items.4.title",
          description: "solutions.productDevelopment.questions.items.4.description",
        },
        {
          title: "solutions.productDevelopment.questions.items.5.title",
          description: "solutions.productDevelopment.questions.items.5.description",
        },
      ],
    },
    cta: {
      title: "solutions.productDevelopment.cta.title",
      subtitle: "solutions.productDevelopment.cta.subtitle",
      primaryButton: "solutions.productDevelopment.cta.primaryButton",
      secondaryButton: "solutions.productDevelopment.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "in-home-use-testing",
    name: "solutions.inHomeUseTesting.name",
    title: "solutions.inHomeUseTesting.title",
    category: "Innovation",
    description: "solutions.inHomeUseTesting.description",
    hero: {
      headline: "solutions.inHomeUseTesting.hero.headline",
      subheadline: "solutions.inHomeUseTesting.hero.subheadline",
      image: "/images/in-home-use-testing.jpg",
      benefits: [],
      ctaPrimary: "solutions.inHomeUseTesting.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.inHomeUseTesting.hero.ctaSecondary",
    },
    features: {
      title: "solutions.inHomeUseTesting.features.title",
      subheadline: "solutions.inHomeUseTesting.features.subheadline",
      subtitle: "solutions.inHomeUseTesting.features.subtitle",
      nbrOfItems: 4,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.inHomeUseTesting.features.items.0.title",
          description: "solutions.inHomeUseTesting.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.inHomeUseTesting.features.items.1.title",
          description: "solutions.inHomeUseTesting.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.inHomeUseTesting.features.items.2.title",
          description: "solutions.inHomeUseTesting.features.items.2.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.inHomeUseTesting.features.items.3.title",
          description: "solutions.inHomeUseTesting.features.items.3.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.inHomeUseTesting.features.items.4.title",
          description: "solutions.inHomeUseTesting.features.items.4.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.inHomeUseTesting.features.items.5.title",
          description: "solutions.inHomeUseTesting.features.items.5.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.inHomeUseTesting.features.items.6.title",
          description: "solutions.inHomeUseTesting.features.items.6.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.inHomeUseTesting.features.items.7.title",
          description: "solutions.inHomeUseTesting.features.items.7.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.inHomeUseTesting.features.items.8.title",
          description: "solutions.inHomeUseTesting.features.items.8.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.inHomeUseTesting.zigZag.title",
      items: [
        {
          eyebrow: "solutions.inHomeUseTesting.zigZag.items.0.eyebrow",
          title: "solutions.inHomeUseTesting.zigZag.items.0.title",
          description: "solutions.inHomeUseTesting.zigZag.items.0.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.inHomeUseTesting.zigZag.items.1.eyebrow",
          title: "solutions.inHomeUseTesting.zigZag.items.1.title",
          description: "solutions.inHomeUseTesting.zigZag.items.1.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.inHomeUseTesting.zigZag.items.2.eyebrow",
          title: "solutions.inHomeUseTesting.zigZag.items.2.title",
          description: "solutions.inHomeUseTesting.zigZag.items.2.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.inHomeUseTesting.useCases.title",
      subtitle: "solutions.inHomeUseTesting.useCases.subtitle",
      otherSubtitle: "solutions.inHomeUseTesting.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.inHomeUseTesting.useCases.cases.0.title",
          subheadline: "solutions.inHomeUseTesting.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.inHomeUseTesting.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.inHomeUseTesting.useCases.cases.1.title",
          subheadline: "solutions.inHomeUseTesting.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.inHomeUseTesting.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.inHomeUseTesting.useCases.cases.2.title",
          subheadline: "solutions.inHomeUseTesting.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.inHomeUseTesting.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.inHomeUseTesting.useCases.cases.3.title",
          subheadline: "solutions.inHomeUseTesting.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.inHomeUseTesting.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "solutions.inHomeUseTesting.useCases.cases.4.title",
          subheadline: "solutions.inHomeUseTesting.useCases.cases.4.subheadline",
          benefits: [],
          description: "solutions.inHomeUseTesting.useCases.cases.4.description",
        },
        {
          icon: "ChartPie",
          title: "solutions.inHomeUseTesting.useCases.cases.5.title",
          subheadline: "solutions.inHomeUseTesting.useCases.cases.5.subheadline",
          benefits: [],
          description: "solutions.inHomeUseTesting.useCases.cases.5.description",
        },
        {
          icon: "ShoppingCart",
          title: "solutions.inHomeUseTesting.useCases.cases.6.title",
          subheadline: "solutions.inHomeUseTesting.useCases.cases.6.subheadline",
          benefits: [],
          description: "solutions.inHomeUseTesting.useCases.cases.6.description",
        },
        {
          icon: "MessagesSquare",
          title: "solutions.inHomeUseTesting.useCases.cases.7.title",
          subheadline: "solutions.inHomeUseTesting.useCases.cases.7.subheadline",
          benefits: [],
          description: "solutions.inHomeUseTesting.useCases.cases.7.description",
        },
      ],
    },
    accordion: {
      title: "solutions.inHomeUseTesting.accordion.title",
      items: [
        {
          question: "solutions.inHomeUseTesting.accordion.items.0.question",
          answer: "solutions.inHomeUseTesting.accordion.items.0.answer",
        },
        {
          question: "solutions.inHomeUseTesting.accordion.items.1.question",
          answer: "solutions.inHomeUseTesting.accordion.items.1.answer",
        },
        {
          question: "solutions.inHomeUseTesting.accordion.items.2.question",
          answer: "solutions.inHomeUseTesting.accordion.items.2.answer",
        },
        {
          question: "solutions.inHomeUseTesting.accordion.items.3.question",
          answer: "solutions.inHomeUseTesting.accordion.items.3.answer",
        },
        {
          question: "solutions.inHomeUseTesting.accordion.items.4.question",
          answer: "solutions.inHomeUseTesting.accordion.items.4.answer",
        }
      ]
    },
    cta: {
      title: "solutions.inHomeUseTesting.cta.title",
      subtitle: "solutions.inHomeUseTesting.cta.subtitle",
      primaryButton: "solutions.inHomeUseTesting.cta.primaryButton",
      secondaryButton: "solutions.inHomeUseTesting.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "psychographic-target-group-analysis",
    name: "solutions.targetGroupAnalysis.name",
    title: "solutions.targetGroupAnalysis.title",
    category: "Strategy",
    description: "solutions.targetGroupAnalysis.description",
    hero: {
      headline: "solutions.targetGroupAnalysis.hero.headline",
      subheadline: "solutions.targetGroupAnalysis.hero.subheadline",
      image: "/images/psychographic-target-group-analysis.jpg",
      benefits: [],
      ctaPrimary: "solutions.targetGroupAnalysis.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.targetGroupAnalysis.hero.ctaSecondary",
    },
    features: {
      title: "solutions.targetGroupAnalysis.features.title",
      subheadline: "solutions.targetGroupAnalysis.features.subheadline",
      subtitle: "solutions.targetGroupAnalysis.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.targetGroupAnalysis.features.items.0.title",
          description: "solutions.targetGroupAnalysis.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.targetGroupAnalysis.features.items.1.title",
          description: "solutions.targetGroupAnalysis.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.targetGroupAnalysis.features.items.2.title",
          description: "solutions.targetGroupAnalysis.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.targetGroupAnalysis.zigZag.title",
      items: [
        {
          eyebrow: "solutions.targetGroupAnalysis.zigZag.items.0.eyebrow",
          title: "solutions.targetGroupAnalysis.zigZag.items.0.title",
          description: "solutions.targetGroupAnalysis.zigZag.items.0.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.targetGroupAnalysis.zigZag.items.1.eyebrow",
          title: "solutions.targetGroupAnalysis.zigZag.items.1.title",
          description: "solutions.targetGroupAnalysis.zigZag.items.1.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.targetGroupAnalysis.zigZag.items.2.eyebrow",
          title: "solutions.targetGroupAnalysis.zigZag.items.2.title",
          description: "solutions.targetGroupAnalysis.zigZag.items.2.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.targetGroupAnalysis.useCases.title",
      subtitle: "solutions.targetGroupAnalysis.useCases.subtitle",
      otherSubtitle: "solutions.targetGroupAnalysis.useCases.otherSubtitle",
      nbrOfItems: 4,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.targetGroupAnalysis.useCases.cases.0.title",
          subheadline: "solutions.targetGroupAnalysis.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.targetGroupAnalysis.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.targetGroupAnalysis.useCases.cases.1.title",
          subheadline: "solutions.targetGroupAnalysis.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.targetGroupAnalysis.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.targetGroupAnalysis.useCases.cases.2.title",
          subheadline: "solutions.targetGroupAnalysis.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.targetGroupAnalysis.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.targetGroupAnalysis.useCases.cases.3.title",
          subheadline: "solutions.targetGroupAnalysis.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.targetGroupAnalysis.useCases.cases.3.description",
        },
      ],
    },
    questions: {
      title: "solutions.targetGroupAnalysis.questions.title",
      items: [
        {
          title: "solutions.targetGroupAnalysis.questions.items.0.title",
          description: "solutions.targetGroupAnalysis.questions.items.0.description",
        },
        {
          title: "solutions.targetGroupAnalysis.questions.items.1.title",
          description: "solutions.targetGroupAnalysis.questions.items.1.description",
        },
        {
          title: "solutions.targetGroupAnalysis.questions.items.2.title",
          description: "solutions.targetGroupAnalysis.questions.items.2.description",
        },
        {
          title: "solutions.targetGroupAnalysis.questions.items.3.title",
          description: "solutions.targetGroupAnalysis.questions.items.3.description",
        },
      ],
    },
    accordion: {
      title: "solutions.targetGroupAnalysis.accordion.title",
      items: [
        {
          question: "solutions.targetGroupAnalysis.accordion.items.0.question",
          answer: "solutions.targetGroupAnalysis.accordion.items.0.answer",
        },
        {
          question: "solutions.targetGroupAnalysis.accordion.items.1.question",
          answer: "solutions.targetGroupAnalysis.accordion.items.1.answer",
        },
        {
          question: "solutions.targetGroupAnalysis.accordion.items.2.question",
          answer: "solutions.targetGroupAnalysis.accordion.items.2.answer",
        },
        {
          question: "solutions.targetGroupAnalysis.accordion.items.3.question",
          answer: "solutions.targetGroupAnalysis.accordion.items.3.answer",
        },
        {
          question: "solutions.targetGroupAnalysis.accordion.items.4.question",
          answer: "solutions.targetGroupAnalysis.accordion.items.4.answer",
        },
        {
          question: "solutions.targetGroupAnalysis.accordion.items.5.question",
          answer: "solutions.targetGroupAnalysis.accordion.items.5.answer",
        },
        {
          question: "solutions.targetGroupAnalysis.accordion.items.6.question",
          answer: "solutions.targetGroupAnalysis.accordion.items.6.answer",
        },
      ]
    },
    cta: {
      title: "solutions.targetGroupAnalysis.cta.title",
      subtitle: "solutions.targetGroupAnalysis.cta.subtitle",
      primaryButton: "solutions.targetGroupAnalysis.cta.primaryButton",
      secondaryButton: "solutions.targetGroupAnalysis.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "market-analysis",
    name: "solutions.marketAnalysis.name",
    title: "solutions.marketAnalysis.title",
    category: "Strategy",
    description: "solutions.marketAnalysis.description",
    hero: {
      headline: "solutions.marketAnalysis.hero.headline",
      subheadline: "solutions.marketAnalysis.hero.subheadline",
      image: "/images/market-analysis.jpg",
      benefits: [],
      ctaPrimary: "solutions.marketAnalysis.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.marketAnalysis.hero.ctaSecondary",
    },
    features: {
      title: "solutions.marketAnalysis.features.title",
      subheadline: "solutions.marketAnalysis.features.subheadline",
      subtitle: "solutions.marketAnalysis.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.marketAnalysis.features.items.0.title",
          description: "solutions.marketAnalysis.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.marketAnalysis.features.items.1.title",
          description: "solutions.marketAnalysis.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.marketAnalysis.features.items.2.title",
          description: "solutions.marketAnalysis.features.items.2.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.marketAnalysis.zigZag.title",
      items: [
        {
          eyebrow: "solutions.marketAnalysis.zigZag.items.0.eyebrow",
          title: "solutions.marketAnalysis.zigZag.items.0.title",
          description: "solutions.marketAnalysis.zigZag.items.0.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.marketAnalysis.zigZag.items.1.eyebrow",
          title: "solutions.marketAnalysis.zigZag.items.1.title",
          description: "solutions.marketAnalysis.zigZag.items.1.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
        {
          eyebrow: "solutions.marketAnalysis.zigZag.items.2.eyebrow",
          title: "solutions.marketAnalysis.zigZag.items.2.title",
          description: "solutions.marketAnalysis.zigZag.items.2.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/shelf-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.marketAnalysis.useCases.title",
      subtitle: "solutions.marketAnalysis.useCases.subtitle",
      otherSubtitle: "solutions.marketAnalysis.useCases.otherSubtitle",
      nbrOfItems: 2,
      cases: [
        {
          icon: "HeartPulse",
          title: "solutions.marketAnalysis.useCases.cases.0.title",
          subheadline: "solutions.marketAnalysis.useCases.cases.0.subheadline",
          benefits: [],
          description: "solutions.marketAnalysis.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.marketAnalysis.useCases.cases.1.title",
          subheadline: "solutions.marketAnalysis.useCases.cases.1.subheadline",
          benefits: [],
          description: "solutions.marketAnalysis.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "solutions.marketAnalysis.useCases.cases.2.title",
          subheadline: "solutions.marketAnalysis.useCases.cases.2.subheadline",
          benefits: [],
          description: "solutions.marketAnalysis.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "solutions.marketAnalysis.useCases.cases.3.title",
          subheadline: "solutions.marketAnalysis.useCases.cases.3.subheadline",
          benefits: [],
          description: "solutions.marketAnalysis.useCases.cases.3.description",
        },
      ],
    },
    questions: {
      title: "solutions.marketAnalysis.questions.title",
      items: [
        {
          title: "solutions.marketAnalysis.questions.items.0.title",
          description: "solutions.marketAnalysis.questions.items.0.description",
        },
        {
          title: "solutions.marketAnalysis.questions.items.1.title",
          description: "solutions.marketAnalysis.questions.items.1.description",
        },
        {
          title: "solutions.marketAnalysis.questions.items.2.title",
          description: "solutions.marketAnalysis.questions.items.2.description",
        },
        {
          title: "solutions.marketAnalysis.questions.items.3.title",
          description: "solutions.marketAnalysis.questions.items.3.description",
        },
      ],
    },
    cta: {
      title: "solutions.marketAnalysis.cta.title",
      subtitle: "solutions.marketAnalysis.cta.subtitle",
      primaryButton: "solutions.marketAnalysis.cta.primaryButton",
      secondaryButton: "solutions.marketAnalysis.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "consumer-brands",
    name: "solutions.consumerBrands.name",
    title: "solutions.consumerBrands.title",
    industry: "Consumer Brands",
    description: "solutions.consumerBrands.description",
    hero: {
      headline: "solutions.consumerBrands.hero.headline",
      subheadline: "solutions.consumerBrands.hero.subheadline",
      image: "/images/consumer-brands.jpg",
      benefits: [],
      ctaPrimary: "solutions.consumerBrands.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.consumerBrands.hero.ctaSecondary",
    },
    features: {
      title: "solutions.consumerBrands.features.title",
      subheadline: "solutions.consumerBrands.features.subheadline",
      subtitle: "solutions.consumerBrands.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.consumerBrands.features.items.0.title",
          description: "solutions.consumerBrands.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.consumerBrands.features.items.1.title",
          description: "solutions.consumerBrands.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.consumerBrands.features.items.2.title",
          description: "solutions.consumerBrands.features.items.2.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.consumerBrands.features.items.3.title",
          description: "solutions.consumerBrands.features.items.3.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.consumerBrands.features.items.4.title",
          description: "solutions.consumerBrands.features.items.4.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.consumerBrands.features.items.5.title",
          description: "solutions.consumerBrands.features.items.5.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.consumerBrands.zigZag.title",
      items: [
        {
          eyebrow: "solutions.consumerBrands.zigZag.items.0.eyebrow",
          title: "solutions.consumerBrands.zigZag.items.0.title",
          description: "solutions.consumerBrands.zigZag.items.0.description",
          buttonLabel: "solutions.consumerBrands.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.consumerBrands.zigZag.items.1.eyebrow",
          title: "solutions.consumerBrands.zigZag.items.1.title",
          description: "solutions.consumerBrands.zigZag.items.1.description",
          buttonLabel: "solutions.consumerBrands.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.consumerBrands.useCases.title",
      subtitle: "solutions.consumerBrands.useCases.subtitle",
      otherSubtitle: "solutions.consumerBrands.useCases.otherSubtitle",
      nbrOfItems: 3,
      cases: [
        {
          icon: "HeartPulse",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consumerBrands.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consumerBrands.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consumerBrands.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consumerBrands.useCases.cases.3.description",
        },
        {
          icon: "SquareCheck",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consumerBrands.useCases.cases.5.description",
        },
        {
          icon: "Megaphone",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consumerBrands.useCases.cases.5.description",
        },
      ],
    },
    accordion: {
      title: "solutions.consumerBrands.accordion.title",
      items: [
        {
          question: "solutions.consumerBrands.accordion.items.0.question",
          answer: "solutions.consumerBrands.accordion.items.0.answer",
        },
        {
          question: "solutions.consumerBrands.accordion.items.1.question",
          answer: "solutions.consumerBrands.accordion.items.1.answer",
        },
        {
          question: "solutions.consumerBrands.accordion.items.2.question",
          answer: "solutions.consumerBrands.accordion.items.2.answer",
        },
        {
          question: "solutions.consumerBrands.accordion.items.3.question",
          answer: "solutions.consumerBrands.accordion.items.3.answer",
        },
      ]
    },
    cta: {
      title: "solutions.consumerBrands.cta.title",
      subtitle: "solutions.consumerBrands.cta.subtitle",
      primaryButton: "solutions.consumerBrands.cta.primaryButton",
      secondaryButton: "solutions.consumerBrands.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "public-and-political-sector",
    name: "solutions.publicAndPoliticalSector.name",
    title: "solutions.publicAndPoliticalSector.title",
    industry: "Public & Political Sector",
    description: "solutions.publicAndPoliticalSector.description",
    hero: {
      headline: "solutions.publicAndPoliticalSector.hero.headline",
      subheadline: "solutions.publicAndPoliticalSector.hero.subheadline",
      image: "/images/consumer-brands.jpg",
      benefits: [],
      ctaPrimary: "solutions.publicAndPoliticalSector.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.publicAndPoliticalSector.hero.ctaSecondary",
    },
    features: {
      title: "solutions.publicAndPoliticalSector.features.title",
      subheadline: "solutions.publicAndPoliticalSector.features.subheadline",
      subtitle: "solutions.publicAndPoliticalSector.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.publicAndPoliticalSector.features.items.0.title",
          description: "solutions.publicAndPoliticalSector.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.publicAndPoliticalSector.features.items.1.title",
          description: "solutions.publicAndPoliticalSector.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.publicAndPoliticalSector.features.items.2.title",
          description: "solutions.publicAndPoliticalSector.features.items.2.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.publicAndPoliticalSector.features.items.3.title",
          description: "solutions.publicAndPoliticalSector.features.items.3.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.publicAndPoliticalSector.features.items.4.title",
          description: "solutions.publicAndPoliticalSector.features.items.4.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.publicAndPoliticalSector.features.items.5.title",
          description: "solutions.publicAndPoliticalSector.features.items.5.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.publicAndPoliticalSector.zigZag.title",
      items: [
        {
          eyebrow: "solutions.publicAndPoliticalSector.zigZag.items.0.eyebrow",
          title: "solutions.publicAndPoliticalSector.zigZag.items.0.title",
          description: "solutions.publicAndPoliticalSector.zigZag.items.0.description",
          buttonLabel: "solutions.publicAndPoliticalSector.zigZag.items.0.buttonLabel",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "solutions.publicAndPoliticalSector.zigZag.items.1.eyebrow",
          title: "solutions.publicAndPoliticalSector.zigZag.items.1.title",
          description: "solutions.publicAndPoliticalSector.zigZag.items.1.description",
          buttonLabel: "solutions.publicAndPoliticalSector.zigZag.items.1.buttonLabel",
          buttonLink: "",
          image: "/images/claim-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.publicAndPoliticalSector.useCases.title",
      subtitle: "solutions.publicAndPoliticalSector.useCases.subtitle",
      otherSubtitle: "solutions.publicAndPoliticalSector.useCases.otherSubtitle",
      nbrOfItems: 3,
      cases: [
        {
          icon: "HeartPulse",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.publicAndPoliticalSector.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.publicAndPoliticalSector.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.publicAndPoliticalSector.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.publicAndPoliticalSector.useCases.cases.3.description",
        },
        {
          icon: "SquareCheck",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.publicAndPoliticalSector.useCases.cases.5.description",
        },
        {
          icon: "Megaphone",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.publicAndPoliticalSector.useCases.cases.5.description",
        },
      ],
    },
    accordion: {
      title: "solutions.publicAndPoliticalSector.accordion.title",
      items: [
        {
          question: "solutions.publicAndPoliticalSector.accordion.items.0.question",
          answer: "solutions.publicAndPoliticalSector.accordion.items.0.answer",
        },
        {
          question: "solutions.publicAndPoliticalSector.accordion.items.1.question",
          answer: "solutions.publicAndPoliticalSector.accordion.items.1.answer",
        },
        {
          question: "solutions.publicAndPoliticalSector.accordion.items.2.question",
          answer: "solutions.publicAndPoliticalSector.accordion.items.2.answer",
        },
        {
          question: "solutions.publicAndPoliticalSector.accordion.items.3.question",
          answer: "solutions.publicAndPoliticalSector.accordion.items.3.answer",
        },
      ]
    },
    cta: {
      title: "solutions.publicAndPoliticalSector.cta.title",
      subtitle: "solutions.publicAndPoliticalSector.cta.subtitle",
      primaryButton: "solutions.publicAndPoliticalSector.cta.primaryButton",
      secondaryButton: "solutions.publicAndPoliticalSector.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "consultancies",
    name: "solutions.consultancies.name",
    title: "solutions.consultancies.title",
    industry: "Consultancies",
    description: "solutions.consultancies.description",
    hero: {
      headline: "solutions.consultancies.hero.headline",
      subheadline: "solutions.consultancies.hero.subheadline",
      image: "/images/consultancies.jpg",
      benefits: [],
      ctaPrimary: "solutions.consultancies.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.consultancies.hero.ctaSecondary",
    },
    features: {
      title: "solutions.consultancies.features.title",
      subheadline: "solutions.consultancies.features.subheadline",
      subtitle: "solutions.consultancies.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.consultancies.features.items.0.title",
          description: "solutions.consultancies.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.consultancies.features.items.1.title",
          description: "solutions.consultancies.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.consultancies.features.items.2.title",
          description: "solutions.consultancies.features.items.2.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.consultancies.features.items.3.title",
          description: "solutions.consultancies.features.items.3.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.consultancies.features.items.4.title",
          description: "solutions.consultancies.features.items.4.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.consultancies.features.items.5.title",
          description: "solutions.consultancies.features.items.5.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.consultancies.zigZag.title",
      items: [
        {
          eyebrow: "",
          title: "solutions.consultancies.zigZag.items.0.title",
          description: "solutions.consultancies.zigZag.items.0.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "",
          title: "solutions.consultancies.zigZag.items.1.title",
          description: "solutions.consultancies.zigZag.items.1.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.consultancies.useCases.title",
      subtitle: "solutions.consultancies.useCases.subtitle",
      otherSubtitle: "solutions.consultancies.useCases.otherSubtitle",
      nbrOfItems: 3,
      cases: [
        {
          icon: "HeartPulse",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consultancies.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consultancies.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consultancies.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consultancies.useCases.cases.3.description",
        },
        {
          icon: "Megaphone",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consultancies.useCases.cases.4.description",
        },
        {
          icon: "Megaphone",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.consultancies.useCases.cases.5.description",
        },
      ],
    },
    accordion: {
      title: "solutions.consumerBrands.accordion.title",
      items: [
        {
          question: "solutions.consumerBrands.accordion.items.0.question",
          answer: "solutions.consumerBrands.accordion.items.0.answer",
        },
        {
          question: "solutions.consumerBrands.accordion.items.1.question",
          answer: "solutions.consumerBrands.accordion.items.1.answer",
        },
        {
          question: "solutions.consumerBrands.accordion.items.2.question",
          answer: "solutions.consumerBrands.accordion.items.2.answer",
        },
        {
          question: "solutions.consumerBrands.accordion.items.3.question",
          answer: "solutions.consumerBrands.accordion.items.3.answer",
        },
      ]
    },
    cta: {
      title: "solutions.consultancies.cta.title",
      subtitle: "solutions.consultancies.cta.subtitle",
      primaryButton: "solutions.consultancies.cta.primaryButton",
      secondaryButton: "solutions.consultancies.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
  {
    id: "agencies",
    name: "solutions.agencies.name",
    title: "solutions.agencies.title",
    industry: "Agencies",
    description: "solutions.agencies.description",
    hero: {
      headline: "solutions.agencies.hero.headline",
      subheadline: "solutions.agencies.hero.subheadline",
      image: "/images/agencies.jpg",
      benefits: [],
      ctaPrimary: "solutions.agencies.hero.ctaPrimary",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondary: "solutions.agencies.hero.ctaSecondary",
    },
    features: {
      title: "solutions.agencies.features.title",
      subheadline: "solutions.agencies.features.subheadline",
      subtitle: "solutions.agencies.features.subtitle",
      nbrOfItems: 3,
      items: [
        {
          icon: "Lightbulb",
          title: "solutions.agencies.features.items.0.title",
          description: "solutions.agencies.features.items.0.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.agencies.features.items.1.title",
          description: "solutions.agencies.features.items.1.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.agencies.features.items.2.title",
          description: "solutions.agencies.features.items.2.description",
        },
        {
          icon: "Lightbulb",
          title: "solutions.agencies.features.items.3.title",
          description: "solutions.agencies.features.items.3.description",
        },
        {
          icon: "CircleUser",
          title: "solutions.agencies.features.items.4.title",
          description: "solutions.agencies.features.items.4.description",
        },
        {
          icon: "HeartPulse",
          title: "solutions.agencies.features.items.5.title",
          description: "solutions.agencies.features.items.5.description",
        },
      ],
    },
    zigZag: {
      title: "solutions.agencies.zigZag.title",
      items: [
        {
          eyebrow: "",
          title: "solutions.agencies.zigZag.items.0.title",
          description: "solutions.agencies.zigZag.items.0.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
        {
          eyebrow: "",
          title: "solutions.agencies.zigZag.items.1.title",
          description: "solutions.agencies.zigZag.items.1.description",
          buttonLabel: "",
          buttonLink: "",
          image: "/images/ad-test.png",
        },
      ],
    },
    useCases: {
      title: "solutions.agencies.useCases.title",
      subtitle: "solutions.agencies.useCases.subtitle",
      otherSubtitle: "solutions.agencies.useCases.otherSubtitle",
      nbrOfItems: 3,
      cases: [
        {
          icon: "HeartPulse",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.agencies.useCases.cases.0.description",
        },
        {
          icon: "Lightbulb",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.agencies.useCases.cases.1.description",
        },
        {
          icon: "SquareCheck",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.agencies.useCases.cases.2.description",
        },
        {
          icon: "Megaphone",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.agencies.useCases.cases.3.description",
        },
        {
          icon: "ChartNetwork",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.agencies.useCases.cases.4.description",
        },
        {
          icon: "ChartNetwork",
          title: "",
          subheadline: "",
          benefits: [],
          description: "solutions.agencies.useCases.cases.5.description",
        },
      ],
    },
    accordion: {
      title: "solutions.consumerBrands.accordion.title",
      items: [
        {
          question: "solutions.consumerBrands.accordion.items.0.question",
          answer: "solutions.consumerBrands.accordion.items.0.answer",
        },
        {
          question: "solutions.consumerBrands.accordion.items.1.question",
          answer: "solutions.consumerBrands.accordion.items.1.answer",
        },
        {
          question: "solutions.consumerBrands.accordion.items.2.question",
          answer: "solutions.consumerBrands.accordion.items.2.answer",
        },
        {
          question: "solutions.consumerBrands.accordion.items.3.question",
          answer: "solutions.consumerBrands.accordion.items.3.answer",
        },
      ]
    },
    cta: {
      title: "solutions.agencies.cta.title",
      subtitle: "solutions.agencies.cta.subtitle",
      primaryButton: "solutions.agencies.cta.primaryButton",
      secondaryButton: "solutions.agencies.cta.secondaryButton",
      ctaPrimaryLink: "/schedule-a-demo",
      ctaSecondaryLink: "",
    },
  },
];

export const featuresByIndustry = [
  {
    id: "1",
    industry: "Consumer Brands",
    title: "solutions.consumerBrands.title",
    description:
      "Insight you can trust to build better products, sharpen strategy, and grow your brand across every African market.",
    image: "/images/consumer-insights.jpg", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/industry/consumer-brands",
  },
  {
    id: "2",
    industry: "Public & Political Sector",
    title: "solutions.publicAndPoliticalSector.title",
    description:
      "Reliable, real-time insights to understand communities, guide policy, and deliver impact across Africa.",
    image: "/images/international-development.jpg", // "https://ext.same-assets.com/829373065/3565711189.svg",
    link: "/solutions/industry/public-and-political-sector",
  },
  {
    id: "3",
    industry: "Consultancies",
    title: "solutions.consultancies.title",
    description:
      "Faster insights to validate hypotheses, strengthen recommendations, and deliver client impact with confidence.",
    image: "/images/consultancies.jpg", // "https://ext.same-assets.com/829373065/2858633470.svg",
    link: "/solutions/industry/consultancies",
  },
  {
    id: "4",
    industry: "Agencies",
    title: "solutions.agencies.title",
    description: "Real audience insights to shape stronger creative, win pitches, and deliver campaigns that truly resonate.",
    image: "/images/agencies.jpg", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/industry/agencies",
  },
] as const;

export const featuresByUseCase = [
  // Perception
  {
    id: "1",
    category: "Perception",
    industry: "Consumer Brands",
    title: "solutions.mediaTesting.title",
    description:
      "Assess the effectiveness of your ads, messages, or creative components in engaging and impacting your target audience.",
    image: "/images/pulse.png",
    link: "/solutions/use-case/media-testing",
  },
  {
    id: "16",
    category: "Perception",
    industry: "Consumer Brands",
    title: "solutions.shopperActivationTesting.title",
    description: "Evaluate how shoppers react to your in-store and out-of-store activations across various African retail environments, including modern trade, informal trade, kiosks, markets, and supermarkets.",
    image: "/images/pulse.png",
    link: "/solutions/use-case/shopper-activation-testing",
  },
  {
    id: "17",
    category: "Perception",
    industry: "Public & Political Sector",
    title: "solutions.publicEngagementEffectiveness.title",
    description: "Evaluate how communities respond to public information campaigns and social impact initiatives — ensuring your message resonates and motivates action across diverse African populations.",
    image: "/images/pulse.png",
    link: "/solutions/use-case/public-engagement-effectiveness",
  },
  {
    id: "18",
    category: "Perception",
    industry: "Public & Political Sector",
    title: "solutions.behaviorChangeActivation.title",
    description: "Test which messages, interventions, or incentives trigger real behavior change across African communities — from health behaviors to civic participation.",
    image: "/images/pulse.png",
    link: "/solutions/use-case/behavior-change-activation",
  },
  {
    id: "19",
    category: "Perception",
    industry: "Consultancies",
    title: "solutions.marketActivationBlueprintTesting.title",
    description: "Test strategic activation blueprints — channel strategy, messaging pillars, audience prioritization — before presenting or deploying them across African markets.",
    image: "/images/pulse.png",
    link: "/solutions/use-case/market-activation-blueprint-testing",
  },
  {
    id: "20",
    category: "Perception",
    industry: "Consultancies",
    title: "solutions.interventionImpactSimulation.title",
    description: "Simulate community reactions to interventions — such as policy activations, social impact programs, and mobilization efforts — to estimate their impact before scaling them up.",
    image: "/images/pulse.png",
    link: "/solutions/use-case/intervention-impact-simulation",
  },
  {
    id: "21",
    category: "Perception",
    industry: "Agencies",
    title: "solutions.conceptAndCreativeRouteScreening.title",
    description: "Screen multiple creative concepts early to choose the winning direction — ensuring your campaign starts with the strongest idea for African audiences.",
    image: "/images/pulse.png",
    link: "/solutions/use-case/concept-and-creative-route-screening",
  },
  {
    id: "22",
    category: "Perception",
    industry: "Agencies",
    title: "solutions.attentionAndEmotionTesting.title",
    description: "Measure which creative assets capture attention and trigger emotional impact — the key drivers of engagement and recall in African markets.",
    image: "/images/pulse.png",
    link: "/solutions/use-case/attention-and-emotion-testing",
  },
  // Innovation
  {
    id: "2",
    category: "Innovation",
    industry: "",
    title: "solutions.visualTest.title",
    description:
      "Let consumers be your co-creators. Ask what they think about your new logo, website or packaging and create designs that truly speak to your audience.",
    image: "/images/message-circle-image.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/visual-test",
  },
  {
    id: "3",
    category: "Innovation",
    industry: "",
    title: "solutions.productDevelopment.title",
    description:
      "Harness the power of strategic product development to create, refine, and deliver solutions that resonate with your audience, setting your brand apart.",
    image: "/images/git-branch.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/product-development",
  },
  {
    id: "4",
    category: "Innovation",
    industry: "",
    title: "solutions.inHomeUseTesting.title",
    description:
      "Identify how your product will perform in the hands (and homes) of real consumers. Determine moments of truth and key drivers in order to validate, iterate and launch with confidence.",
    image: "/images/vial.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/in-home-use-testing",
  },
  // Strategy
  {
    id: "5",
    category: "Strategy",
    industry: "",
    title: "solutions.targetGroupAnalysis.title",
    description:
      "Gen Z or Millenials? Yoga lovers or CrossFit fans? Get a clear understanding of your target audience to create great products that they will actually need and love.",
    image: "/images/chart-bubble.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/psychographic-target-group-analysis",
  },
  {
    id: "6",
    category: "Strategy",
    industry: "",
    title: "solutions.pricingAnalysis.title",
    description:
      "Maximize profits by asking the right questions. How much are customers willing to spend on your product? What’s the optimal price point?",
    image: "/images/chart-spline.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/pricing-analysis",
  },
  {
    id: "7",
    category: "Strategy",
    industry: "",
    title: "solutions.marketAnalysis.title",
    description:
      "Future-proof your decision-making and gain a competitive advantage through a comprehensive market analysis.",
    image: "/images/trending-down.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/market-analysis",
  },
  // Tracking
  {
    id: "8",
    category: "Tracking",
    industry: "",
    title: "solutions.brandTracking.title",
    description:
      "Don’t fly blind. Measure and track your brand's performance to stay on top of consumers' perceptions of you.",
    image: "/images/radar.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/brand-tracking",
  },
  {
    id: "9",
    category: "Tracking",
    industry: "",
    title: "solutions.consumerTracking.title",
    description:
      "Understand how consumers think and what drives their choices. From purchase frequency to product use, to drivers and barriers - we've got all the answers you need, in real time.",
    image: "/images/footsteps.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/consumer-tracking",
  },
  {
    id: "10",
    category: "Tracking",
    industry: "",
    title: "solutions.campaignTracking.title",
    description:
      "Knowing the reach and the click-through rate is great. But what's the real impact of your campaign on your brand?",
    image: "/images/tachometer.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/campaign-tracking",
  },
  {
    id: "11",
    category: "Tracking",
    industry: "",
    title: "solutions.customerSatisfactionAnalysis.title",
    description:
      "Actually knowing what your target group wants is the key to customer satisfaction. We help ask the right questions and understand what matters.",
    image: "/images/meh-alt.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/customer-satisfaction-analysis",
  },
  // Premise
  {
    id: "12",
    category: "Tracking",
    industry: "",
    title: "solutions.availabilityTracker.title",
    description:
      "Increase Sales and Distribution With Actionable Same-Day Data",
    image: "/images/pulse.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/availability-tracker",
  },
  {
    id: "13",
    category: "Tracking",
    industry: "",
    title: "solutions.rollingRetailCensus.title",
    description:
      "Continuously gather data on retail environments for informed decision-making.",
    image: "/images/shopping-bag.png", // "https://ext.same-assets.com/829373065/3565711189.svg",
    link: "/solutions/use-case/rolling-retail-census",
  },
  {
    id: "14",
    category: "Innovation",
    industry: "",
    title: "solutions.aiQualitativeInsightsPlatform.title",
    description:
      "Dive deep into consumer sentiments with qualitative data analysis.",
    image: "/images/chart-trend.png", // "https://ext.same-assets.com/829373065/2194203648.svg",
    link: "/solutions/use-case/ai-qualitative-insights-platform",
  },
  {
    id: "15",
    category: "Tracking",
    industry: "",
    title: "solutions.geospatialAnalytics.title",
    description: "Utilize location-based data for strategic planning",
    image: "/images/chart-network.png", // "https://ext.same-assets.com/829373065/2858633470.svg",
    link: "/solutions/use-case/geospatial-analytics",
  },
] as const;

export const getSolutionById = (id: string): Solution | undefined => {
  return solutions.find((solution) => solution.id === id);
};

export const getAllSolutions = (): Solution[] => {
  return solutions;
};
