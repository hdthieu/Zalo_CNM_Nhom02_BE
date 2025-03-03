require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
