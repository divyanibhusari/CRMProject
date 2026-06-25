import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/routes.js';
import { initDB } from './src/server/db.js';

async function startServer() {
  // 1. Initialize local JSON database with beautiful seeds
  initDB();

  const app = express();
  const PORT = 3000;

  // 2. Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. API Routes
  app.use('/api', apiRouter);

  // 4. Vite middleware or Static files
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting development server with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Starting production server...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Fallback all other client requests to index.html for SPA router
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Ingress Route binding - 0.0.0.0, Port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VIP Project CRM Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal: Failed to start CRM application server:', err);
});
