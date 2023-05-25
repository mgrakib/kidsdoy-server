/** @format */

const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const toys = require("./Data/toys.json");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nvffntx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});


async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		client.connect();
		// Send a ping to confirm a successful connection

		const toyCollection = client.db("kidsdoyDB").collection("toys");

		const indexKeys = { name: 1 };
		const indexOptions = { name: "kidsDoy" };
		const result = await toyCollection.createIndex(indexKeys, indexOptions);

		app.get("/toysSearchByName/:text", async (req, res) => {
			const searchText = req.params.text;
			const result = await toyCollection
				.find({
					name: { $regex: searchText, $options: "i" },
				})
				.toArray();

			res.send(result);
		});

		// get all data
		app.get("/all-toys", async (req, res) => {
			const result = await toyCollection.find().limit(20).toArray();
			res.send(result);
		});



		// get all data
		app.get("/all-toys-sort/:num", async (req, res) => {
			const num = req.params.num;
			const result = await toyCollection.find().sort({price :num}).limit(20).toArray();
			res.send(result);
		});

		// get single data
		app.get("/toy/:id", async (req, res) => {
			const id = req.params.id;
			const quary = { _id: new ObjectId(id) };
			const result = await toyCollection.findOne(quary);
			res.send(result);
		});

		// get data by catagory
		app.get("/toys", async (req, res) => {
			const categoryData = req.query.categroy;
			const quary = { category: categoryData };
			const result = await toyCollection.find(quary).toArray();
			res.send(result);
		});

		// get data by catagory
		app.get("/related", async (req, res) => {
			const categoryData = req.query.categroy;

			const quary = { typeof: categoryData };
			const result = await toyCollection.find(quary).toArray();
			res.send(result);
		});

		// get data by email
		app.get("/my-toys", async (req, res) => {
			const userEmail = req.query.email;
			const quary = { seller_email: userEmail };
			const result = await toyCollection.find(quary).toArray();
			res.send(result);
		});

		// get data by email
		app.get("/my-toys-sort/:num", async (req, res) => {
			const sortName = req.params.num;
			const userEmail = req.query.email;
			const quary = { seller_email: userEmail };
			const result = await toyCollection
				.find(quary)
				.sort({ price: sortName })
				.toArray();
			res.send(result);
		});

		// post data
		app.post("/add-toy", async (req, res) => {
			const data = req.body;
			const result = await toyCollection.insertOne(data);
			res.send(result);
		});

		// delete single data
		app.delete("/delete-toy/:id", async (req, res) => {
			const id = req.params.id;
			const quary = { _id: new ObjectId(id) };
			const result = await toyCollection.deleteOne(quary);
			res.send(result);
		});

		app.patch("/update-toy/:id", async (req, res) => {
			const body = req.body;
			const id = req.params.id;

			const filter = { _id: new ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					name: body.name,
					seller: body.seller,
					seller_email: body.seller_email,
					img: body.img,
					img2: body.img2,
					price: body.price,
					quantity: body.quantity,
					rating: body.rating,
					description: body.description,
				},
			};
			const result = await toyCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send(result);
		});

		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("server is running...");
});


app.listen(port, () => {
	console.log(`this server is running on port : ${port}`);
});
