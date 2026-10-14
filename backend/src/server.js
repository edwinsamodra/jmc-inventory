import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.js';
import { testDbConnection } from './config/database.js';
import { UPLOADS_DIR } from './config/upload.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

// Pastikan zona waktu disetel ke Asia/Jakarta (WIB)
process.env.TZ = 'Asia/Jakarta';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend Vite dev server (5173) & Docker Nginx (8080)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Swagger UI Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'JMC Inventory API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true
    }
  })
);

// Raw OpenAPI JSON specification endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'JMC Inventory API Service is running',
    timestamp: new Date().toISOString()
  });
});

// Mount Main API Routes
app.use('/api', apiRouter);

// Redirect root to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// 404 Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

// App listen (hanya saat server.js dijalankan langsung)
const isDirectExecution = process.argv[1] && process.argv[1].endsWith('server.js');
if (isDirectExecution && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📖 Swagger Docs available at http://localhost:${PORT}/api-docs`);
    await testDbConnection();
  });
}

export default app;
