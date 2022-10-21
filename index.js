const express = require('express')
const app = express()
let mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient
require('dotenv').config()
const URL = process.env.DB_URL
const cors = require("cors")

app.use(express.json());
app.use(cors({
    origin: "*"
}))

app.get("/", (req, res) => {
    res.send("Hall booking api Server is working perfectly!!!")
})

// ---------------------- 1. Creating a Room ----------------------

app.post('/createhall', async (req, res) => {
    try {
        const connection = await mongoClient.connect(URL)
        const db = await connection.db("Hall_booking_api")
        await db.collection('halls').insertOne(req.body)
        connection.close()
        res.json({ message: 'Hall created 👍' })
    } catch (error) {
        console.log(error)
    }
})

app.get('/halls', async (req, res) => {
    try {
        const connection = await mongoClient.connect(URL)
        const db = await connection.db('Hall_booking_api')
        const halls = await db.collection('halls').find().toArray()
        connection.close()
        res.json(halls)
    } catch (error) {
        console.log(error)
    }

})


// ---------------------- 2. Booking a Room ----------------------

app.post('/addcustomer', async (req, res) => {
    try {
        let { Date } = req.body
        let date = new Date()
        Date = date
        const connection = await mongoClient.connect(URL)
        const db = await connection.db("Hall_booking_api")
        await db.collection('customers').insertOne(req.body)
        connection.close()
        res.json({ message: 'customer created' })
    } catch (error) {
        console.log(error)
    }
})

app.get('/customers', async (req, res) => {
    try {
        const connection = await mongoClient.connect(URL)
        const db = await connection.db('Hall_booking_api')
        const customers = await db.collection('customers').find().toArray()
        connection.close()
        res.json(customers)
    } catch (error) {
        console.log(error)
    }
})

// ---------------------- 3.List All Rooms With Booked Data ----------------------

app.get('/bookedhalls', async (req, res) => {
    try {
        const connection = await mongoClient.connect(URL)
        const db = await connection.db('Hall_booking_api')
        const halls = await db.collection('halls').aggregate([
            {
                '$match': {
                    'isBooked': true
                }
            }, {
                '$unwind': {
                    'path': '$customersIds'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'customersIds',
                    'foreignField': '_id',
                    'as': 'CustomerDetails'
                }
            }, {
                '$unwind': {
                    'path': '$CustomerDetails'
                }
            }, {
                '$group': {
                    '_id': '$name',
                    'customersName': {
                        '$push': '$CustomerDetails.name'
                    },
                    'Date': {
                        '$push': '$CustomerDetails.Date'
                    },
                    'StartTime': {
                        '$push': '$CustomerDetails.startTime'
                    },
                    'EndTime': {
                        '$push': '$CustomerDetails.endTime'
                    }
                }
            }
        ]).toArray()
        res.json(halls)
        connection.close()
    } catch (error) {
        console.log(error)
    }

})

// ---------------------- 4. List All Customers With Booked Data ----------------------

app.get('/bookedcustomers', async (req, res) => {
    try {
        const connection = await mongoClient.connect(URL)
        const db = await connection.db('Hall_booking_api')
        const halls = await db.collection('customers').aggregate([
            {
                '$lookup': {
                    'from': 'halls',
                    'localField': 'roomId',
                    'foreignField': '_id',
                    'as': 'roomDetails'
                }
            }, {
                '$unwind': {
                    'path': '$roomDetails'
                }
            }, {
                '$project': {
                    'name': 1,
                    'contact': 1,
                    'startTime': 1,
                    'endTime': 1,
                    'roomDet': {
                        '_id': 1,
                        'name': 1
                    }
                }
            }
        ]).toArray()
        res.json(halls)
        connection.close()
    } catch (error) {
        console.log(error)
    }

})


app.listen(process.env.PORT || 3010, () => console.log(`Server is running at 3010`))