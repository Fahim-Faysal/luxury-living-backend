const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, Admin } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const port = process.env.PORT || 4000


app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.yeroo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);


async function run() {
      try {
            await client.connect()
            const database = client.db("luxury-living");
            const userCollection = database.collection("users")
            const messeageCollection = database.collection("messeages");
            const reviewCollection = database.collection("reviews");
            const bookingCollection = database.collection("booking")
            const serviceCollection = database.collection('services')
            const designCollection = database.collection('design')
            const todaysOrderCollectin = database.collection('todays_design_order')

            //post messeage

            app.post('/messeage', async (req, res) => {
                  const messeage = req.body;
                  const result = await messeageCollection.insertOne(messeage)
                  res.json(result)
            })

            //posting Reviews

            app.post('/review', async (req, res) => {
                  const review = req.body;
                  const result = await reviewCollection.insertOne(review)
                  res.json(result)
            })

            //posting service

            app.post('/booking', async (req, res) => {
                  const booking = req.body;
                  const result = await bookingCollection.insertOne(booking)
                  res.json(result)
            })

            //add a service

            app.post('/addservice', async (req, res) => {
                  const service = req.body
                  const result = await serviceCollection.insertOne(service)
                  res.json(result)
            })

            //save a user data

            app.post('/user', async (req, res) => {
                  const user = req.body;
                  const result = await userCollection.insertOne(user)
                  res.json(result)
            })

            //add todays design

            app.post('/design', async (req, res) => {
                  const design = req.body;
                  const result = await designCollection.insertOne(design)

                  res.json(result)

            })

            //add todays design orders

            app.post('/todaysorder', async (req, res) => {
                  const info = req.body;
                  const result = await todaysOrderCollectin.insertOne(info)

                  res.json(result)
            })

            //get todays design

            app.get('/todaysorder', async (req, res) => {
                  const mail = req.query.email;
                  const query = { email: mail }
                  const cursor = todaysOrderCollectin.find(query)
                  const result = await cursor.toArray()
                  res.json(result)
            })

            //deleter an design

            app.delete('/todaysorder/:id', async (req, res) => {
                  const id = req.params.id

                  const query = { _id: ObjectId(id) }
                  const result = await todaysOrderCollectin.deleteOne(query)
                  res.json(result)
            })


            //get project 

            app.get('/design', async (req, res) => {
                  const cursor = designCollection.find({})
                  const result = await cursor.toArray()

                  res.send(result)
            })

            //get the service

            app.get('/service', async (req, res) => {
                  const cursor = serviceCollection.find({})
                  const result = await cursor.toArray()
                  res.send(result)
            })

            //load booking

            app.get('/booking', async (req, res) => {
                  const mail = req.query.email;
                  const query = { email: mail }
                  const cursor = bookingCollection.find(query)
                  const result = await cursor.toArray()
                  res.send(result)

            })

            app.get('/booking/:id', async (req, res) => {
                  const id = req.params.id;
                  console.log(id);
                  const query = { _id: ObjectId(id) }
                  const result = await bookingCollection.findOne(query)
                  res.json(result)
            })
            app.delete('/booking/:id', async (req, res) => {
                  const id = req.params.id

                  const query = { _id: ObjectId(id) }
                  const result = await bookingCollection.deleteOne(query)
                  res.json(result)
            })

            //update
            app.put('/booking/:id', async (req, res) => {
                  const id = req.params.id;
                  const payment = req.body
                  const filter = { _id: ObjectId(id) }
                  const updateDoc = {
                        $set: {
                              payment: payment
                        }
                  }
                  const result = await bookingCollection.updateOne(filter, updateDoc)
                  res.json(result)
            })

            //load review

            app.get('/review', async (req, res) => {
                  const cursor = await reviewCollection.find({})
                  const result = await cursor.toArray()
                  res.json(result)
            })

            //make Admin

            app.put('/user', async (req, res) => {
                  const user = req.body;
                  console.log(user.email);
                  const filter = { email: user.email }
                  const upadateDoc = { $set: { role: 'admin' } };
                  const result = await userCollection.updateOne(filter, upadateDoc)
                  res.json(result)
            })

            app.get('/users/:email', async (req, res) => {
                  const email = req.params.email;
                  const query = { email: email };
                  const user = await userCollection.findOne(query)
                  let isAdmin = false;
                  if (user?.role === 'admin') {
                        isAdmin = true;
                  }
                  res.json({ admin: isAdmin })
            })

            app.post('/create-payment-intent', async (req, res) => {
                  const paymentInfo = req.body;
                  const amount = paymentInfo.price * 100;
                  const paymentIntent = await stripe.paymentIntents.create({
                        currency: 'usd',
                        amount: amount,
                        payment_method_types: ['card']
                  });
                  res.json({ clientSecret: paymentIntent.client_secret })
            })
      }
      catch {
            // await client.close();
      }
}
run().catch(console.dir);

app.get('/', (req, res) => {
      res.send("hello world")
})

app.listen(port, () => {
      console.log(`Port is Running at http://localhost:${port}`)
})