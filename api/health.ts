import type { Request, Response } from 'express';

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  upstreamEndpoints: {
    neaTwoHourForecast: string;
    neaPsi: string;
  };
}

export const getHealthData = (): HealthCheckResponse => ({
  status: 'healthy',
  uptimeSeconds: Math.floor(process.uptime()),
  timestamp: new Date().toISOString(),
  service: 'SG AirAlert NEA Datamall Connector',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  upstreamEndpoints: {
    neaTwoHourForecast: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
    neaPsi: 'https://api.data.gov.sg/v1/environment/psi'
  }
});

// Express route handler
export const healthHandler = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).json(getHealthData());
};

// Standard serverless function default export (Vercel / AWS Lambda / Cloudflare / Netlify)
export default async function handler(req: Request, res: Response) {
  return healthHandler(req, res);
}
