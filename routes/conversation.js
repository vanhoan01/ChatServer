const express = require("express");
const config = require("../config");
const Conversation = require("../models/conversations.model");
const User = require("../models/users.model");
const jwt = require("jsonwebtoken");
const middleware = require("../middleware");
const router = express.Router();
// npm install jsonwebtoken

router.route("/add").post((req, res) => {
  console.log("inside the register");
  const conversation = new Conversation({
    displayName: req.body.displayName,
    unreadCount: req.body.unreadCount,
    members: req.body.members,
  });
  conversation
    .save()
    .then((result) => {
      result.members.forEach((element) => {
        User.findOneAndUpdate(
          { userName: element.userName },
          {
            $push: {
              conversations: result._id,
            },
          },
          (err, result) => {
            if (err) return res.status(500).json({ msg: err });
            return res.json({ msg: "conversation successfully updated" });
          }
        );
      });
    })
    .catch((err) => {
      res.status(403).json({ msg: err });
    });
});

router.route("/delete/:id").delete(middleware.checkToken, (req, res) => {
  Conversation.findOneAndDelete({ id: req.params.id }, (err, result) => {
    if (err) return res.status(500).json({ msg: err });
    const msg = {
      msg: "Conversation deleted",
      username: req.params.id,
    };
    return res.json(msg);
  });
});

module.exports = router;
