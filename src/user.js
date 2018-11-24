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

function authentication(req, res, next) {
  let authToken = req.get("xy-authtoken");
  if(authToken) {
    Users.findOne({authToken}, (err, user) => {
      if(!_.isEmpty(user)) {
        next();
      } else {
        res.json({
          status: "error",
          message: "invalid_authtoken"
        });
      }
    });
  } else {
    res.json({
      status: "error",
      message: "authtoken_missing"
    });
  }
}

router.get('/profile', (req, res) => {
  let authToken = req.get("xy-authtoken");
  if(authToken) {
    Users.findOne({authToken}, (err, user) => {
      if(!_.isEmpty(user)) {
        let userData = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          address: user.address,
          dob: user.dob,
          profileUrl: user.profileUrl,
          created: user.created
        }
        let data ={
          user: userData
        }
        res.json({
          status: "success",
          message: "query_success",
          data: data
        })
      } else {
        res.json({
          status: "error",
          message: "invalid_authtoken"
        });
      }
    });
  } else {
    res.json({
      status: "error",
      message: "authtoken_missing"
    });
  }
});

router.post('/profile/update', authentication, (req, res) => {
  let authToken = req.get("xy-authtoken");
  let data = req.body;
  let user = {};
  if(data.firstName) user.firstName = data.firstName;
  if(data.lastName) user.lastName = data.lastName;
  if(data.address && !_.isEmpty(data.address)) {
    user.address = {};
    if(data.address.doorNumber) user.address.doorNumber = data.address.doorNumber;
    if(data.address.street) user.address.street = data.address.street;
    if(data.address.region) user.address.region = data.address.region;
    if(data.address.city) user.address.city = data.address.city;
    if(data.address.state) user.address.state = data.address.state;
    if(data.address.country) user.address.country = data.address.country;
    if(data.address.zipcode) user.address.zipcode = data.address.zipcode;
    if(data.address.phone) user.address.phone = data.address.phone;
  }
  if(data.dob) user.dob = data.dob;
  if(data.profileUrl) user.profileUrl = data.profileUrl;
  Users.updateOne({authToken}, user,(err, user) => {
    if(err) {
      res.json({
        status: "error",
        message: "error_profile_update"
      });
    } else {
      res.json({
        status: "success",
        message: "profile_update_success"
      });
    }
  });
});

module.exports = router;