require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// routes
const connectDB = require("./config/db");
const userRoute = require("./routes/userRoutes");
const friendRoute = require("./routes/FriendRequestRoutes");
const messageRoute = require("./routes/MessageRoutes");
const groupRoute =  require("./routes/GroupRoutes")

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// use Routes
app.use("/users", userRoute);
app.use("/friendRequests", friendRoute);
app.use("/messages", messageRoute);
app.use("/groups",groupRoute);
app.listen(5000, () => console.log("Server running on port 5000"));
