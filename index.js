const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");
const bodyParser = require("body-parser");
const app = express();
const Notes = require("./routes/Note");
var cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/note", Notes);

mongoose.connect(
  process.env.DB_CONNECTION,
  {
    useNewUrlParser: true,
  },
  () => console.log("connected to db")
);

app.listen(3001, () => console.log("server started"));
