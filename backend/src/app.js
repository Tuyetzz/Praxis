// app.js
const express = require("express");
const app = express();
const httpLogger = require("./interfaces/middlewares/httpLogger");
const cors = require("cors");

app.use(express.json());
app.use(httpLogger);

app.use(cors({ origin: "http://localhost:5173" })); 
 
app.use("/api", require("./interfaces/routes"));

app.get("/", (req, res) => res.send("API running 🚀"));
module.exports = app;
