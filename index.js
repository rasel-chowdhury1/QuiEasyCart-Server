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
    const useProfileCollection = client.db('QuiEasyCartDB').collection('userProfile')

    const requirementCollection = client.db('QuiEasyCartDB').collection('requirements');
    const categoryCollection = client.db('QuiEasyCartDB').collection('categories')
    const subCategoryCollection = client.db('QuiEasyCartDB').collection('subCategories')
    const brandCollection = client.db('QuiEasyCartDB').collection('brands')
    const sizeCollection = client.db('QuiEasyCartDB').collection('sizes')
    
    //user api
    app.post('/addUser', async (req, res) => {
      const data = req.body;
      console.log(data)
      const user = req.body;
      // console.log(user)
      const query = {email: user.email}

      const existingUser = await useProfileCollection.findOne(query)
      if(existingUser){
        return res.send({message: "user already exists"});
      }
      const result = await useProfileCollection.insertOne(data)
      res.send(result)
    })

  //update Profile 
  app.patch('/updateProfile/:id',async(req, res) => {
    const profileData = req.body;
    const id = req.params.id;
    const {firstName,lastName,phone,email,birthDate,image,gender,address,userId} = profileData;
    console.log('from server',firstName,lastName,phone,email,birthDate,image,gender,address,userId)
    const result = await useProfileCollection.updateOne(
      {_id: new ObjectId(id)},
      {$set : {
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        gender: gender,
        birthDate: birthDate,
        image: image,
        address: address
      }}
    )
    res.send(result)
    console.log(result)
  })

  //specific user get
  app.get('/user/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {userId : id}
    const result = await useProfileCollection.findOne(query)
    res.send(result)
  })
    //Product api------------------------------
    //all product get
    app.get('/allProducts', async (req, res) => {
      const data = await productCollection.find().toArray()
      res.send(data)
    })

    //spccific product get
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    })

    //product added in mongodb
    app.post('/addProduct', async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data)
      res.send(result)
      console.log(result)
    })

    //add requirement
    app.post('/addRequirement', async(req, res) =>{
      const data = req.body;
      console.log(data)
      const result =await requirementCollection.insertOne(data)
      res.send(result)
      console.log(result)
    })

    //getRequirement
    app.get('/allRequirements',async(req,res) =>{
      result = await requirementCollection.find().toArray();
      res.send(result)
    })

     //add Category
     app.post('/addCategory/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {category : id}
      const category = await categoryCollection.findOne(query)
      const data = req.body;
      if(category && (category.category === data.category)){
        console.log('Category is exists')
      }else{
        const result =await categoryCollection.insertOne(data)
        res.send(result)
        console.log(result)
      }
      
    })

    //getCategory
    app.get('/allCategories',async(req,res) =>{
      result = await categoryCollection.find().toArray();
      res.send(result)
    })

      //add subCategory
      app.post('/addSubCategory/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {subCategory : id}
      const subCategory = await subCategoryCollection.findOne(query)
      console.log('subCategory',subCategory)
      const data = req.body;
      if(subCategory &&  (subCategory.category === data.category) && (subCategory.subCategory === data.subCategory)){
        console.log('subCategory is exists')
      }else{
        
        console.log(data)
        const result =await subCategoryCollection.insertOne(data)
        res.send(result)
        console.log(result)
      }
      
        
      })
  
      //getSubCategory
      app.get('/allSubCategories',async(req,res) =>{
        result = await subCategoryCollection.find().toArray();
        res.send(result)
      })

      //add brand
      app.post('/addBrand/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {brand : id}
      const brand = await brandCollection.findOne(query)
      const data = req.body;
      if(brand && (brand.subCategory === data.subCategory) && (brand.brand === data.brand)){
        console.log('brand is exists')
      }else{
        console.log(data)
        const result =await brandCollection.insertOne(data)
        res.send(result)
        console.log(result)
      }
     
       
      })
  
      //getBrand
      app.get('/allBrands',async(req,res) =>{
        result = await brandCollection.find().toArray();
        res.send(result)
      })

       //add size
       app.post('/addSize/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {size : id}
      const size = await sizeCollection.findOne(query)
      console.log('size',size)
      const data = req.body;
      console.log('data of siz',data)
      if(size && (size.brand === data.brand) && (size.size === data.size)){
         console.log('size is exists')
      }else{
        
        console.log(data)
        const result =await sizeCollection.insertOne(data)
        res.send(result)
        console.log('result of size',result)
      }
     
      })
  
      //get Size
      app.get('/allSizes',async(req,res) =>{
        result = await sizeCollection.find().toArray();
        res.send(result)
      })
    //Category api
    app.get("/category", async(req,res) =>{
      const data = await categoryCollecton.find().toArray();
      res.send(data);
    })

    //specific Category product
    app.get("/product/:category", async(req,res) =>{
      const category = req.params.category;
      const query = {category: category}
      const data = await productCollection.find(query).toArray();
      res.send(data)
    })
    
    app.post("/addCategory", async(req,res) =>{
      const data = req.body;
      const result = await categoryCollecton.insertOne(data);
      res.send(result); 
    })

    //cart api

    //order api

    //payment api

    //reviews api


    // blog api 
    // Assuming you have a 'blogCollection' similar to 'productCollection' connected to your MongoDB

    // Get all blogs
    app.get('/allBlogs', async (req, res) => {
      try {
        const data = await blogCollection.find().toArray();
        res.send(data);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Get a specific blog
    app.get('/blog/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await blogCollection.findOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Add a blog
    app.post('/addBlog', async (req, res) => {
      try {
        const data = req.body;
        const result = await blogCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Update a blog
    app.put('/editBlog/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateData = req.body;
        const result = await blogCollection.updateOne(query, { $set: updateData });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Delete a blog
    app.delete('/deleteBlog/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await blogCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });


    //help api
   

    // Get all help content
    app.get('/allHelp', async (req, res) => {
      try {
        const data = await helpCollection.find().toArray();
        res.send(data);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Get a specific help content
    app.get('/help/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await helpCollection.findOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Add help content
    app.post('/addHelp', async (req, res) => {
      try {
        const data = req.body;
        const result = await helpCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Update help content
    app.put('/editHelp/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateData = req.body;
        const result = await helpCollection.updateOne(query, { $set: updateData });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Delete help content
    app.delete('/deleteHelp/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await helpCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("QuiEasy cart server is running successfully ")
})

app.listen(port, () => {
  console.log("Server is is running on port ", port);
})