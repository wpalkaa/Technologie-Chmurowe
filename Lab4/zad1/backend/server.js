const express = require('express');
const os = require('os');
// const cors = require('cors')

const app = express();
app.use(express.json());
// app.use(cors({
//     origin: ['http://localhost:5173'],
//     methods: ['POST', 'GET']
// }));

const productList = [ 'apple', 'grass', 'banana' ];

app.get('/items', (req, res) => {
    console.log(`[Info]: GET /items request received.`)

    res.status(200).json(productList);
})

app.get('/stats', (req, res) => {
    console.log(`[Info]: GET /stats request received.`)
    
    const productsAmount = productList.length;

    res.status(200).json({
        products: productsAmount,
        instance: os.hostname(),
    });
});

/*
template:
{
    "item": "newProduct"
}
*/

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