const express = require('express');
const os = require('os');

const app = express();
app.use(express.json());

const productList = [ 'apple', 'grass', 'banana' ];
let requestCounter = 0;

app.use((req, res, next) => {
    requestCounter++;
    next();
});

app.get('/items', (req, res) => {
    console.log(`[Info]: GET /items request received.`)

    res.status(200).json(productList);
})

app.get('/stats', (req, res) => {
    console.log(`[Info]: GET /stats request received.`)
    console.log("uptime: ", process.uptime());
    console.log("servertime: ", new Date().toISOString);
    
    const productsAmount = productList.length;

    res.status(200).json({
        products: productsAmount,
        instance: process.env.INSTANCE_ID || os.hostname(),
        serverTime: new Date().toISOString(),
        requestCounter: requestCounter,
        uptime: process.uptime(),
    });
});

app.get('/health', (req, res) => {
    console.log(`[Info]: GET /health request received.`);
    
    res.status(200).json({
        status: "ok",
        uptime: process.uptime() 
    })
})

app.post('/items', (req, res) => {
    console.log(`[Info]: POST /items request received.`)
    
    const newProduct = req.body; 
    productList.push(newProduct.item);

    res.status(200).json({
        message: "item added succesfully",
        newItemList: productList,
    });
})



app.listen(3000, () => {
    console.log("[Info]: Server started. Listening on 3000.");
});