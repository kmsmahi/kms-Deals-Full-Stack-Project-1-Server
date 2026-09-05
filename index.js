require('dotenv').config({path:'.env.local'});
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Quick check to see if variables are loading correctly
console.log("DB User:", process.env.DB_USER);

// Safe URL encoding for special characters in password
const dbUser = process.env.DB_USER;
const dbPass = encodeURIComponent(process.env.DB_PASS || '');

const uri = `mongodb+srv://${dbUser}:${dbPass}@myfirstmongodb.a95ilzk.mongodb.net/?appName=myFirstMongodb`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db=client.db('kmsdeals-db');
    const productsCollecton=db.collection('products');

    // show 6 data in home page........

    app.get('/latest-products',async(req,res)=>{
      try{
        const result=await productsCollecton.find().sort({
        created_at:-1}).limit(6).toArray();
        res.send(result);
      }
      catch(err){
        res.status(500).send({message:"Error fetching products....",err});
      }
    });

    // show all data in all products page.....

    app.get('/all-products',async(req,res)=>{
      try{
        const result=await productsCollecton.find().toArray();
        res.send(result);
      }
      catch(err){
        res.status(500).send({message:"Error fetching products....",err});
      }
    });


    // show product details based on id......
app.get('/productDetails/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the ID string is valid 24-character hex string before constructing ObjectId
    let query;
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } else {
      query = { _id: id };
    }

    const result = await productsCollecton.findOne(query);

    if (!result) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.send(result);
  } catch (err) {
    console.error("Fetch product error:", err);
    res.status(500).send({ message: "Error fetching product details", err: err.message });
  }
});

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('salauddin mahi');
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});