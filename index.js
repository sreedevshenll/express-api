const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const port = 8080;

mongoose.connect("mongodb://localhost:27017/testexpress", { useNewUrlParser: true }, (error) => {
  if (error) {
    console.error("Please make sure Mongodb is installed and running!"); // eslint-disable-line no-console
    throw error;
  }
});

//to get and procress json request
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req,res) => {
  res.json({
    message: "Working Fine!"
  });
});

app.use('/user', require("./src/user"));

app.listen(port, () => {
  console.log("Express Server Started!");
});