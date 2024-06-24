const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const userName = process.env.USER_NAME;
const key = process.env.SECRET_KEY;
const uri = `mongodb+srv://${userName}:${key}@cluster0.umjlkxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let client;
let foodCollection;
let userCollection;

async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        serverSelectionTimeoutMS: 5000,
      },
    });
    await client.connect();
    const productDb = client.db("organic_food");
    const userDb = client.db("userDB");
    foodCollection = productDb.collection("foods");
    userCollection = userDb.collection("users");
  }
}
// product routes
app.get("/foods", async (req, res) => {
  try {
    const foods = await foodCollection.find().toArray();
    res.send(foods);
  } catch (error) {
    console.error("Error occurred while getting foods:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/foods/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const food = await foodCollection.findOne({ _id: new ObjectId(id) });
    res.send(food);
  } catch (error) {
    console.error("Error occurred while getting food:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/food", async (req, res) => {
  try {
    const data = req.body;
    const result = await foodCollection.insertOne(data);
    res.send(result);
  } catch (error) {
    console.error("Error occurred while inserting food:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.patch("/food/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await foodCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data },
      { upsert: true }
    );
    res.send(result);
  } catch (error) {
    console.error("Error occurred while updating food:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/food/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.error("Error occurred while deleting food:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// user routes
app.get("/users", async (req, res) => {
  try {
    const users = await userCollection.find().toArray();
    res.send(users);
  } catch (error) {
    console.error("Error occurred while getting users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/user", async (req, res) => {
  const userData = req.body;
  const isUserExist = await userCollection.findOne({ email: userData.email });
  if (isUserExist?._id) {
    return res.send({
      status: "success",
    });
  }
  const result = await userCollection.insertOne(userData);
  res.send(result);
});

app.delete("/user/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.error("Error occurred while deleting food:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// default route
app.get("/", (req, res) => {
  res.send("organic food server is running");
});

// Start the server after ensuring database connection
async function startServer() {
  await connectToMongoDB();
  app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  });
}

startServer().catch(console.error);
