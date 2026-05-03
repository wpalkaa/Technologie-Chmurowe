const express = require('express');
const os = require('os');
const { Pool } = require('pg'); 
const redis = require('redis');

const app = express();
app.use(express.json());

// PostgreSQL
const pgPool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432
});
pgPool.query(`
    CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
    )`).then(() => {
        console.log(`[INFO]: PostgreSQL table initialized`)
    })
    .catch((error) => {
        console.error(`[ERROR]: PostreSQL initialization failed: ${error}`);
    });

// Redis
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:6379`
});
redisClient.on('error', (error) => console.error(`[ERROR]: Redis client error: ${error}`))
redisClient.connect()
    .then(() => {
        console.log(`[INFO]: Connected to redis.`);
    })
    .catch((error) => {
        console.error(`[ERROR]: Couldn't connect to redis: ${error}`);
    });


// ========= APP =========


// const productList = [ 'apple', 'grass', 'banana' ];
let requestCounter = 0;

app.use((req, res, next) => {
    requestCounter++;
    next();
});

app.get('/items', async (req, res) => {
    console.log(`[Info]: GET /items request received.`)

    try {
        const result = await pgPool.query(`SELECT name FROM items`);
        const items = result.rows.map(row => row.name);
        res.status(200).json(items);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    };
});

app.get('/stats', async (req, res) => {
    console.log(`[Info]: GET /stats request received.`)
    console.log("uptime: ", process.uptime());
    console.log("servertime: ", new Date().toISOString);

    try {
        const cachedStats = await redisClient.get('stats');

        if(cachedStats) {
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).json(JSON.parse(cachedStats));
        };

        const dbRes = await pgPool.query('SELECT COUNT(*) FROM items');
        const productsAmount = parseInt(dbRes.rows[0].count, 10);

        const stats = {
            products: productsAmount,
            instance: process.env.INSTANCE_ID || os.hostname(),
            serverTime: new Date().toISOString(),
            requestCounter: requestCounter,
            uptime: process.uptime(),
            ZMIANA: "ZMIAMZIAMZIAMZIAMZ"
        };

        await redisClient.set('stats', JSON.stringify(stats), { EX: 10 });

        res.setHeader('X-Cache', 'MISS');
        res.status(200).json(stats);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    };
});

app.get('/health', async (req, res) => {
    console.log(`[Info]: GET /health request received.`);
    
    let pgStatus = 'ok';
    let redisStatus = 'ok';

    try {
        await pgPool.query('SELECT 1');
    } catch(error) {
        pgStatus = 'error';
    };

    try {
        await redisClient.ping();
    } catch(error) {
        redisStatus = 'error';
    };

    res.status(200).json({
        status: (pgStatus === 'ok' && redisStatus === 'ok') ? 'ok' : 'degraded',
        uptime: process.uptime(),
        connections: {
            posgresql: pgStatus,
            redis: redisStatus,
        }
    });
});

app.post('/items', async (req, res) => {
    const newProduct = req.body; 
    console.log(`[Info]: POST /items {${newProduct}} request received.`)
    
    try {
        const pgResult = await pgPool.query(
            `INSERT INTO items (name) VALUES ($1)`,
            [newProduct.item]
        );

        const dbResult = await pgPool.query(`SELECT name FROM items`);
        const items = dbResult.rows.map(row => row.name);

        res.status(201).json({
        message: "item added succesfully",
        newItemList: items,
        });
    } catch (error) {
        res.status(500).json({
            message: error.essage
        })
    };
})



app.listen(3000, () => {
    console.log("[Info]: Server started. Listening on 3000.");
});