const express = require("express");
const config = require("../config");
const ChatMessage = require("../models/chatMessages.model");
const jwt = require("jsonwebtoken");
const middleware = require("../middleware");
const router = express.Router();
const multer = require("multer");
const path = require("path");
// npm install jsonwebtoken

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, req.decoded.username + ".jpg");
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.minetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 6,
  },
  // fileFilter: fileFilter
});

//add and update profile image
router
  .route("/add/image")
  .patch(middleware.checkToken, upload.single("img"), (req, res) => {
    Profile.findOneAndUpdate(
      { username: req.decoded.username },
      {
        $set: {
          img: req.file.path,
        },
      },
      { new: true },
      (err, profile) => {
        if (err) return res.status(500).send(err);
        const response = {
          message: "image added successfully updated",
          data: profile,
        };
        return res.status(200).send(response);
      }
    );
  });

router.route("/add").post((req, res) => {
  const chatMessage = new ChatMessage({
    author: req.body.author,
    partition: req.body.partition,
    isGroup: req.body.isGroup,
    text: req.body.text,
    image: req.body.image,
    timestamp: req.body.timestamp,
  });
  chatMessage
    .save()
    .then(() => {
      console.log("chatmessage add");
      res.status(200).json("ok");
    })
    .catch((err) => {
      res.status(403).json({ msg: err });
    });
});

router.route("/get/messages").post(middleware.checkToken, (req, res) => {
  ChatMessage.find({
    $or: [
      { author: req.decoded.userName, partition: req.body.partition },
      { author: req.body.partition, partition: req.decoded.userName },
    ],
  })
    .sort({ timestamp: -1 })
    .exec((err, result) => {
      if (err) return res.json({ err: err });
      return res.json({ data: result });
    });
});

router.route("/delete/:id").delete(middleware.checkToken, (req, res) => {
  User.findOneAndDelete({ id: req.params.id }, (err, result) => {
    if (err) return res.status(500).json({ msg: err });
    const msg = {
      msg: "Conversation deleted",
      username: req.params.id,
    };
    return res.json(msg);
  });
});

router.route("/get/lastmesage").post(middleware.checkToken, (req, res) => {
  ChatMessage.find(
    {
      $or: [
        { author: req.decoded.userName, partition: req.body.partition },
        { author: req.body.partition, partition: req.decoded.userName },
      ],
    },
    { _id: 0 }
  )
    .sort({ timestamp: -1 })
    .limit(1)
    .exec((err, result) => {
      if (err) return res.json({ err: err });
      return res.json(result);
    });
});

module.exports = router;
