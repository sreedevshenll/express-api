const express = require('express');
const router = express.Router();
var _ = require('lodash');
const bcrypt = require('bcrypt');
const saltRounds = 8;
const randtoken = require('rand-token');

const Users = require("./schemas/Users");

router.post('/auth',(req, res) => {
  let data = req.body;
  let email = data.email || "";
  let password = data.password || "";
  if(!email) {
    res.json({
      status: "error",
      message: "Email must not be empty."
    });
  } else if(!password) {
    res.json({
      status: "error",
      message: "Password must not be empty."
    });
  } else {
    Users.findOne({email}, (err, user) => {
      if(_.isEmpty(user)){
        bcrypt.hash(password, saltRounds, (err, hash) => {
          if(err) {
            res.json({
              status: "error",
              message: "Failed to create user."
            });
          } else {
            let authToken = randtoken.generate(16);
            let newUser = new Users({
              email,
              password: hash,
              authToken
            });
            newUser.save((err, user) => {
              if(err){
                res.json({
                  status: "error",
                  message: "Failed to create user."
                });
              } else {
                res.json({
                  status: "success",
                  message: "User created successfully.",
                  authToken
                });
              }
            });
          }
        });
      } else {
        bcrypt.compare(password, user.password, function(err, valid) {
          if(valid == true) {
            let authToken = randtoken.generate(16);
            Users.updateOne({_id: user._id},{authToken}, (uerr, update)=> {
              if(uerr){
                res.json({
                  status: "error",
                  message: "Error in validating user."
                }); 
              } else {
                res.json({
                  status: "success",
                  message: "User Authenticated Successfully.",
                  authToken
                }); 
              }
            });           
          } else {
            res.json({
              status: "error",
              message: "Invalid Password."
            });
          }
        });
      }
    });
  }
});

module.exports = router;