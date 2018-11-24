const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let usersSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  address: {
    doorNumber: { type: String },
    street: { type: String },
    region: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipcode: { type: String },
    phone: { type: String }
  },
  dob: { type: Date },
  profileUrl: { type: String },
  created: { type: Date, default: Date.now },
  role: { type: String, enum: ['admin', 'merchant', 'customer'], default: "customer"},
  authToken: { type: String }
});

let Users = mongoose.model("Users", usersSchema);
module.exports = Users;