import { apiRequest } from './api.client';
import { authService } from './auth.service';
import type {
  CreateWeightRequest,
  WeightMeasurementResponse,
} from '../types/weight';

export const weightService = {
  /**
   * Registra una nueva medición de peso corporal para el usuario autenticado.
   * Endpoint: POST /api/weight
   */
  async createWeight(
    data: CreateWeightRequest,
    token?: string | null
  ): Promise<WeightMeasurementResponse> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      throw new Error('No hay sesión activa para registrar el peso');
    }

    return apiRequest<WeightMeasurementResponse>(
      'weight',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      activeToken
    );
  },

  /**
   * Obtiene el historial de mediciones de peso del usuario autenticado ordenadas descendentemente.
   * Endpoint: GET /api/weight?limit=N
   */
  async getWeightHistory(
    limit = 30,
    token?: string | null
  ): Promise<WeightMeasurementResponse[]> {
    const activeToken = token ?? authService.getStoredToken();
    if (!activeToken) {
      return [];
    }

    try {
      return await apiRequest<WeightMeasurementResponse[]>(
        `weight?limit=${limit}`,
        { method: 'GET' },
        activeToken
      );
    } catch {
      return [];
    }
  },
};
