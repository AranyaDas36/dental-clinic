import { apiRequest } from './client';

export type HealthResponse = {
  status: string;
  uptimeSeconds: number;
  mongo: string;
};

export function fetchHealth() {
  return apiRequest<HealthResponse>('/health');
}
