import { apiRequest } from './api.client';
import { authService } from './auth.service';
import type {
  CreateStepsRequest,
  DailyStepsResponse,
  StepsHistoryResponse,
  QueryStepsParams,
  CreateExerciseRequest,
  ExerciseResponse,
  QueryExercisesParams,
  ActivitySummaryResponse,
  UpdateStepsGoalRequest,
} from '../types/activity';

export const activityService = {
  /**
   * Registra o actualiza los pasos acumulados de un día (Upsert).
   * Endpoint: POST /api/activity/steps
   */
  async recordSteps(
    data: CreateStepsRequest,
    token?: string | null
  ): Promise<DailyStepsResponse> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      throw new Error('No hay sesión activa para registrar pasos');
    }

    return apiRequest<DailyStepsResponse>(
      'activity/steps',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      activeToken
    );
  },

  /**
   * Consulta el historial de pasos diarios con cálculo de promedio y totales.
   * Endpoint: GET /api/activity/steps
   */
  async getStepsHistory(
    params?: QueryStepsParams,
    token?: string | null
  ): Promise<StepsHistoryResponse | null> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      return null;
    }

    const queryParts: string[] = [];
    if (params?.startDate) queryParts.push(`startDate=${encodeURIComponent(params.startDate)}`);
    if (params?.endDate) queryParts.push(`endDate=${encodeURIComponent(params.endDate)}`);
    if (params?.limit) queryParts.push(`limit=${encodeURIComponent(params.limit)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    try {
      return await apiRequest<StepsHistoryResponse>(
        `activity/steps${queryString}`,
        { method: 'GET' },
        activeToken
      );
    } catch {
      return null;
    }
  },

  /**
   * Registra una sesión de ejercicio vinculada al HealthDay.
   * Endpoint: POST /api/activity/exercises
   */
  async recordExercise(
    data: CreateExerciseRequest,
    token?: string | null
  ): Promise<ExerciseResponse> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      throw new Error('No hay sesión activa para registrar ejercicio');
    }

    return apiRequest<ExerciseResponse>(
      'activity/exercises',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      activeToken
    );
  },

  /**
   * Obtiene la lista de sesiones de ejercicio ordenadas descendentemente.
   * Endpoint: GET /api/activity/exercises
   */
  async getExercises(
    params?: QueryExercisesParams,
    token?: string | null
  ): Promise<ExerciseResponse[]> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      return [];
    }

    const queryParts: string[] = [];
    if (params?.limit) queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
    if (params?.localDate) queryParts.push(`localDate=${encodeURIComponent(params.localDate)}`);
    if (params?.exerciseType) queryParts.push(`exerciseType=${encodeURIComponent(params.exerciseType)}`);
    if (params?.startDate) queryParts.push(`startDate=${encodeURIComponent(params.startDate)}`);
    if (params?.endDate) queryParts.push(`endDate=${encodeURIComponent(params.endDate)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    try {
      return await apiRequest<ExerciseResponse[]>(
        `activity/exercises${queryString}`,
        { method: 'GET' },
        activeToken
      );
    } catch {
      return [];
    }
  },

  /**
   * Elimina una sesión de ejercicio del usuario autenticado.
   * Endpoint: DELETE /api/activity/exercises/:id
   */
  async deleteExercise(
    id: string,
    token?: string | null
  ): Promise<void> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      throw new Error('No hay sesión activa para eliminar la sesión de ejercicio');
    }

    await apiRequest<void>(
      `activity/exercises/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      activeToken
    );
  },

  /**
   * Obtiene el resumen consolidado de actividad física (hoy y últimos 7 días).
   * Endpoint: GET /api/activity/summary
   */
  async getActivitySummary(
    token?: string | null
  ): Promise<ActivitySummaryResponse | null> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      return null;
    }

    try {
      return await apiRequest<ActivitySummaryResponse>(
        'activity/summary',
        { method: 'GET' },
        activeToken
      );
    } catch {
      return null;
    }
  },

  /**
   * Actualiza la meta diaria de pasos configurada en el perfil del usuario.
   * Endpoint: PATCH /api/activity/goals
   */
  async updateStepsGoal(
    data: UpdateStepsGoalRequest,
    token?: string | null
  ): Promise<{ stepsGoal: number }> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      throw new Error('No hay sesión activa para actualizar la meta de pasos');
    }

    return apiRequest<{ stepsGoal: number }>(
      'activity/goals',
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      activeToken
    );
  },
};
