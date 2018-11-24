const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const port = 8080;
const Users = require("./src/schemas/Users");
const bcrypt = require('bcrypt');
const saltRounds = 8;
const randtoken = require('rand-token');
const _ = require('lodash');

mongoose.connect("mongodb://localhost:27017/testexpress", { useNewUrlParser: true }, (error) => {
  if (error) {
    console.error("Please make sure Mongodb is installed and running!"); // eslint-disable-line no-console
    throw error;
  }
});

function configureAdmin() {
  console.log("Init admin config");
  let email = "admin@localhost";
  let password = "expr3s5";
  let role = "admin";
  Users.findOne({email},(err, user) => {
    if(err){
      console.log("Error getting admin details");
    } else if(_.isEmpty(user)) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err) {
          console.log("Failed to configure admin")
        } else {
          let authToken = randtoken.generate(16);
          let newUser = new Users({
            email,
            password: hash,
            authToken,
            role
          });
          newUser.save((err, user) => {
            if(err){
              console.log("Error added admin to DB")
            } else {
              console.log("Admin configured successfully")
            }
          });
        }
      });
    } else {
      console.log("Admin already configured!");
    }
  })
}

configureAdmin();

//to get and procress json request
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req,res) => {
  res.json({
    message: "Express 4 Server Started"
  });
});

app.use('/user', require("./src/user"));

app.listen(port, () => {
  console.log("Express Server Started!");
});