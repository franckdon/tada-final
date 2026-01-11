export type MonthlySurveyCount = {
  month: string;
  count: number;
};

export type MapLocation = {
  id: string;
  coordinates: [number, number];
  count: number;
  location: string;
};

export type TSurvey = {
  id: string;
  name: string;
  description: string;
  missionId: string;
  questions: {
    pages: {
      name: string;
      elements: {
        name: string;
        type: string;
        title: string;
        isRequired: boolean;
        choices?: string[];
        rateMax?: number;
        rateMin?: number;
        maxRateDescription?: string;
        minRateDescription?: string;
      }[];
    }[];
    title: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
};
