import { apiRequest } from './api.client';
import { weightService } from './weight.service';
import { nutritionService } from './nutrition.service';
import { activityService } from './activity.service';
import type { DashboardSummary, NutritionSummary, ActivitySummary } from '../types/dashboard';
import type { MealResponse } from '../types/nutrition';

function computeNutritionSummary(meals: MealResponse[]): NutritionSummary {
  if (!meals || meals.length === 0) {
    return {
      mealsCount: 0,
      averageSatietyLevel: null,
      satietyDescription: null,
      consciousPausesCount: 0,
      repeatedMealsCount: 0,
      hasMealsToday: false,
    };
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const todaysMeals = meals.filter((m) => {
    if (m.healthDay?.localDate) {
      return m.healthDay.localDate === todayStr;
    }
    const d = new Date(m.occurredAt);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  const mealsCount = todaysMeals.length;
  if (mealsCount === 0) {
    return {
      mealsCount: 0,
      averageSatietyLevel: null,
      satietyDescription: null,
      consciousPausesCount: 0,
      repeatedMealsCount: 0,
      hasMealsToday: false,
    };
  }

  const totalSatiety = todaysMeals.reduce((acc, m) => acc + (Number(m.satietyAfter) || 0), 0);
  const averageSatiety = Math.round((totalSatiety / mealsCount) * 10) / 10;
  const consciousPausesCount = todaysMeals.filter((m) => m.pausedBeforeMore === true).length;
  const repeatedMealsCount = todaysMeals.filter((m) => m.wantedMoreEvenIfFull === true).length;

  let satietyDesc = 'Satisfecho';
  if (averageSatiety <= 3) satietyDesc = 'Hambre residual';
  else if (averageSatiety <= 5) satietyDesc = 'Satisfecho moderado';
  else if (averageSatiety <= 7) satietyDesc = 'Satisfecho pleno';
  else if (averageSatiety <= 8) satietyDesc = 'Lleno';
  else satietyDesc = 'Excesivamente lleno';

  return {
    mealsCount,
    averageSatietyLevel: averageSatiety,
    satietyDescription: satietyDesc,
    consciousPausesCount,
    repeatedMealsCount,
    hasMealsToday: true,
  };
}

export const dashboardService = {
  /**
   * Obtiene el resumen de métricas del usuario autenticado para el dashboard.
   * Consulta prioritariamente el endpoint de resumen o directamente los módulos
   * específicos (como /api/weight, /api/nutrition/meals y /api/activity/summary) para mostrar información real.
   */
  async getSummary(token?: string | null): Promise<DashboardSummary> {
    const emptySummary: DashboardSummary = {
      weight: {
        latestKg: null,
        latestDate: null,
        differenceKg: null,
        trendDirection: null,
        monthlyAverageKg: null,
        hasMeasurements: false,
      },
      activity: {
        steps: 0,
        stepsGoal: 10000,
        exerciseMinutes: 0,
        weeklyAverageSteps: null,
        hasActivityToday: false,
      },
      nutrition: {
        mealsCount: 0,
        averageSatietyLevel: null,
        satietyDescription: null,
        consciousPausesCount: 0,
        repeatedMealsCount: 0,
        hasMealsToday: false,
      },
    };

    if (!token) {
      return emptySummary;
    }

    try {
      const response = await apiRequest<Partial<DashboardSummary>>(
        'dashboard/summary',
        { method: 'GET' },
        token
      );

      let nutritionData = {
        ...emptySummary.nutrition,
        ...(response.nutrition || {}),
      };

      // Si el endpoint de summary no tiene nutrición o no ha implementado el desglose
      if (!response.nutrition || (!response.nutrition.hasMealsToday && response.nutrition.mealsCount === 0)) {
        try {
          const meals = await nutritionService.getMeals({ limit: 30 }, token);
          if (meals && meals.length > 0) {
            nutritionData = computeNutritionSummary(meals);
          }
        } catch {
          // Ignorar fallback si falla
        }
      }

      let activityData: ActivitySummary = {
        ...emptySummary.activity,
        ...(response.activity || {}),
      };

      // Si el endpoint de summary no tiene actividad real o aún no la incluye
      if (!response.activity || (!response.activity.hasActivityToday && response.activity.steps === 0 && response.activity.exerciseMinutes === 0)) {
        try {
          const actSummary = await activityService.getActivitySummary(token);
          if (actSummary) {
            activityData = {
              steps: actSummary.today.steps,
              stepsGoal: actSummary.today.stepsGoal,
              exerciseMinutes: actSummary.today.exerciseMinutes,
              weeklyAverageSteps: actSummary.week.weeklyAverageSteps,
              hasActivityToday: actSummary.today.hasActivityToday,
            };
          }
        } catch {
          // Ignorar fallback si falla
        }
      }

      return {
        weight: {
          ...emptySummary.weight,
          ...(response.weight || {}),
        },
        activity: activityData,
        nutrition: nutritionData,
      };
    } catch {
      // Fallback inteligente: consultar directamente los módulos de peso, comidas y actividad
      let weightSummary = emptySummary.weight;
      let nutritionSummary = emptySummary.nutrition;
      let activitySummary = emptySummary.activity;

      try {
        const weightHistory = await weightService.getWeightHistory(30, token);
        if (weightHistory && weightHistory.length > 0) {
          const latest = weightHistory[0];
          const previous = weightHistory[1];
          const latestKg = Number(latest.weightKg);
          const diff = previous ? latestKg - Number(previous.weightKg) : null;

          const now = new Date();
          const currentMonthRecords = weightHistory.filter((rec) => {
            const d = new Date(rec.occurredAt);
            return (
              d.getFullYear() === now.getFullYear() &&
              d.getMonth() === now.getMonth()
            );
          });

          const monthlyAvg =
            currentMonthRecords.length > 0
              ? currentMonthRecords.reduce(
                  (sum, r) => sum + Number(r.weightKg),
                  0
                ) / currentMonthRecords.length
              : null;

          const dateObj = new Date(latest.occurredAt);
          const formattedDate = dateObj.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
          });

          weightSummary = {
            latestKg,
            latestDate: formattedDate,
            differenceKg: diff,
            trendDirection:
              diff === null
                ? null
                : diff < 0
                ? 'down'
                : diff > 0
                ? 'up'
                : 'neutral',
            monthlyAverageKg: monthlyAvg,
            hasMeasurements: true,
          };
        }
      } catch {
        // En caso de que no haya respuesta de /api/weight
      }

      try {
        const meals = await nutritionService.getMeals({ limit: 30 }, token);
        if (meals && meals.length > 0) {
          nutritionSummary = computeNutritionSummary(meals);
        }
      } catch {
        // En caso de que no haya respuesta de /api/nutrition/meals
      }

      try {
        const actSummary = await activityService.getActivitySummary(token);
        if (actSummary) {
          activitySummary = {
            steps: actSummary.today.steps,
            stepsGoal: actSummary.today.stepsGoal,
            exerciseMinutes: actSummary.today.exerciseMinutes,
            weeklyAverageSteps: actSummary.week.weeklyAverageSteps,
            hasActivityToday: actSummary.today.hasActivityToday,
          };
        }
      } catch {
        // En caso de que no haya respuesta de /api/activity/summary
      }

      return {
        ...emptySummary,
        weight: weightSummary,
        activity: activitySummary,
        nutrition: nutritionSummary,
      };
    }
  },
};
