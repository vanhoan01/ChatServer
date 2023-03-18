const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = Schema({
  partition: {
    type: String,
    default: "p0",
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  avatarImage: {
    type: String,
    default: "",
  },
  biography: String,
  lastSeenAt: Date,
  phoneNumber: {
    type: String,
    required: true,
  },
  relationship: [
    {
      userName: String,
      typeStatus: String,
    },
  ],
  conversations: [String],
  precense: {
    type: String,
    default: "Không hoạt động",
  },
  link: String,
});

module.exports = mongoose.model("User", User);
