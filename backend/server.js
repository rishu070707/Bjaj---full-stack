const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const os = require('os');

const bfhlRoutes = require('./routes/bfhlRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Payload size limiter

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/bfhl', limiter);

// Swagger Documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SRM Graph Intelligence API',
            version: '2.0.0',
            description: 'Advanced production-grade graph processing engine.',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/bfhl', bfhlRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        cpu_load: os.loadavg(),
        version: "2.0.0-pro",
        timestamp: new Date()
    });
});

app.get('/', (req, res) => {
    res.send('SRM BFHL Pro API is running. See /api-docs for documentation.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`[PRO] Server is running on port ${PORT}`);
    console.log(`[DOCS] Swagger available at http://localhost:${PORT}/api-docs`);
});
