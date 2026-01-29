/**
 * Health check types
 */

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckResult {
  status: HealthStatus;
  message?: string;
  duration?: number; // in milliseconds
  details?: Record<string, unknown>;
}

export interface ComponentHealth {
  database: HealthCheckResult;
  environment: HealthCheckResult;
}

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number; // in seconds
  components: ComponentHealth;
  version?: string;
}
