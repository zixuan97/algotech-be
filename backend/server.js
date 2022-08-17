// const { MongoClient, ServerApiVersion } = require('mongodb')
require('dotenv').config()
const mongoose = require('mongoose')
const express = require("express")
const cors = require("cors")
const app = express()

const userRouter = require('./routes/user')
const gradesRouter = require('./routes/grades')

const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())

// const uri = process.env.ATLAS_URI
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
// client.connect(err => {
//   const collection = client.db("test").collection("devices")

//   console.log('Connected to MongoDB')
//   // perform actions on the collection object
//   client.close()
// })

const uri = process.env.ATLAS_URI
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
const connection = mongoose.connection
connection.once('open', ()=> {
    console.log('Connected to MongoDB successfully')
})

app.use('/users', userRouter)
app.use('/grades', gradesRouter)

app.listen(port, () => {
  console.log("Server running on port " + port)
})
