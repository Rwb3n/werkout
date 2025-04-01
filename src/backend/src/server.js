require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const { setupSwagger } = require('./config/swagger');
const { notFound, errorHandler } = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const providerRoutes = require('./routes/provider.routes');
const searchRoutes = require('./routes/search.routes');
const reviewRoutes = require('./routes/review.routes');
const eventRoutes = require('./routes/event.routes');
const seekerRoutes = require('./routes/seeker.routes');
const healthRoutes = require('./routes/health.routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create a write stream for Morgan access logs (append only)
const accessLogsDir = path.join(__dirname, '../../../logs/backend');
if (!fs.existsSync(accessLogsDir)) {
  fs.mkdirSync(accessLogsDir, { recursive: true });
}

// Create access log filename with current timestamp
const getAccessLogFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `access_${year}-${month}-${day}_${hour}-${minute}.log`;
};

const accessLogPath = path.join(accessLogsDir, getAccessLogFilename());
const accessLogStream = fs.createWriteStream(accessLogPath, { flags: 'a' });

// Middleware
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/seekers', seekerRoutes);
app.use('/api/health', healthRoutes);

// Use request logging middleware (for successful requests)
if (process.env.NODE_ENV !== 'test') {
  app.use(logger.logAPIRequest);
}

// 404 handler for undefined routes
app.use(notFound);

// Standardized error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.logError('MongoDB connection error', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.logError('Unhandled Promise Rejection', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.logError('Uncaught Exception', err);
  // Close server & exit process
  process.exit(1);
});