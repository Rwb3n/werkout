const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Werkout.in API',
      version: '1.0.0',
      description: 'API documentation for the Werkout.in platform',
      contact: {
        name: 'Werkout.in Development Team'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  // Path to the API specs
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.js')
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Configures and returns Express middleware for Swagger documentation
 * @param {object} app - Express app instance
 */
function setupSwagger(app) {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Swagger documentation initialized at /api-docs');
}

module.exports = { setupSwagger }; 