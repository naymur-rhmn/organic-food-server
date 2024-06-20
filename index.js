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

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("organic_food");
    const foodCollection = database.collection("foods");

    // product routes
    // get all foods
    app.get("/foods", async (req, res) => {
      try {
        const foods = await foodCollection.find().toArray();
        res.send(foods);
      } catch (error) {
        console.error("Error occurred while get food:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    // get single food
    app.get("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const food = await foodCollection.findOne({ _id: new ObjectId(id) });
        res.send(food);
      } catch (error) {
        console.error("Error occurred while get food:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // post food
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

    // update food
    app.patch("/food/update/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const result = await foodCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data },
        { upsert: true }
      );
      res.send(result);
    });

    // delete food
    app.delete("/food/:id", async (req, res) => {
      const id = req.params.id;
      const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`listening from port: ${port}`);
});
