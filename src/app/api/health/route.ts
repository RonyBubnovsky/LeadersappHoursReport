import { NextResponse } from 'next/server';
import { healthService } from '@/services/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await healthService.getSystemHealth();
    
    return NextResponse.json(
      health,
      { 
        status: health.status === 'healthy' ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        message: 'Internal health check error' 
      },
      { status: 500 }
    );
  }
}
