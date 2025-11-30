const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URI
});

client.on('error', (err) => {
    if (process.env.TEST_ENV) return; // Silence errors in test
    console.log('Redis Client Error', err)
});
client.on('connect', () => console.log('Redis Client Connected'));

if (process.env.TEST_ENV) {
    module.exports = {
        get: async () => null,
        setEx: async () => { },
        del: async () => { },
        connect: async () => { },
        on: () => { },
        isOpen: true
    };
} else {
    module.exports = client;
}
