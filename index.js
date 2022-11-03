const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { yellow } = require("colors");
require("colors");
require("dotenv").config();

//middle ware
app.use(cors());
app.use(express.json());
// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8gtonc3.mongodb.net/?retryWrites=true&w=majority`;

// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
//main async function

async function run() {
  try {
    await client.connect();
    console.log("database connect".yellow.bold);
  } catch (error) {
    console.log(error.name.red, error.message.bold, error.stack);
  }
}
run();
const serviceCollection = client.db("geniusCarService").collection("services");
const orderCollection = client.db("geniusCarService").collection("orders");
app.get("/services", async (req, res) => {
  try {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send({
      success: true,
      message: "successfully got the data",
      data: services,
    });
  } catch (error) {
    console.log(error.name.red, error.message.bold, error.stack);
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//backend er data load er janno app.get
app.get("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const service = await serviceCollection.findOne({ _id: ObjectId(id) });

    // const id = req.params.id;
    // const query = { _id: ObjectId(id) };
    // const service = await serviceCollection.findOne(query);
    res.send({
      success: true,
      message: "successfully got the data",
      data: service,
    });
  } catch (error) {
    console.log(error.name.red, error.message.bold, error.stack);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//orders api(order=req.body likhlam na )
app.post("/orders", async (req, res) => {
  try {
    const result = await orderCollection.insertOne(req.body);

    if (result.insertedId) {
      res.send({
        success: true,
        message: `Successfully created the ${req.body.name} with id ${result.insertedId}`,
        // message: "successfully create the order",
      });
    } else {
      res.send({ success: false, error: " your order not available" });
    }
  } catch (error) {
    console.log(error.name.red, error.message.bold, error.stack);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("genius car server is running");
});
app.listen(port, () => {
  console.log(`Genius Car Server running on ${port}`);
});
