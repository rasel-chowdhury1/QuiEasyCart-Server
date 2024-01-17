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
    const reviewCollection = client.db('QuiEasyCartDB').collection('userReview')

    const requirementCollection = client.db('QuiEasyCartDB').collection('requirements');
    const categoryCollection = client.db('QuiEasyCartDB').collection('categories')
    const subCategoryCollection = client.db('QuiEasyCartDB').collection('subCategories')
    const brandCollection = client.db('QuiEasyCartDB').collection('brands')
    const sizeCollection = client.db('QuiEasyCartDB').collection('sizes')
    const blogCollection = client.db('QuiEasyCartDB').collection('blogs')
    const helpCollection = client.db('QuiEasyCartDB').collection('helps')

    //user api
    app.post('/addUser', async (req, res) => {
      const data = req.body;
      console.log(data)
      const user = req.body;
      // console.log(user)
      const query = { email: user.email }

      const existingUser = await useProfileCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await useProfileCollection.insertOne(data)
      res.send(result)
    })

    //all user get
    app.get('/allUsers', async (req, res) => {
      const data = await useProfileCollection.find().toArray()
      res.send(data)
    })

       //specific user get
       app.get('/user/:id', async (req, res) => {
        const id = req.params.id;
        const query = { userId: id }
        const result = await useProfileCollection.findOne(query)
        res.send(result)
      })

       //specific user get for admin
       app.get('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id) }
        const result = await useProfileCollection.findOne(query)
        res.send(result)
      })


        //update Profile 
    app.patch('/updateProfile/:id', async (req, res) => {
      const profileData = req.body;
      const id = req.params.id;
      const { firstName, lastName, phone, email, birthDate, image, gender, address, userId } = profileData;
      console.log('from server', firstName, lastName, phone, email, birthDate, image, gender, address, userId)
      const result = await useProfileCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            gender: gender,
            birthDate: birthDate,
            image: image,
            address: address
          }
        }
      )
      res.send(result)
      console.log(result)
    })

