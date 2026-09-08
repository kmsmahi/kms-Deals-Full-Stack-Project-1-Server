# 🛍️ KMS-DEALS — Server

> A RESTful backend API for **KMS-DEALS**, a product marketplace and bidding platform built with Node.js, Express.js, and MongoDB.

---

## 📌 Project Overview

**KMS-DEALS Server** is the backend/API service of the KMS-DEALS full-stack marketplace application.

The server is responsible for handling:

* Product management
* Product listing and retrieval
* Product-specific details
* Bidding operations
* Bid status management
* User-specific products
* User-specific bids
* Product and bid deletion
* MongoDB database communication
* REST API responses
* Query optimization and indexing

This repository contains **only the server-side/backend implementation**. The client-side React application is maintained separately.

---

## 🚀 Project Title

# KMS-DEALS — Marketplace & Bidding API

**Project Type:** Server-Side / Backend Application

**Architecture:** RESTful API

**Database:** MongoDB

**Runtime:** Node.js

**Framework:** Express.js

---

## 🧰 Technology Stack

### Backend

| Technology                 | Purpose                           |
| -------------------------- | --------------------------------- |
| **Node.js**                | JavaScript runtime environment    |
| **Express.js**             | Web server and REST API framework |
| **MongoDB**                | NoSQL database                    |
| **MongoDB Node.js Driver** | Database communication            |
| **CORS**                   | Cross-Origin Resource Sharing     |
| **dotenv**                 | Environment variable management   |
| **JavaScript**             | Backend application logic         |

The repository's `package.json` confirms the use of Express 5, MongoDB 7, CORS, and dotenv.

### Database

The server uses MongoDB with the following primary collections:

```text
kmsdeals-db
│
├── products
│
└── bids
```

The MongoDB client is initialized using environment variables and connects to the `kmsdeals-db` database.

---

## 📝 Description

KMS-DEALS Server provides the backend infrastructure for an online marketplace where users can publish products and other users can place bids on those products.

The server exposes RESTful endpoints that allow the client application to communicate with MongoDB without directly accessing the database.

The basic architecture is:

```text
React Client
     │
     │ HTTP Requests
     ▼
Express.js Server
     │
     │ MongoDB Driver
     ▼
MongoDB Database
     │
     ▼
JSON Response
     │
     ▼
React Client
```

The backend uses Express middleware for JSON request parsing and CORS support, while MongoDB handles persistent storage.

---

# ✨ Features

## 📦 1. Product Management

The server provides APIs for creating, retrieving, and deleting marketplace products.

Supported operations include:

* Create a product
* Retrieve all products
* Retrieve latest products
* Retrieve a single product
* Retrieve products belonging to a seller
* Delete a product

Product data is stored in the `products` MongoDB collection.

---

## 🆕 2. Latest Products API

The backend provides a dedicated endpoint for retrieving the latest products.

```http
GET /latest-products
```

The endpoint:

* Sorts products by creation date
* Returns the newest products first
* Limits the result to six products
* Uses MongoDB projection to return only the fields required for product cards

This reduces unnecessary data transfer and improves query efficiency.

---

## 🛍️ 3. All Products API

The server provides an endpoint for retrieving marketplace products:

```http
GET /all-products
```

Products are sorted by `created_at` in descending order, allowing the newest listings to appear first.

---

## 🔎 4. Product Details

Individual products can be retrieved using their ID:

```http
GET /productDetails/:id
```

The server validates the supplied ID and handles both valid MongoDB `ObjectId` values and string-based IDs.

If the requested product does not exist, the API returns a `404` response.

---

# 💰 Bidding System

## 5. Create a Bid

Users can submit bids through:

```http
POST /bids
```

The server stores information including:

* Product ID
* Buyer name
* Buyer email
* Buyer contact
* Buyer image
* Bid price
* Bid status
* Creation timestamp

New bids are automatically assigned:

```text
status: pending
```

The bid is then stored in the `bids` collection.

---

## 📋 6. Retrieve Product Bids

The server provides:

```http
GET /bids/product/:productId
```

