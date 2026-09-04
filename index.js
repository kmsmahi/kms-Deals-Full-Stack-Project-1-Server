require('dotenv').config({path:'.env.local'});
const { MongoClient, ServerApiVersion } = require('mongodb');
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