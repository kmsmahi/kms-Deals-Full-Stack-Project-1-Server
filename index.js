require('dotenv').config({ path: '.env.local' });
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware - Enable CORS for Vite frontend
app.use(cors({
  origin: '*', // Allows all localhost origins during development
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
}));
app.use(express.json());

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
    // Keep connection alive
    await client.connect();
    console.log("Connected successfully to MongoDB!");

    const db = client.db('kmsdeals-db');
    const productsCollection = db.collection('products');
    const bidsCollection = db.collection('bids');

    // 1. Get Home Page Latest Products
    app.get('/latest-products', async (req, res) => {
      try {
        const result = await productsCollection
          .find()
          .sort({ created_at: -1 })
          .limit(6)
          .toArray();
        res.status(200).json(result);
      } catch (err) {
        console.error("Error fetching latest products:", err);
        res.status(500).json({ message: "Error fetching latest products", error: err.message });
      }
    });

    // 2. Get All Products
    app.get('/all-products', async (req, res) => {
      try {
        const result = await productsCollection.find().toArray();
        res.status(200).json(result);
      } catch (err) {
        console.error("Error fetching all products:", err);
        res.status(500).json({ message: "Error fetching products", error: err.message });
      }
    });

    // 3. Get Single Product Details by ID
    app.get('/productDetails/:id', async (req, res) => {
      try {
        const { id } = req.params;
        let query;

        if (ObjectId.isValid(id)) {
          query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
        } else {
          query = { _id: id };
        }

        const result = await productsCollection.findOne(query);

        if (!result) {
          return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(result);
      } catch (err) {
        console.error("Error fetching product details:", err);
        res.status(500).json({ message: "Error fetching product details", error: err.message });
      }
    });

    // 4. Get User Products
    app.get('/my-products/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const query = { 
          $or: [{ email: email }, { seller_email: email }] 
        };
        const result = await productsCollection.find(query).toArray();
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ message: "Error fetching user products", error: err.message });
      }
    });

    // 5. Get User Bids
    app.get('/my-bids/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const query = { buyer_email: email };
        const result = await bidsCollection.find(query).toArray();
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: "Error fetching user bids", error: error.message });
      }
    });

    // Health check endpoint
    app.get('/', (req, res) => {
      res.send('KmsDeals Server is Running...');
    });

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});