This endpoint retrieves all bids associated with a particular product.

---

## 🔄 7. Update Bid Status

Bid status can be updated using:

```http
PATCH /bids/:id
```

The backend supports bid status changes such as:

```text
pending
confirmed
rejected
```

The status is updated directly in MongoDB using an update operation.

---

## 👤 8. My Bids

Users can retrieve their submitted bids through:

```http
GET /my-bids?email=user@example.com
```

The server uses a MongoDB aggregation pipeline to:

1. Filter bids by buyer email
2. Convert product IDs when necessary
3. Join bid information with product information
4. Return the associated product details

This provides the client with bid information together with the related product data.

---

## 🗑️ 9. Delete / Withdraw a Bid

Users can remove a bid using:

```http
DELETE /bids/:id
```

The server identifies the bid using its MongoDB `ObjectId` and deletes it from the `bids` collection.

---

# 🏪 Seller Product Management

## 10. Create Product Listing

Authenticated users can create marketplace listings through:

```http
POST /products
```

The server accepts the submitted product information and stores it in MongoDB together with a `created_at` timestamp.

---

## 👤 11. Retrieve User Products

A seller can retrieve their own products through:

```http
GET /my-products?email=user@example.com
```

The server filters the `products` collection using the seller's email and sorts the results by creation date.

---

## ❌ 12. Delete Product

Products can be removed using:

```http
DELETE /products/:id
```

The backend converts the supplied ID into a MongoDB `ObjectId` and deletes the corresponding product document.

---

# ⚡ Database Optimization

The backend includes MongoDB indexes to improve query performance.

Indexes are created for:

```text
products.created_at
products.seller_email
products.category

bids.buyer_email
bids.product
```

These indexes support common queries such as:

* Latest product retrieval
* Seller-specific product retrieval
* Category-based queries
* User bid retrieval
* Product-specific bid retrieval

The server also uses MongoDB projections for product-card queries so that unnecessary fields such as full descriptions are not returned when they are not needed.

---

# 🗂️ Project Structure

The server repository is intentionally lightweight and currently centers around a single Express entry point and its configuration/dependency files.

```text
kms-Deals-Full-Stack-Project-1-Server/
│
├── node_modules/
│
├── .gitignore
│
├── index.js
│
├── package.json
│
├── package-lock.json
│
└── .env.local
```

### `index.js`

The main backend entry point.

Responsible for:

* Express server initialization
* Middleware configuration
* MongoDB connection
* Database collections
* MongoDB indexes
* REST API routes
* CRUD operations
* Error handling
* Server startup

The current implementation contains the complete API logic inside `index.js`.

### `.env.local`

Stores sensitive database credentials and environment-specific configuration.

Example structure:

```env
DB_USER=your_database_username
DB_PASS=your_database_password
PORT=3000
```

> **Important:** Never commit real database credentials or other secrets to GitHub.

### `package.json`

Contains the project's metadata, scripts, and backend dependencies.

The current server uses:

```text
express
mongodb
cors
dotenv
```

and starts through:

```bash
npm start
```

---

# 🔌 API Overview

| Method   | Endpoint                   | Purpose                      |
| -------- | -------------------------- | ---------------------------- |
| `GET`    | `/`                        | Server health/basic response |
| `GET`    | `/latest-products`         | Retrieve latest products     |
| `GET`    | `/all-products`            | Retrieve all products        |
| `GET`    | `/productDetails/:id`      | Retrieve product details     |
| `GET`    | `/bids/product/:productId` | Retrieve bids for a product  |
| `POST`   | `/bids`                    | Create a new bid             |
| `PATCH`  | `/bids/:id`                | Update bid status            |
| `GET`    | `/my-bids`                 | Retrieve user's bids         |
| `DELETE` | `/bids/:id`                | Delete a bid                 |
| `POST`   | `/products`                | Create a product             |
| `GET`    | `/my-products`             | Retrieve seller's products   |
| `DELETE` | `/products/:id`            | Delete a product             |

