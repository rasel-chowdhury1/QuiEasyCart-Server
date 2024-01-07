const express = require('express');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://QuiEasyCartDB:QuiEasyCartDB2024@cluster0.jz0ivtr.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db('QuiEasyCartDB').collection("products")

    //user api

    //Product api
    //all product get
    app.get('/allProducts', async(req,res) =>{
       const data = await productCollection.find().toArray()
       res.send(data)
    })
    
    //spccific product get
    app.get("/product/:id", async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await productCollection.findOne(query);
      res.send(result);
    })
   
    //product added in mongodb
    app.post('/addProduct', async(req,res) =>{
      const data = req.body;
      const result = await productCollection.insertOne(data)
      res.send(result)
    })

    //cart api

    //order api

    //payment api

    //reviews api

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req,res) =>{
    res.send("QuiEasy cart server is running ")
})

app.listen(port, ()=>{
    console.log("Server is is running on port ",port);
})