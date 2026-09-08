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
    const bidsCollecton=db.collection('bids');

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

// get all bids information........

app.get('/bids/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Search bids matching the product ID
    const query = { product: productId };
    const bids = await bidsCollecton.find(query).toArray();

    res.status(200).send(bids);
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).send({ message: "Failed to fetch bids" });
  }
});
// create new bid.......


app.post('/bids', async (req, res) => {
  try {
    const { product, buyer_image, buyer_name, buyer_contact, buyer_email, bid_price } = req.body;

    const newBid = {
      product: product, // Product ID reference
      buyer_image,
      buyer_name,
      buyer_contact,
      buyer_email,
      bid_price: Number(bid_price),
      status: 'pending', // Initial status
      created_at: new Date()
    };

    const result = await bidsCollecton.insertOne(newBid);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error creating bid:", error);
    res.status(500).send({ message: "Failed to submit bid" });
  }
});

// upadte the bid actions.....

app.patch('/bids/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed' or 'rejected'

    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { status: status }
    };

    const result = await bidsCollecton.updateOne(filter, updateDoc);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error updating bid status:", error);
    res.status(500).send({ message: "Failed to update status" });
  }
});
  // get data for my bids page
//     app.get('/my-bids', async (req, res) => {
//   const email = req.query.email;
//   if (!email) {
//     return res.status(400).send({ message: "Email parameter is required" });
//   }
//   const query = { buyer_email: email }; 
//   const result = await bidsCollecton.find(query).toArray();
//   res.send(result);
// });


// Get data for my bids page with populated product info
app.get('/my-bids', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).send({ message: "Email parameter is required" });
    }

    const bids = await bidsCollecton.aggregate([
      {
        $match: { buyer_email: email }
      },
      // Convert string product ID to ObjectId if stored as ObjectId, or match string directly
      {
        $addFields: {
          productObjId: {
            $cond: {
              if: { $regexMatch: { input: "$product", regex: /^[0-9a-fA-F]{24}$/ } },
              then: { $toObjectId: "$product" },
              else: "$product"
            }
          }
        }
      },
      // Join with products collection
      {
        $lookup: {
          from: 'products',
          localField: 'productObjId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      // Unwind the array returned by lookup
      {
        $unwind: {
          path: '$productDetails',
          preserveNullAndEmptyArrays: true
        }
      }
    ]).toArray();

    res.send(bids);
  } catch (error) {
    console.error("Error in /my-bids aggregation:", error);
    res.status(500).send({ message: "Failed to fetch bids", error: error.message });
  }
});


// perform delete in mybids page.....
app.delete('/bids/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await bidsCollecton.deleteOne(query);
  res.send(result);
});


// Create a new product listing
app.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    const result = await productsCollecton.insertOne(productData);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send({ message: "Failed to create product listing", error: error.message });
  }
});


// Fetch products created by a specific user
app.get('/my-products', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).send({ message: "Email query parameter is required" });
    }

    const query = { seller_email: email };
    const result = await productsCollecton.find(query).sort({ created_at: -1 }).toArray();

    res.send(result);
  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).send({ message: "Failed to fetch user products", error: error.message });
  }
});

// Delete a product listing
app.delete('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await productsCollecton.deleteOne(query);

    res.send(result);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({ message: "Failed to delete product", error: error.message });
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