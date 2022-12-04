const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Conversation = Schema({
  displayName: {
    type: String,
    default: "Conversation",
  },
  avatarImage: {
    type: String,
    default: "",
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
  members: [
    {
      userName: String,
      memberShipStatus: {
        type: String,
        default: "Thành viên",
      },
      joinDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Conversation", Conversation);
