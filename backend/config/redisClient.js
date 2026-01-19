const redis = require('redis');
const logger = require('./logger');

const client = redis.createClient({
    url: process.env.REDIS_URI
});

client.on('error', (err) => {
    if (process.env.TEST_ENV) return; // Silence errors in test
    logger.warn('⚠️  Redis Client Error (app will continue without caching):', err.message);
});

client.on('connect', () => logger.info('✅ Redis Client Connected'));

// Graceful fallback - if Redis fails, provide mock functions
const mockRedis = {
    get: async () => null,
    setEx: async () => { },
    del: async () => { },
    keys: async () => [],
    connect: async () => { },
    on: () => { },
    isOpen: false
};

if (process.env.TEST_ENV) {
    module.exports = mockRedis;
} else {
    // Try to connect, but don't crash if it fails
    client.connect().catch(err => {
        console.log('⚠️  Redis connection failed. Running without cache.');
    });

    module.exports = client;
}
