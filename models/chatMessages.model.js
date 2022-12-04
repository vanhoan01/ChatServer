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
});

module.exports = mongoose.model("ChatMessage", ChatMessage);
