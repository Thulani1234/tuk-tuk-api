import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tuk-Tuk Tracking API',
      version: '1.0.0',
      description: 'Sri Lanka Police Real-Time Three-Wheeler Tracking System',
    },
    servers: [{
      url: 'https://tuk-tuk-api-production-46b5.up.railway.app',
      description: 'Production API Server',
    }, {
      url: 'http://localhost:3000',
      description: 'Development API Server',
    }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [join(__dirname, '../src/routes/*.js')],
});

// Write the Swagger specification to a JSON file
const outputPath = join(__dirname, 'csv-data', 'tuktuk-api-specification.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log('✅ Swagger API specification generated!');
console.log(`📄 File saved to: ${outputPath}`);
console.log(`🌐 Production URL: https://tuk-tuk-api-production-46b5.up.railway.app/api-docs`);
console.log(`📋 Local JSON will be available at: http://localhost:3001/csv/tuktuk-api-specification.json`);
