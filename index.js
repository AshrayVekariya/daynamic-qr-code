require('dotenv').config()
const express = require('express')
const app = express();
const cors = require('cors');

const connectMongoDB = require('./config/connection');
const router = require('./routes');

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', router);

// connection
const URI = process.env.DB_CONNECTION_URL
const PORT = process.env.PORT
connectMongoDB(URI)
    .then(() => {
        console.log('Database connected successfully!')
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        })
    })
    .catch((err) => console.error("Coudn't connect database", err));