const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Chatter = Schema({
    partition: {
        type: String,
        default: "p0"
    },
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    avatarImage: {
        type: String,
        default: ""
    },
    lastSeenAt: Date,
    precense: {
        type: String,
        default: "Không hoạt động"
    }
});

module.exports = mongoose.model("Chatter", Chatter);