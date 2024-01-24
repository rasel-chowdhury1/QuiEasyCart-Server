const express = require('express'); 
const cors = require("cors");
const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = 'quiea65a8c0c26bf3f'
const store_passwd = 'quiea65a8c0c26bf3f@ssl'
const is_live = false;
const app = express();
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());

const accesstoken = '5a3103abec02da90090e3656d1de4074ff191eff1ad3b7f15847e3ba41713b1da9c4eaf825241a358361edc5def66c1bc1105579d31a044b0bc074350a85ab80'

const verifyJWT = (req, res, next) =>{
  const authorization = req.headers.authorization;
  // console.log('data from request of 14no line ',authorization)
  if(!authorization){
    return res.status(401).send({error: true, message: 'unauthorized access'})
  }
  //bearer token
  const token = authorization.split(' ')[1];
  // console.log('this token data form 20no line',token)
  jwt.verify(token, accesstoken, (err,decoded) =>{
    if(err){
      
      return res.status(401).send({error: true, message: 'unauthorized access'})
    }
    else{
      req.decoded = decoded;
      // console.log('verify jwt - ', decoded)
      next();
    }
  })
}


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
    const contactCollection = client.db('QuiEasyCartDB').collection('contacts')
    const cartCollection = client.db('QuiEasyCartDB').collection('carts')
    const requirementCollection = client.db('QuiEasyCartDB').collection('requirements');
    const categoryCollection = client.db('QuiEasyCartDB').collection('categories')
    const subCategoryCollection = client.db('QuiEasyCartDB').collection('subCategories')
    const brandCollection = client.db('QuiEasyCartDB').collection('brands')
    const sizeCollection = client.db('QuiEasyCartDB').collection('sizes')
    const blogCollection = client.db('QuiEasyCartDB').collection('blogs')
    const helpCollection = client.db('QuiEasyCartDB').collection('helps')
    const wishListCollection = client.db('QuiEasyCartDB').collection('wishlist')
    const faqCollection = client.db('QuiEasyCartDB').collection('frequentlyQuesAnswers')
    const orderCollection = client.db('QuiEasyCartDB').collection('orders')
    
    //jwt api
    // console.log('jwt key ',process.env.ACCESS_TOKEN_SECRET)
    app.post('/jwt', (req,res) =>{
      const user = req.body;
      const token = jwt.sign(user, accesstoken, {
        expiresIn: '1hr'})
      
      res.send({token})
    })
    
    //Warning: use verifyJWT before using verifyAdmin
    const verifyAdmin = async(req, res, next) =>{
      const email = req.decoded.email;
      // console.log('verify admin - ', email)
      const query = {email: new RegExp(email,'i')}
      // console.log('check query before find - ', query)
      const user = await useProfileCollection.findOne(query)
      // console.log('check user after find ' , user)
      if(user?.roll !== 'admin'){
        return res.status(403).send({error: true, message: 'forbidden message'})
      }
      // console.log(user)
      next()
    }


    
    //user api
    app.get('/allUsers', async(req,res) => {
      const result = await useProfileCollection.find().toArray()
      // console.log(result)
      res.send(result)
    })
    app.post('/addUser', async (req, res) => {
      const data = req.body;
      // console.log(data)
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

    //admin
    app.get('/users/admin/:email', verifyJWT,verifyAdmin, async(req,res) =>{
      const email = req.params.email;
      // console.log("this code print get method - ",email)

      if(req.decoded.email !== email){
        res.send({ admin: false})
      }

      const query = {email: new RegExp(email,'i')};
      const user = await useProfileCollection.findOne(query);
      const result = { admin: user?.roll === 'admin'};
      // console.log(result)
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req,res) =>{
      const id = req.params.id
      // console.log(id)
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          roll: 'admin'
        },
      };

    

      const result = await useProfileCollection.updateOne(filter,updateDoc);
      // console.log(result)
      res.send(result)
    })

    app.patch('/users/user/:id', async(req,res) =>{
      const id = req.params.id
      // console.log(id)
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          roll: 'user'
        },
      };

    

      const result = await useProfileCollection.updateOne(filter,updateDoc);
      // console.log(result)
      res.send(result)
    })

    //Post user Review 
    app.post('/addReview', async (req, res) => {
      const data = req.body;
      const result = await reviewCollection.insertOne(data)
      res.send(result)
      // console.log(result)
    })

    //get user Review 
    app.get('/getReview', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
    //Product api------------------------------
    app.get('/products', async (req, res) => {
      const category = {category: req.query.category} || '';
      // console.log('category value is ',category)
      const minimumPrice = {price: {$gte: parseFloat(req.query.min)}}
      const maximumPrice = {price : {$lte: parseFloat(req.query.max)}}
      // console.log("minimum and maximum price is - ",minimumPrice,maximumPrice)
      
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const skip = page * limit;
      // console.log(`page - ${page}, limit - ${limit}, skip - ${skip}`)
      let result;
      let total = 0;
      if(category.category ===  ''){
        console.log('clicked now')
        // console.log('minimum price', minimumPrice)
        // console.log('maximum price - ',maximumPrice)
        const data = await productCollection.find({$and:[minimumPrice,maximumPrice]}).toArray()
        total = data.length
        result = await productCollection.find({$and:[minimumPrice,maximumPrice]}).skip(skip).limit(limit).toArray();
      }
      else{
        // console.log('in else condition')
        // console.log('minimum price - ',minimumPrice)
        // console.log('maximum price - ',maximumPrice)
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
      // console.log(query)
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
      // console.log(data)
      const result = await requirementCollection.insertOne(data)
      res.send(result)
      // console.log(result)
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
      // console.log(category)
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
      console.log(result)
      res.send(result)
    })

    app.post('/carts', async (req, res) => {
      const item = req.body;
      console.log('hitted carts post api - ',item);
      const productId = {_id: new ObjectId(item.menuItemId)}
      
      // Check if the product already exists in the cart
      const existingCartItem = await cartCollection.findOne({ menuItemId: item.menuItemId,email: item.email });
      console.log('exist card data - ',existingCartItem)

      if(existingCartItem){
         // If the product exists, update the quantity in the existing cart item
        const newQuantity = existingCartItem.quantity + item.quantity;
        console.log('new Quantity - ', newQuantity)
        // Update the quantity in the cart collection
        const result = await cartCollection.updateOne(
          { menuItemId: item.menuItemId,email: item.email},
          { $set: { quantity: newQuantity } }
        );

        console.log('set then result - ',result)

        res.send(result);
      }
      else{
            const productData = await productCollection.find(productId).toArray()
          console.log('this is product data - ', productData[0])
          if(!productData){
            console.log('product data not found');
            return res.status(404).json({ error: 'Product not found' });
          }
          // console.log('productdata quantity is - ',productData[0].quantity)
          // console.log('item data quantity is ', item.quantity)
          if(productData[0].quantity >= item.quantity){
            // console.log('product found')
            const query = {}
            const result = await cartCollection.insertOne(item);
            console.log("this result added in cartcollection after the value",result)
            res.send(result);
          }
          else{
            return res.status(404).json({ error: 'this product quantity not available' });
          }
      }
      
    })


    app.put('/carts/:cartItemId', async (req, res) => {
      console.log('carts put api hitted - ',req.body)
      const { menuItemId} = req.body
      const id = {_id: new ObjectId(menuItemId)}
      const products = await productCollection.findOne(id);
      console.log('single product data quantity from carts put api - ', products.quantity)
      console.log('this is menuItemId - ', menuItemId)
      const { cartItemId } = req.params;
      const { quantity } = req.body;
      console.log('this cartid from put api ',cartItemId)
      console.log('this quantity from put api ', quantity)
  
      try {
        if(products.quantity+1 > quantity){
          // Update the cart quantity in the database
          const updatedCart = await cartCollection.findOneAndUpdate(
            { _id: new ObjectId(cartItemId) },
            { $set: { quantity } },
            { returnDocument: 'after' }
          );

          console.log('updated cart data - ',updatedCart)
    
          // if (!updatedCart.value) {
          //   return res.status(404).json({ error: 'Cart item not found' });
          // }
    
          res.send({data: 'successful',updatedCart: updatedCart});
          }
        else {
          return res.status(404).json({ error: 'not available this quantity.' });
        }
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query)
      // console.log(result)
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

    //Post contact api
    app.post('/addContact', async (req, res) => {
      try {
        const data = req.body;
        const result = await contactCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });


    // Get all contact content
    app.get('/allContact', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;
        const data = await contactCollection.find().toArray();
        let result;
        let total = data.length;
        if(total > limit){
           result = await contactCollection.find().skip(skip).limit(limit).toArray()
        }else{
          result = data;
        }
        res.send({len: total, result});
      } catch (err){
        res.status(500).send({ message: err.message });
      }
    });

     //Post wishlist api
     app.post('/addReact', async (req, res) => {
      try {
        const data = req.body;
        const result = await wishListCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

     // Get all wishlist content withPagination
     app.get('/reacts', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;
        const data = await wishListCollection.find().toArray();
        let result;
        let total = data.length;
        if(total > limit){
           result = await wishListCollection.find().skip(skip).limit(limit).toArray()
        }else{
          result = data;
        }
        res.send({len: total, result});
      } catch (err){
        res.status(500).send({ message: err.message });
      }
    });

    // Get all wishlist content
    app.get('/allReact', async (req, res) => {
      try {
        const data = await wishListCollection.find().toArray();
        res.send(data);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Delete wishlist content
    app.delete('/deleteReact/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await wishListCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });
     ///FAQ API Here------------------------------------------
    //Post faq api
    app.post('/addFaq', async (req, res) => {
      try {
        const data = req.body;
        const result = await faqCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

        // Update faq api
        app.put('/editFaq/:id', async (req, res) => {
          try {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateData = req.body;
            const result = await faqCollection.updateOne(query, { $set: updateData });
            res.send(result);
          } catch (err) {
            res.status(500).send({ message: err.message });
          }
        });

     // Get all faq api
     app.get('/allFaq', async (req, res) => {
      try {
        const data = await faqCollection.find().toArray();
        res.send(data);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Delete faq api
    app.delete('/deleteFaq/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await faqCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    //SSL commerze---------------------------
    app.post('/order', async(req, res) => {
      const {user_email,firstName, lastName, address, currency, mobile, amount,products} = req.body;
      

      const name = firstName + lastName;
      const trainId = new ObjectId().toString();
      
      const data = {
        total_amount: amount,
        currency: currency,
        tran_id: trainId, // use unique tran_id for each api call
        success_url: `https://quieasycarts.onrender.com/payment/success/${trainId}`,
        fail_url: `https://quieasycarts.onrender.com/payment/fail/${trainId}`,
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: name,
        cus_email: 'customer@example.com',
        cus_add1: address,
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: mobile,
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
      };
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
      sslcz.init(data).then(apiResponse => {
          // Redirect the user to payment gateway
          let GatewayPageURL = apiResponse.GatewayPageURL
          res.send({url: GatewayPageURL})
          const today = new Date();
          const date = today.toLocaleDateString("en-US")
          const finalOrder = {
            product: req.body,
            paidStatus: false,
            transactionId: trainId,
            date: date
          }

          const result = orderCollection.insertOne(finalOrder)
      });

      app.post('/payment/success/:trainId',async(req,res) => {
        const today = new Date();
        const date = today.toLocaleDateString("en-US")
         const result = await orderCollection.updateOne(
          {transactionId: req.params.trainId},
          {
            $set: {
               paidStatus: true,
               date: date,
            }
          }
         );
         if(result.modifiedCount > 0){
          const query = { email: user_email };
          const userCarts = await cartCollection.find(query).toArray();
          // console.log(userCarts)
          const queryies = {_id: { $in: userCarts.map(id => new ObjectId(id._id))}}
          // console.log('queryies data ',queryies)
          const deleteResult = await cartCollection.deleteMany(queryies)
          // Step 2: Process each cart
          
          for (const cartItem of userCarts) {
            const productId = cartItem.menuItemId; // Assuming menuItemId is the product ID
      
            const updatedProduct = await productCollection.findOneAndUpdate(
              { _id: new ObjectId(productId) },
              { $inc: { quantity: -cartItem.quantity } },
              { returnDocument: 'after' }
            );
      
            // Optionally, you can check the updatedProduct to see the updated document in the product collection
            // console.log(`Updated product with ID ${productId}:`, updatedProduct.value);
          }
          
          res.redirect(`http://localhost:5173/profile`)
         }
      })

      app.post('/payment/fail/:trainId',async(req,res) => {
        const today = new Date();
        const date = today.toLocaleDateString("en-US")
        const result = await orderCollection.updateOne(
          {transactionId: req.params.trainId},
          {
            $set: {
               paidStatus: false,
               date: date,
            }
          }
         );
         if(result.acknowledged){
          res.redirect(`http://localhost:5173/profile`)
         }
      })
  })

//get all order api
app.get('/allOrder',async (req,res) =>{
   const result = await orderCollection.find().toArray()
   res.send(result)
})

//delete order api
app.delete('/deleteOrder/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await orderCollection.deleteOne(query);
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