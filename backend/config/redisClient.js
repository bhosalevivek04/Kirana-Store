const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URI || 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

module.exports = client;
