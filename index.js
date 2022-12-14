const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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
//jwt function

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      res.status(401).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

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

//jwt api
app.post("/jwt", (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res.send({
      success: true,
      message: "successfully got the data",
      token: { token },
    });
  } catch (error) {
    console.log(error.name.red, error.message.bold, error.stack);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/services", async (req, res) => {
  try {
    const search = req.query.search;
    console.log(search);
    // const query = {
    //   $text: {
    //     $search: search,
    //   },
    // };
    let query = {};
    if (search.length) {
      query = {
        $text: {
          $search: search,
        },
      };
    }
    // const query = { price: { $gt: 20, $lt: 300 } };
    const order = req.query.order === "asc" ? 1 : -1;
    const cursor = serviceCollection.find(query).sort({ price: order });
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
// all order dekhbo order.js database theke
app.get("/orders", verifyJWT, async (req, res) => {
  try {
    const decoded = req.decoded;
    console.log("inside order api", decoded);
    if (decoded.email !== req.query.email) {
      res.status(403).send({ message: "unauthorized access" });
    }
    let query = {};
    if (req.query.email) {
      query = {
        email: req.query.email,
      };
    }
    const cursor = orderCollection.find(query);
    const orders = await cursor.toArray();
    res.send({
      success: true,
      message: "successfully got the order data",
      data: orders,
    });
  } catch (error) {
    console.log(error.name.red, error.message.bold, error.stack);
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//orders api(order=req.body likhlam na )data insert korlam post die database  te
app.post("/orders", verifyJWT, async (req, res) => {
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
app.patch("/orders/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await orderCollection.updateOne(
      { _id: ObjectId(id) },
      { $set: req.body }
    );

    if (result.matchedCount) {
      res.send({
        success: true,
        message: `successfully updated ${req.body.name}`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't update  the product",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.delete("/orders/:id", verifyJWT, async (req, res) => {
  try {
    //kontake delete korsi name saho caile 142line must  dibo 141 dibo na,eki jinish 2nd toime delet nakorar janno emonvabe korbo(2.14mint e)
    // const product = await orders.findOne({ _id: ObjectId(id) });

    // if (!product?._id) {
    //   res.send({
    //     success: false,
    //     error: "Product doesn't exist",
    //   });
    //   return;
    // }
    const { id } = req.params;
    const result = await orderCollection.deleteOne({ _id: ObjectId(id) });

    if (result.deletedCount) {
      res.send({
        success: true,
        message: `Successfully deleted the the order`,
        // message: `Successfully deleted the ${order.name}`,
      });
    } else {
    }
  } catch (error) {
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
