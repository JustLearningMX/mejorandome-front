export interface WeightSummary {
  latestKg: number | null;
  latestDate: string | null;
  differenceKg: number | null;
  trendDirection: 'down' | 'up' | 'neutral' | null;
  monthlyAverageKg: number | null;
  hasMeasurements: boolean;
}

export interface ActivitySummary {
  steps: number;
  stepsGoal: number;
  exerciseMinutes: number;
  weeklyAverageSteps: number | null;
  hasActivityToday: boolean;
}

export interface NutritionSummary {
  mealsCount: number;
  averageSatietyLevel: number | null;
  satietyDescription: string | null;
  consciousPausesCount: number;
  repeatedMealsCount: number;
  hasMealsToday: boolean;
}

export interface DashboardSummary {
  weight: WeightSummary;
  activity: ActivitySummary;
  nutrition: NutritionSummary;
}
