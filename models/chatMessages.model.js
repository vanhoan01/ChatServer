const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatMessage = Schema({
  author: {
    type: String,
    required: true,
  },
  partition: {
    type: String,
    required: true,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  reacts: [
    {
      userName: {
        type: String,
        required: true,
      },
      react: {
        type: String,
        default: "love",
      },
    },
  ],
});

module.exports = mongoose.model("ChatMessage", ChatMessage);
//love, haha, wow, sad, angry
