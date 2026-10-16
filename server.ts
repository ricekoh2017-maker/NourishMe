import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { healthHandler } from './api/health.ts';
import { hazePsiHandler } from './api/hazePSI.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Mount API endpoints
  app.get('/api/health', healthHandler);
  app.get('/api/hazePSI', hazePsiHandler);

  if (!isProduction) {
    // Mount Vite dev middleware in development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`> SG AirAlert server running on http://0.0.0.0:${PORT}`);
    console.log(`> Endpoints: /api/health , /api/hazePSI`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
