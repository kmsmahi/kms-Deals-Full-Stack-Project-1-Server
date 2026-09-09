require('dotenv').config({ path: '.env.local' });
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS explicitly for local dev (handling dynamically assigned ports)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or local dev ports
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // Set to true for dev
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
    await client.connect();
    console.log("Connected successfully to MongoDB!");

    const db = client.db('kmsdeals-db');
    const productsCollecton = db.collection('products');
    const bidsCollecton = db.collection('bids');

    const cardProjection = {
      title: 1,
      category: 1,
      condition: 1,
      price_min: 1,
      price_max: 1,
      usage_time: 1,
      image: 1,
      created_at: 1,
      seller_email: 1
    };

    // Show 6 latest products for Home page
    app.get('/latest-products', async (req, res) => {
      try {
        const result = await productsCollecton
          .find({}, { projection: cardProjection })
          .sort({ created_at: -1 })
          .limit(6)
          .toArray();
        res.send(result);
      } catch (err) {
        console.error("Database query error on /latest-products:", err);
        res.status(500).send({ message: "Error fetching products", err: err.message });
      }
    });

    // Show all products for All Products page
    app.get('/all-products', async (req, res) => {
      try {
        const result = await productsCollecton
          .find({}, { projection: cardProjection })
          .sort({ created_at: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        console.error("Database query error on /all-products:", err);
        res.status(500).send({ message: "Error fetching products", err: err.message });
      }
    });

    // Product details endpoint
    app.get('/productDetails/:id', async (req, res) => {
      try {
        const id = req.params.id;
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
        res.status(500).send({ message: "Error fetching product details", err: err.message });
      }
    });

    // Bids endpoints
    app.get('/bids/product/:productId', async (req, res) => {
      try {
        const { productId } = req.params;
        const bids = await bidsCollecton.find({ product: productId }).toArray();
        res.status(200).send(bids);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch bids" });
      }
    });

    app.post('/bids', async (req, res) => {
      try {
        const { product, buyer_image, buyer_name, buyer_contact, buyer_email, bid_price } = req.body;
        const newBid = {
          product,
          buyer_image,
          buyer_name,
          buyer_contact,
          buyer_email,
          bid_price: Number(bid_price),
          status: 'pending',
          created_at: new Date()
        };
        const result = await bidsCollecton.insertOne(newBid);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to submit bid" });
      }
    });

    app.patch('/bids/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: { status: status } };
        const result = await bidsCollecton.updateOne(filter, updateDoc);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to update status" });
      }
    });

    app.get('/my-bids', async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.status(400).send({ message: "Email parameter required" });

        const bids = await bidsCollecton.aggregate([
          { $match: { buyer_email: email } },
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
          {
            $lookup: {
              from: 'products',
              localField: 'productObjId',
              foreignField: '_id',
              as: 'productDetails'
            }
          },
          { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } }
        ]).toArray();

        res.send(bids);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch bids", error: error.message });
      }
    });

    app.delete('/bids/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bidsCollecton.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post('/products', async (req, res) => {
      try {
        const productData = req.body;
        const result = await productsCollecton.insertOne({
          ...productData,
          created_at: productData.created_at ? new Date(productData.created_at) : new Date()
        });
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to create product listing", error: error.message });
      }
    });

    app.get('/my-products', async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.status(400).send({ message: "Email parameter required" });
        const result = await productsCollecton.find({ seller_email: email }).sort({ created_at: -1 }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch user products", error: error.message });
      }
    });

    app.delete('/products/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await productsCollecton.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to delete product", error: error.message });
      }
    });

  } catch (error) {
    console.error("FATAL: MongoDB Connection Failed!", error.message);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('kms deals backend running');
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});