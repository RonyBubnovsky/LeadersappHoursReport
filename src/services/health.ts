import { createClient } from '@/lib/supabase/server';
import { HealthCheckResult, HealthResponse, HealthStatus } from '@/types/health';

class HealthService {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Check if Supabase connection is working
   */
  async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const supabase = await createClient();
      
      // We just want to check connectivity. 
      // Asking for the session is a lightweight way to check if we can talk to Supabase
      // without needing specific table permissions.
      const { error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      return {
        status: 'healthy',
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown database error',
        duration: Date.now() - start
      };
    }
  }

  /**
   * Check environment configuration
   */
  checkEnvironment(): HealthCheckResult {
    const start = Date.now();
    const missingVars: string[] = [];

    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    requiredVars.forEach(key => {
      if (!process.env[key]) {
        missingVars.push(key);
      }
    });

    if (missingVars.length > 0) {
      return {
        status: 'unhealthy',
        message: `Missing environment variables: ${missingVars.join(', ')}`,
        duration: Date.now() - start
      };
    }

    return {
      status: 'healthy',
      duration: Date.now() - start
    };
  }

  /**
   * Aggregate all health checks
   */
  async getSystemHealth(): Promise<HealthResponse> {
    const dbHealth = await this.checkDatabase();
    const envHealth = this.checkEnvironment();

    const isHealthy = 
      dbHealth.status === 'healthy' && 
      envHealth.status === 'healthy';

    const status: HealthStatus = isHealthy ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000,
      components: {
        database: dbHealth,
        environment: envHealth
      },
      version: process.env.npm_package_version || '0.1.0'
    };
  }
}

export const healthService = new HealthService();
