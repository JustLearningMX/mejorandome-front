export type ExerciseType =
  | 'walking'
  | 'running'
  | 'strength_training'
  | 'cycling'
  | 'swimming'
  | 'yoga'
  | 'hiit'
  | 'sports'
  | 'other';

export type ExerciseIntensity = 'light' | 'moderate' | 'vigorous' | 'extreme';

export interface ActivityHealthDayInfo {
  id: string;
  localDate: string;
}

export interface CreateStepsRequest {
  steps: number;
  localDate?: string;
  occurredAt?: string;
}

export interface DailyStepsResponse {
  id: string;
  localDate: string;
  steps: number;
  goal: number;
  progressPct: number;
  updatedAt: string;
  healthDay: ActivityHealthDayInfo;
}

export interface StepsHistoryItem {
  localDate: string;
  steps: number;
  goal: number;
  progressPct: number;
  completed: boolean;
}

export interface StepsHistoryResponse {
  items: StepsHistoryItem[];
  averageSteps: number;
  totalSteps: number;
  daysCount: number;
}

export interface QueryStepsParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface CreateExerciseRequest {
  exerciseType: ExerciseType;
  durationMinutes: number;
  intensity?: ExerciseIntensity;
  occurredAt?: string;
  caloriesBurned?: number;
  notes?: string;
}

export interface ExerciseResponse {
  id: string;
  occurredAt: string;
  exerciseType: ExerciseType;
  durationMinutes: number;
  intensity?: ExerciseIntensity;
  caloriesBurned?: number;
  notes?: string;
  createdAt: string;
  healthDay: ActivityHealthDayInfo;
}

export interface QueryExercisesParams {
  limit?: number;
  localDate?: string;
  exerciseType?: ExerciseType;
  startDate?: string;
  endDate?: string;
}

export interface ActivityTodaySummary {
  localDate: string;
  steps: number;
  stepsGoal: number;
  stepsProgressPct: number;
  exerciseMinutes: number;
  exerciseSessionsCount: number;
  hasActivityToday: boolean;
}

export interface ActivityWeekSummary {
  weeklyAverageSteps: number;
  totalExerciseMinutes: number;
  exerciseDaysCount: number;
  daysMeetingGoalCount: number;
}

export interface ActivitySummaryResponse {
  today: ActivityTodaySummary;
  week: ActivityWeekSummary;
}

export interface UpdateStepsGoalRequest {
  stepsGoal: number;
}

export interface ExerciseTypeOption {
  value: ExerciseType;
  label: string;
  icon: string;
}

export const EXERCISE_TYPES: ExerciseTypeOption[] = [
  { value: 'walking', label: 'Caminata', icon: '🚶' },
  { value: 'running', label: 'Carrera / Trote', icon: '🏃' },
  { value: 'strength_training', label: 'Fuerza / Pesas', icon: '🏋️' },
  { value: 'cycling', label: 'Ciclismo', icon: '🚴' },
  { value: 'swimming', label: 'Natación', icon: '🏊' },
  { value: 'yoga', label: 'Yoga / Estiramiento', icon: '🧘' },
  { value: 'hiit', label: 'HIIT / Funcional', icon: '⚡' },
  { value: 'sports', label: 'Deportes', icon: '⚽' },
  { value: 'other', label: 'Otro ejercicio', icon: '⏱️' },
];

export interface ExerciseIntensityOption {
  value: ExerciseIntensity;
  label: string;
  description: string;
}

export const EXERCISE_INTENSITIES: ExerciseIntensityOption[] = [
  { value: 'light', label: 'Ligera', description: 'Esfuerzo suave, respiración normal' },
  { value: 'moderate', label: 'Moderada', description: 'Ritmo constante, se puede conversar' },
  { value: 'vigorous', label: 'Vigorosa', description: 'Esfuerzo alto, respiración agitada' },
  { value: 'extreme', label: 'Muy intensa', description: 'Máxima exigencia física' },
];
