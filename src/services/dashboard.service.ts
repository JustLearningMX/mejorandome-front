import { apiRequest } from './api.client';
import { weightService } from './weight.service';
import type { DashboardSummary } from '../types/dashboard';

export const dashboardService = {
  /**
   * Obtiene el resumen de métricas del usuario autenticado para el dashboard.
   * Consulta prioritariamente el endpoint de resumen o directamente los módulos
   * específicos (como /api/weight) para mostrar con exactitud la información real.
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

      return {
        weight: {
          ...emptySummary.weight,
          ...(response.weight || {}),
        },
        activity: {
          ...emptySummary.activity,
          ...(response.activity || {}),
        },
        nutrition: {
          ...emptySummary.nutrition,
          ...(response.nutrition || {}),
        },
      };
    } catch {
      // Fallback inteligente: consultar directamente el historial de /api/weight
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

          return {
            ...emptySummary,
            weight: {
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
            },
          };
        }
      } catch {
        // En caso de que no haya respuesta de /api/weight aún
      }

      return emptySummary;
    }
  },
};
