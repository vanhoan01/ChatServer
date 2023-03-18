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
  type: {
    type: String,
    default: "text",
  },
  text: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  reacts: {
    type: [
      {
        userId: {
          type: String,
          required: true,
        },
        react: {
          type: String,
          default: "love",
        },
      },
    ],
    default: [],
  },
  reply: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("ChatMessage", ChatMessage);
//love, haha, wow, sad, angry
