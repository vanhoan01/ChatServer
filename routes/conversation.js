const express = require("express");
const config = require("../config");
const Conversation = require("../models/conversations.model");
const User = require("../models/users.model");
const jwt = require("jsonwebtoken");
const middleware = require("../middleware");
const router = express.Router();
// npm install jsonwebtoken

router.route("/add").post((req, res) => {
  const conversation = new Conversation({
    displayName: req.body.displayName,
    avatarImage: req.body.avatarImage,
    unreadCount: req.body.unreadCount,
    members: req.body.members,
  });
  conversation
    .save()
    .then((result) => {
      var users = [];
      result.members.forEach((element) => {
        users.push(element.userName);
      });
      User.updateMany(
        { userName: { $in: users } },
        {
          $push: {
            conversations: result._id,
          },
        },
        (err) => {
          if (err) return res.status(500).json({ msg: err });
          // return res.json(user);
        }
      );
      return res.json({ data: result });
    })
    .catch((err) => {
      res.status(403).json({ msg: err });
    });
});

router.route("/get/group/:id").get(middleware.checkToken, (req, res) => {
  Conversation.findOne({ _id: req.params.id }, (err, result) => {
    if (err) return res.json({ err: err });
    if (result == null) {
      return res.json({ data: [] });
    } else {
      return res.json(result);
    }
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

router.route("/delete/member").post(middleware.checkToken, (req, res) => {
  Conversation.updateOne(
    { _id: req.body.id },
    { $pull: { members: { userName: req.decoded.userName } } },
    (err) => {
      if (err) return res.status(500).send(err);
      console.log(req.decoded.userName);
      User.updateOne(
        { userName: req.decoded.userName },
        { $pull: { conversations: req.body.id } },
        (err, user) => {
          if (err) return res.status(500).send(err);
          const response = {
            message: "group delete successfully updated",
            data: user.conversations,
          };
          return res.status(200).send(response);
        }
      );
    }
  );
});

router.route("/add/member").post(middleware.checkToken, (req, res) => {
  Conversation.findOneAndUpdate(
    { _id: req.body.id },
    { $push: { members: { $each: req.body.members } } },
    (err) => {
      if (err) return res.status(500).send(err);
      var userNames = req.body.members.map((element) => element.userName);
      console.log(userNames);
      User.updateMany(
        { userName: { $in: userNames } },
        { $push: { conversations: req.body.id } },
        (err) => {
          if (err) return res.status(500).send(err);
          const response = {
            message: "group update successfully updated",
          };
          return res.status(200).send(response);
        }
      );
    }
  );
});

module.exports = router;
