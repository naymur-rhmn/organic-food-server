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
    const database = client.db("organic_food");
    foodCollection = database.collection("foods");
  }
}

app.get("/foods", async (req, res) => {
  try {
    await connectToMongoDB();
    const foods = await foodCollection.find().toArray();
    res.send(foods);
  } catch (error) {
    console.error("Error occurred while getting foods:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/foods/:id", async (req, res) => {
  try {
    await connectToMongoDB();
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
    await connectToMongoDB();
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
    await connectToMongoDB();
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
    await connectToMongoDB();
    const id = req.params.id;
    const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.error("Error occurred while deleting food:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("organic food server is running");
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