These endpoints are implemented in the repository's Express server.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/kmsmahi/kms-Deals-Full-Stack-Project-1-Server.git
```

## 2. Navigate to the Server

```bash
cd kms-Deals-Full-Stack-Project-1-Server
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
PORT=3000
```

The application loads these variables through `dotenv` before creating the MongoDB connection.

## 5. Start the Server

```bash
npm start
```

The server uses the configured `PORT` value and defaults to port `3000` when no port is provided.

---

# 🔐 Environment & Security

Sensitive configuration should be kept outside the source code.

The server uses:

```javascript
require('dotenv').config({
    path: '.env.local'
});
```

MongoDB credentials are then loaded from environment variables rather than being hard-coded directly into the application.

### Recommended `.gitignore`

```gitignore
node_modules/
.env
.env.local
.env.*
```

> Never expose your MongoDB username, password, connection credentials, API keys, or other secrets in a public repository.

---

# 🏗️ Server Architecture

```text
                   ┌──────────────────────┐
                   │   React Client App   │
                   └──────────┬───────────┘
                              │
                         HTTP / JSON
                              │
                              ▼
                   ┌──────────────────────┐
                   │    Express Server    │
                   │       Node.js        │
                   └──────────┬───────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
        Product APIs      Bid APIs        Middleware
             │                │
             └────────────────┼────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │       MongoDB        │
                   │                      │
                   │  ┌───────────────┐   │
                   │  │   products    │   │
                   │  ├───────────────┤   │
                   │  │     bids      │   │
                   │  └───────────────┘   │
                   └──────────────────────┘
```

---

# 📡 Request Flow

A typical product request follows this flow:

```text
Client
  │
  │ GET /productDetails/:id
  ▼
Express Route
  │
  ▼
Request Validation
  │
  ▼
MongoDB Query
  │
  ▼
MongoDB Collection
  │
  ▼
JSON Response
  │
  ▼
Client UI
```

For a new bid:

```text
Client
  │
  │ POST /bids
  ▼
Express
  │
  ▼
Read request body
  │
  ▼
Create bid document
  │
  ▼
MongoDB
  │
  ▼
201 Created
  │
  ▼
Client
```

---

# 🎯 Key Backend Highlights

* ⚡ Node.js + Express REST API
* 🍃 MongoDB database integration
* 📦 Product CRUD operations
* 💰 Complete bidding workflow
* 🔄 Bid status management
* 👤 User-specific product queries
* 📋 User-specific bid queries
* 🔗 MongoDB aggregation with `$lookup`
* 🗑️ Product and bid deletion
* 🚀 MongoDB query optimization
* 📊 Database indexing
* 🎯 MongoDB projection for optimized responses
* 🌐 CORS configuration
* 🔐 Environment-based database credentials
* ⚠️ HTTP status codes and error responses
* 🔄 Asynchronous database operations using `async/await`

---

# 🔗 Related Client Application

The frontend/client application for KMS-DEALS is maintained in a separate repository.

**Client Repository:**

`kms-Deals-Full-Stack-Project-1-Clients`

The client communicates with this server through the REST API endpoints described above.

---

# 👨‍💻 Builder

## Kazi Md. Salauddin Mahi

**Computer Science & Engineering**
**International Islamic University Chittagong (IIUC)**

Passionate about web development, backend engineering, MERN stack technologies, REST API development, and building practical full-stack applications.

### GitHub

**[@kmsmahi](https://github.com/kmsmahi)**

---

# 📄 Project Scope

This repository contains **only the server-side implementation** of KMS-DEALS.

### Included

* Node.js server
* Express.js REST API
* MongoDB integration
* Product APIs
* Bidding APIs
* CRUD operations
* MongoDB aggregation
* Database indexing
* Query optimization
* Environment configuration
* Error handling

### Not Included

* React frontend
* Frontend UI components
* Client-side routing
* Firebase client authentication interface
* Frontend styling

---

## ⭐ Final Note

KMS-DEALS Server acts as the data and API layer of the KMS-DEALS marketplace, providing structured REST endpoints for product listings and the complete bidding workflow while communicating directly with MongoDB.

---

