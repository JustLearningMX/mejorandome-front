import type { IconName } from '../utils/icons';

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

$1IconName;
}

export const MEAL_TYPES: MealTypeOption[] = [
  { value: 'breakfast', label: 'Desayuno', icon: 'sunrise' },
  { value: 'lunch', label: 'Comida', icon: 'sun' },
  { value: 'dinner', label: 'Cena', icon: 'moon' },
  { value: 'snack', label: 'Colación', icon: 'apple' },
  { value: 'other', label: 'Otro', icon: 'utensils' },
];
