const express = require("express");
const config = require("../config");
const ChatMessage = require("../models/chatMessages.model");
const User = require("../models/users.model");
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
    type: req.body.type,
    text: req.body.text,
    size: req.body.size,
    timestamp: req.body.timestamp,
    reply: req.body.reply,
  });
  chatMessage
    .save()
    .then((_id) => {
      console.log("chatmessage add");
      const response = {
        message: "chatmessage add",
        data: _id,
      };
      return res.status(200).send(response);
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

router.route("/get/calls").get(middleware.checkToken, (req, res) => {
  ChatMessage.find({
    $and: [
      {
        $or: [
          { author: req.decoded.userName },
          { partition: req.decoded.userName },
        ],
      },
      { $or: [{ type: "Video call" }, { type: "Audio call" }] },
    ],
  })
    .sort({ timestamp: -1 })
    .exec((err, result) => {
      if (err) return res.json({ err: err });
      return res.json({ data: result });
    });
});

router.route("/get/photos").get(middleware.checkToken, (req, res) => {
  User.findOne({ userName: req.decoded.userName }, (err, result) => {
    // if (err) return res.json({ err: err });
    ChatMessage.find({
      $and: [
        {
          $or: [
            { author: req.decoded.userName },
            { partition: req.decoded.userName },
            { partition: { $in: result["conversations"] } },
          ],
          $or: [{ type: "image" }, { type: "video" }],
        },
      ],
    })
      .sort({ timestamp: -1 })
      .exec((err, result) => {
        if (err) return res.json({ err: err });
        return res.json({ data: result });
      });
  });
});

router.route("/get/saveds").get(middleware.checkToken, (req, res) => {
  User.findOne({ userName: req.decoded.userName }, (err, result) => {
    // if (err) return res.json({ err: err });
    ChatMessage.find({
      _id: { $in: result["saved"] },
    })
      .sort({ timestamp: -1 })
      .exec((err, result) => {
        if (err) return res.json({ err: err });
        return res.json({ data: result });
      });
  });
});

router.route("/get/files").get(middleware.checkToken, (req, res) => {
  User.findOne({ userName: req.decoded.userName }, (err, result) => {
    // if (err) return res.json({ err: err });
    ChatMessage.find({
      $and: [
        {
          $or: [
            { author: req.decoded.userName },
            { partition: req.decoded.userName },
            { partition: { $in: result["conversations"] } },
          ],
        },
        { type: "file" },
      ],
    })
      .sort({ timestamp: -1 })
      .exec((err, result) => {
        if (err) return res.json({ err: err });
        return res.json({ data: result });
      });
  });
});

router.route("/get/profilereacts").get(middleware.checkToken, (req, res) => {
  User.findOne({ userName: req.decoded.userName }, (err, result) => {
    ChatMessage.find({ "reacts.userId": result._id })
      .sort({ timestamp: -1 })
      .exec((err, result) => {
        if (err) return res.json({ err: err });
        return res.json({ data: result });
      });
  });
});

router.route("/get/messageid/:id").get(middleware.checkToken, (req, res) => {
  ChatMessage.findById({ _id: req.params.id }, (err, result) => {
    if (err) return res.json({ err: err });
    return res.json(result);
  });
});

router.route("/get/messagesgroup").post(middleware.checkToken, (req, res) => {
  ChatMessage.find({
    partition: req.body.partition,
  })
    .sort({ timestamp: -1 })
    .exec((err, result) => {
      if (err) return res.json({ err: err });
      return res.json({ data: result });
    });
});

router.route("/add/reacts").post(middleware.checkToken, (req, res) => {
  ChatMessage.findOneAndUpdate(
    { _id: req.body.id },
    { $push: { reacts: req.body.react } },
    (err, user) => {
      if (err) return res.status(500).send(err);
      const response = {
        message: "reacts added successfully updated",
        data: user,
      };
      return res.status(200).send(response);
    }
  );
});

router.route("/delete/reacts").post(middleware.checkToken, (req, res) => {
  ChatMessage.findOneAndUpdate(
    { _id: req.body.id },
    { $pull: { reacts: { userId: req.body.userId } } },
    (err, user) => {
      if (err) return res.status(500).send(err);
      const response = {
        message: "reacts delete successfully updated",
        data: user,
      };
      return res.status(200).send(response);
    }
  );
});

router.route("/update/reacts").post(middleware.checkToken, (req, res) => {
  ChatMessage.updateOne(
    { _id: req.body.id, "reacts.userId": req.body.userId },
    { $set: { "reacts.$.react": req.body.react } },
    (err, user) => {
      if (err) return res.status(500).send(err);
      const response = {
        message: "reacts update successfully updated",
        data: user,
      };
      return res.status(200).send(response);
    }
  );
});

router.route("/updatecallend").post(middleware.checkToken, (req, res) => {
  ChatMessage.updateOne(
    { _id: req.body.id },
    { $set: { size: req.body.size } },
    (err, user) => {
      if (err) return res.status(500).send(err);
      const response = {
        message: "reacts update successfully updated",
        data: user,
      };
      return res.status(200).send(response);
    }
  );
});

router.route("/delete/:id").delete(middleware.checkToken, (req, res) => {
  ChatMessage.findOneAndDelete({ _id: req.params.id }, (err, result) => {
    if (err) return res.status(500).json({ msg: err });
    const msg = {
      msg: "ChatMessage deleted",
      username: req.params.id,
    };
    return res.json(msg);
  });
});

router
  .route("/get/lastmesage/:partition")
  .get(middleware.checkToken, (req, res) => {
    ChatMessage.findOne(
      {
        $or: [
          { author: req.decoded.userName, partition: req.params.partition },
          { author: req.params.partition, partition: req.decoded.userName },
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

router
  .route("/get/lastmesagegroup/:partition")
  .get(middleware.checkToken, (req, res) => {
    ChatMessage.findOne(
      {
        $or: [
          { partition: req.params.partition },
          { author: req.params.partition },
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
