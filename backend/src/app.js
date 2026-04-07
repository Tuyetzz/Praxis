// app.js
const express = require("express");
const app = express();
const auth = require("./interfaces/middlewares/authMiddleware");
app.use(express.json());

const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173" })); 
 
app.use("/api", require("./interfaces/routes"));



app.get("/", (req, res) => res.send("API running 🚀"));
module.exports = app;
