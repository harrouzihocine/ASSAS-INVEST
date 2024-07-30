// ================ this is a Base Schema for all other users Type =================
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    gender: String,
    address: {
      type: String,
    },
    role: [String], // a user could be an admin or normal user
    cases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Case",
      },
    ],
    approved: {
      type: Boolean,
      default: true,
    },
  

    loggedIn: [
      {
        type: Date,
        default: Date.now,
      },
    ],
    createdAt: {
      type: String,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    hash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
      default: "undefined",
    },
    resetToken: {
      token: String,
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      expires: {
        type: Date,
        default: Date.now(),
      },
    },
  },
  opts
);
// creating a virtual field named fullname and it's made of firstname and lastname
// this virtual property is not stored in the mongo DB
User.plugin(passportLocalMongoose);
User.virtual("fullname").get(function () {
  return this.lastname + " " + this.firstname;
});
User.virtual("age").get(function () {
  var now = moment();
  var bday = moment(this.birthdate);
  return Math.round(now.diff(bday, "years", true));
});
User.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.salt = salt;
  this.hash = await bcrypt.hash(this.hash, salt);

  next();
});
User.methods.verifyPassword = function (password, hash) {
  return bcrypt.compareSync(password, hash);
};
module.exports = mongoose.model("User", User);
