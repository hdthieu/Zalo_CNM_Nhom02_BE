require('dotenv').config();
const mongoose = require('mongoose');   
mongoose.connect(process.env.MONGO_ATLAS_CONNECTION_STRING);

mongoose.connection.on('error', (error) => console.log("Mongoose connection error: " + error));

const app = require('express');

app.listen(8000, () => {console.log('Server is running on port 8000')});