// delete user 
     app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await useProfileCollection.deleteOne(query)
      console.log(result)
      res.send(result)
    })


    //Post user Review 
    app.post('/addReview', async (req, res) => {
      const data = req.body;
      const result = await reviewCollection.insertOne(data)
      res.send(result)
      console.log(result)
    })

    //get user Review 
    app.get('/getReview', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
    //Product api------------------------------
    app.get('/products', async (req, res) => {
      const category = {category: req.query.category} || '';
      console.log('category value is ',category)
      const minimumPrice = {price: {$gte: parseFloat(req.query.min)}}
      const maximumPrice = {price : {$lte: parseFloat(req.query.max)}}
      console.log("minimum and maximum price is - ",minimumPrice,maximumPrice)
      
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const skip = page * limit;
      console.log(`page - ${page}, limit - ${limit}, skip - ${skip}`)
      let result;
      let total = 0;
      if(category.category ===  ''){
        console.log('clicked now')
        console.log('minimum price', minimumPrice)
        console.log('maximum price - ',maximumPrice)
        const data = await productCollection.find({$and:[minimumPrice,maximumPrice]}).toArray()
        total = data.length
        result = await productCollection.find({$and:[minimumPrice,maximumPrice]}).skip(skip).limit(limit).toArray();
      }
      else{
        console.log('in else condition')
        console.log('minimum price - ',minimumPrice)
        console.log('maximum price - ',maximumPrice)
        const data = await productCollection.find({$and: [category,{$and:[minimumPrice,maximumPrice]}]}).toArray()
        total = data.length
        if(data.length > limit){
          result = await productCollection.find({$and: [category,{$and:[minimumPrice,maximumPrice]}]}).skip(skip).limit(limit).toArray();
        }
        else{
          result = data;
        }
         
      }
      
      const obj = {len: total, result}
      // console.log(obj)
      res.send(obj);
    })

    app.get('/adminproducts', async(req, res) => {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const skip = page * limit;
      const result = await productCollection.find().toArray();
      const total = result.length
      const data = await productCollection.find().skip(skip).limit(limit).toArray();
      const obj = {productlen : total, result : data}
      res.send(obj)
    })

    app.get('/api/search', async (req, res) => {
      const { query } = req.query;

      const results = await productCollection.find({
        $or: [
          { name: { $regex: query, $options: 'i' } }, // case-insensitive search for name
          { category: { $regex: query, $options: 'i' } }, // case-insensitive search for description
          { subCategory: { $regex: query, $options: 'i' } }, // case-insensitive search for description
          { detailssubCategory: { $regex: query, $options: 'i' } }, // case-insensitive search for description
        ],
      }).toArray();

      // console.log(results)
  
      res.json(results);

    })

    

    app.get('/singleProduct/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      console.log(query)
      const result = await productCollection.find(query).toArray();
      res.send(result);
    })

    

    app.get('/totalProducts', async (req, res) => {
      const result = await productCollection.estimatedDocumentCount();
      res.send({ totalProducts: result });
    })
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

    //Relative product get
    app.get("/products/:subCategory", async (req, res) => {
      const subCategory = req.params.subCategory;
      const query = { subCategory: subCategory};
      const result = await productCollection.find(query).toArray();
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
    app.post('/addRequirement', async (req, res) => {
      const data = req.body;
      console.log(data)
      const result = await requirementCollection.insertOne(data)
      res.send(result)
      console.log(result)
    })

    //getRequirement
    app.get('/allRequirements', async (req, res) => {
      result = await requirementCollection.find().toArray();
      res.send(result)
    })

    //add Category
    app.post('/addCategory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { category: id }
      const category = await categoryCollection.findOne(query)
      console.log(category)
      const data = req.body;
      if (category && (category.category === data.category)) {
        console.log('Category is exists')
      } else {
        const result = await categoryCollection.insertOne(data)
        res.send(result)
        console.log(result)
      }

    })

    //getCategory
    app.get('/allCategories', async (req, res) => {
      result = await categoryCollection.find().toArray();
      res.send(result)
    })

    //add subCategory
    app.post('/addSubCategory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { subCategory: id }
      const subCategory = await subCategoryCollection.findOne(query)
      console.log('subCategory', subCategory)
      const data = req.body;
      if (subCategory && (subCategory.category === data.category) && (subCategory.subCategory === data.subCategory)) {
        console.log('subCategory is exists')
      } else {

        console.log(data)
        const result = await subCategoryCollection.insertOne(data)
        res.send(result)
        console.log(result)
      }


    })

    //getSubCategory
    app.get('/allSubCategories', async (req, res) => {
      result = await subCategoryCollection.find().toArray();
      res.send(result)
    })

    //add brand
    app.post('/addBrand/:id', async (req, res) => {
      const id = req.params.id;
      const query = { brand: id }
      const brand = await brandCollection.findOne(query)
      const data = req.body;
      if (brand && (brand.subCategory === data.subCategory) && (brand.brand === data.brand)) {
        console.log('brand is exists')
      } else {
        console.log(data)
        const result = await brandCollection.insertOne(data)
        res.send(result)
        console.log(result)
      }


    })

    //getBrand
    app.get('/allBrands', async (req, res) => {
      result = await brandCollection.find().toArray();
      res.send(result)
    })

    //add size
    app.post('/addSize/:id', async (req, res) => {
      const id = req.params.id;
      const query = { size: id }
      const size = await sizeCollection.findOne(query)
      console.log('size', size)
      const data = req.body;
      console.log('data of siz', data)
      if (size && (size.brand === data.brand) && (size.size === data.size)) {
        console.log('size is exists')
      } else {

        console.log(data)
        const result = await sizeCollection.insertOne(data)
        res.send(result)
        console.log('result of size', result)
      }

    })

    //get Size
    app.get('/allSizes', async (req, res) => {
      result = await sizeCollection.find().toArray();
      res.send(result)
    })
    //Category api
    app.get("/category", async (req, res) => {
      const data = await categoryCollecton.find().toArray();
      res.send(data);
    })

    //specific Category product
    app.get("/product/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category }
      const data = await productCollection.find(query).toArray();
      res.send(data)
    })

    app.post("/addCategory", async (req, res) => {
      const data = req.body;
      const result = await categoryCollecton.insertOne(data);
      res.send(result);
    })

    //cart api
    app.get('/carts', async (req, res) => {
      const email = req.query.email
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/carts', async (req, res) => {
      const item = req.body;
      // console.log(item);
      const result = await cartCollection.insertOne(item);
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query)
      console.log(result)
      res.send(result)
    })

    //order api

    //payment api

    //reviews api


    // blog api 
    // Assuming you have a 'blogCollection' similar to 'productCollection' connected to your MongoDB

    // Add a blog
    app.post('/addBlog', async (req, res) => {
      try {
        const data = req.body;
        console.log(data)
        const result = await blogCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

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


    // Update a blog
    app.put('/editBlog/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateData = req.body;
        console.log(updateData)
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