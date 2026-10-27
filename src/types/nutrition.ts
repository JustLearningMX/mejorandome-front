export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export interface CreateMealRequest {
  mealType: MealType;
  description: string;
  hungerBefore: number;
  satietyAfter: number;
  occurredAt?: string;
  wantedMoreEvenIfFull?: boolean;
  pausedBeforeMore?: boolean | null;
  extraEatingContext?: string | null;
}

export interface MealHealthDayInfo {
  id: string;
  localDate: string;
}

export interface MealResponse {
  id: string;
  occurredAt: string;
  mealType: MealType;
  description: string;
  hungerBefore: number;
  satietyAfter: number;
  wantedMoreEvenIfFull?: boolean;
  pausedBeforeMore?: boolean | null;
  extraEatingContext?: string | null;
  createdAt: string;
  healthDay: MealHealthDayInfo;
}

export interface QueryMealsParams {
  limit?: number;
  localDate?: string;
  mealType?: MealType;
}

export interface MealTypeOption {
  value: MealType;
  label: string;
  icon: string;
}

export const MEAL_TYPES: MealTypeOption[] = [
  { value: 'breakfast', label: 'Desayuno', icon: '🌅' },
  { value: 'lunch', label: 'Comida', icon: '☀️' },
  { value: 'dinner', label: 'Cena', icon: '🌙' },
  { value: 'snack', label: 'Colación', icon: '🍎' },
  { value: 'other', label: 'Otro', icon: '🍽️' },
];
