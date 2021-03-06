const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express()
const port =process.env.PORT || 5000;

require('dotenv').config();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.edakp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
  
    try{
        await client.connect();
        const database = client.db("onlineShop");
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');

        //Get API

        app.get('/products',async(req,res)=>{
            const cursor = productsCollection.find({});
            const count =await cursor.count();
            const page=req.query.page;
            const size=parseInt(req.query.size);
            let products;
            if(page){
              products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
              products =await cursor.toArray();
            }

            res.send({
              count,
              products
            });
        });

        //use POST to get data by keys

        app.post('/products/bykeys',async(req,res)=>{
          const keys=req.body;
          const query={key:{$in:keys}}
          const products=await productsCollection.find(query).toArray();
          res.json(products)
        });

        //Post For Order

        app.post('/orders',async(req,res)=>{
          const order=req.body;
          const result=await ordersCollection.insertOne(order);
          res.json(result)
        })


    }
    finally {
        // await client.close();
      }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/hello', (req, res) => {
  res.send('We Going To change!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})