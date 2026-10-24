import { apiRequest } from './api.client';
import type { DashboardSummary } from '../types/dashboard';

export const dashboardService = {
  /**
   * Obtiene el resumen de métricas del usuario autenticado para el dashboard.
   * Si no hay registros en la base de datos o el endpoint aún no está poblado,
   * retorna el estado real sin registros (sin datos dummy).
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
      // Si la API responde 404 (módulo en desarrollo) o no hay conexión,
      // representamos con fidelidad la ausencia de registros.
      return emptySummary;
    }
  },
};
