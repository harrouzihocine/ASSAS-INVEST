// ================ this is a Base Schema for all other users Type =================
const mongoose = require("mongoose");
const moment = require("moment");
const opts = {
  toJSON: {
    virtuals: true,
  },
};
//  This strategy integrates Mongoose with the passport-local strategy.
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const accountSchema = {
  accounttype: String,
  accountNumber: String,
};
const User = new Schema(
  {
    firstname: String,
    lastname: String,
    birthdate: String,
    phone: String,
    accounts: [accountSchema],

    gender: String,
    adress: {
      type: String,
    },
    role: [String], // a user could be an admin or normal user
    cases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Case",
      },
    ],
    loggedIn: {
      type: Date,
      default: Date.now,
    },
  },
  opts
);
// creating a virtual field named fullname and it's made of firstname and lastname
// this virtual property is not stored in the mongo DB
User.virtual("fullname").get(function () {
  return this.lastname + " " + this.firstname;
});
User.virtual("age").get(function () {
  var now = moment();
  var bday = moment(this.birthdate);
  return Math.round(now.diff(bday, "years", true));
});

User.index({
  lastname: "text",
  firstname: "text",
});
// this gonna add a password field to the user schema.

User.plugin(passportLocalMongoose, {
  usernameField: "email",
});
module.exports = mongoose.model("User", User);
