const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const config                      = require('./config');
const logger                      = require('./middleware/logger');
const errorHandler                = require('./middleware/errorHandler');
const authMiddleware              = require('./middleware/authMiddleware');
const { registerProxyRoutes }     = require('./middleware/proxyMiddleware');
const healthRouter                = require('./routes/health');

const app = express();


app.use(helmet());


app.use(cors({
  origin:         config.corsOrigins,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,
}));


app.use(logger);






const limiter = rateLimit({
  windowMs:       config.rateLimit.windowMs,
  max:            config.rateLimit.max,
  message: {
    success: false,
    error: { message: 'Quá nhiều request. Vui lòng thử lại sau 15 phút.' },
  },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use(limiter);


app.use(authMiddleware);


app.get('/health', (req, res) => res.redirect('/api/health'));
app.use('/api/health', healthRouter);



registerProxyRoutes(app);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} không tồn tại`,
    },
  });
});


app.use(errorHandler);

module.exports = app;