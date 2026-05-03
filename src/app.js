import express      from 'express';
import cors         from 'cors';
import helmet       from 'helmet';
import rateLimit    from 'express-rate-limit';
import swaggerUi    from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv       from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env'), override: true });

import { getPool }    from './config/db.js';
import authRoutes     from './routes/auth.routes.js';
import vehicleRoutes  from './routes/vehicle.routes.js';
import locationRoutes from './routes/location.routes.js';
import boundaryRoutes from './routes/boundary.routes.js';
import userRoutes     from './routes/user.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  message:  { error: 'Too many requests, please slow down' },
}));

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Tuk-Tuk Tracking API',
      version:     '1.0.0',
      description: 'Sri Lanka Police Real-Time Three-Wheeler Tracking System',
    },
    servers: [{
      url:         process.env.API_URL || '/',
      description: 'API Server',
    }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [join(__dirname, './routes/*.js')],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Tuk-Tuk Tracking API Docs',
}));

app.get('/docs', (req, res) => res.redirect('/api-docs'));

app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use('/api/auth',       authRoutes);
app.use('/api/vehicles',   vehicleRoutes);
app.use('/api/locations',  locationRoutes);
app.use('/api/boundaries', boundaryRoutes);
app.use('/api/users',      userRoutes);

app.use((req, res) =>
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    await getPool();
    console.log(`\nTuk-Tuk API  →  http://localhost:${PORT}`);
    console.log(`Swagger docs →  http://localhost:${PORT}/api-docs\n`);
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }
});