const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7pd87.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('zaraFashionHouse').collection('items');

        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const items = await itemsCollection.findOne(query);
            res.send(items);
        });

        app.get('/items', async (req, res) => {
            console.log('query', req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = itemsCollection.find(query);
            let products;
            if (page || size) {
                // 0 --> skip: 0 get: 0-10(10);
                // 1 --> skip: 1*10 get: 11-20(10);
                // 2 --> skip: 2*10 get: 21-30(10);
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }
            res.send(products);
        });

        app.get('/productCount', async (req, res) => {
            const count = await itemsCollection.estimatedDocumentCount();
            res.send({ count });
        });

        // Post
        app.post('/items', async (req, res) => {
            const newItems = req.body;
            const result = await itemsCollection.insertOne(newItems);
            res.send(result);

        });

        // // Update
        // app.put('/items/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const updateQuantity = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             quantity: updateQuantity.quantity,
        //         }
        //     };
        //     const result = await userCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // })

        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Zara Server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})