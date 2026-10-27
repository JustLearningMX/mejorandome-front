import { apiRequest } from './api.client';
import { authService } from './auth.service';
import type {
  CreateMealRequest,
  MealResponse,
  QueryMealsParams,
} from '../types/nutrition';

export const nutritionService = {
  /**
   * Registra una nueva comida con su evaluación de hambre y saciedad.
   * Endpoint: POST /api/nutrition/meals
   */
  async createMeal(
    data: CreateMealRequest,
    token?: string | null
  ): Promise<MealResponse> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      throw new Error('No hay sesión activa para registrar la comida');
    }

    return apiRequest<MealResponse>(
      'nutrition/meals',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      activeToken
    );
  },

  /**
   * Obtiene el listado de comidas del usuario autenticado ordenadas descendentemente.
   * Endpoint: GET /api/nutrition/meals?limit=N&localDate=YYYY-MM-DD
   */
  async getMeals(
    params?: QueryMealsParams,
    token?: string | null
  ): Promise<MealResponse[]> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      return [];
    }

    const queryParts: string[] = [];
    if (params?.limit) queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
    if (params?.localDate) queryParts.push(`localDate=${encodeURIComponent(params.localDate)}`);
    if (params?.mealType) queryParts.push(`mealType=${encodeURIComponent(params.mealType)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    try {
      return await apiRequest<MealResponse[]>(
        `nutrition/meals${queryString}`,
        { method: 'GET' },
        activeToken
      );
    } catch {
      return [];
    }
  },

  /**
   * Elimina un registro de comida del usuario autenticado.
   * Endpoint: DELETE /api/nutrition/meals/:id
   */
  async deleteMeal(
    id: string,
    token?: string | null
  ): Promise<void> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      throw new Error('No hay sesión activa para eliminar la comida');
    }

    await apiRequest<void>(
      `nutrition/meals/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      activeToken
    );
  },
};
