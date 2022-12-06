const express = require("express");
const config = require("../config");
const User = require("../models/users.model");
const ChatMessage = require("../models/chatMessages.model");
const Chatter = require("../models/chatster.model");
const Conversation = require("../models/conversations.model");
const jwt = require("jsonwebtoken");
const middleware = require("../middleware");
const router = express.Router();
const multer = require("multer");
const path = require("path");
// npm install jsonwebtoken
router.route("/login").post((req, res) => {
  User.findOne({ userName: req.body.userName }, (err, result) => {
    if (err) return res.status(500).json({ msg: err });
    if (result === null) {
      res.status(403).json("Username incorrect");
    }
    if (result.password == req.body.password) {
      let token = jwt.sign({ userName: req.body.userName }, config.key, {
        // expiresIn: "24h"
      });
      res.json({
        token: token,
        msg: "success",
      });
    } else {
      res.status(403).json("password is incorrect");
    }
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, req.decoded.userName + ".jpg");
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
      { userName: req.decoded.userName },
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

router.route("/register").post((req, res) => {
  console.log("inside the register");
  const user = new User({
    partition: req.body.partition,
    userName: req.body.userName,
    password: req.body.password,
    displayName: req.body.displayName,
    avatarImage: req.body.avatarImage,
    lastSeenAt: req.body.lastSeenAt,
    phoneNumber: req.body.phoneNumber,
    relationship: req.body.relationship,
    conversations: req.body.conversations,
    precense: req.body.precense,
  });
  user
    .save()
    .then(() => {
      console.log("user registered");
      res.status(200).json("ok");
    })
    .catch((err) => {
      res.status(403).json({ msg: err });
    });
});

router.route("/checkProfile").get(middleware.checkToken, (req, res) => {
  Profile.findOne({ userName: req.decoded.userName }, (err, result) => {
    if (err) return res.json({ err: err });
    else if (result == null) {
      return res.json({ status: false });
    } else {
      return res.json({ status: true });
    }
  });
});

router.route("/getData").get(middleware.checkToken, (req, res) => {
  Profile.findOne({ userName: req.decoded.userName }, (err, result) => {
    if (err) return res.json({ err: err });
    if (result == null) {
      return res.json({ data: [] });
    } else {
      return res.json({ data: result });
    }
  });
});

router.route("/get/chatters").get(middleware.checkToken, (req, res) => {
  User.findOne(
    { userName: req.decoded.userName },
    { "relationship.userName": 1, _id: 0 },
    (err, result) => {
      if (err) return res.json({ err: err });
      if (result == null) {
        return res.json({ data: [] });
      } else {
        const un = result.relationship.map((x) => x.userName);
        Chatter.find({ userName: { $in: un } }, { _id: 0 }).exec(
          async (err, result) => {
            if (err) return res.json({ err: err });
            return res.json({ data: result });
          }
        );
      }
    }
  );
});

router.route("/get/conversations").get(middleware.checkToken, (req, res) => {
  User.findOne(
    { userName: req.decoded.userName },
    { conversations: 1, _id: 0 },
    (err, result) => {
      if (err) return res.json({ err: err });
      if (result == null || !result.conversations.length) {
        return res.json({ data: [] });
      } else {
        Conversation.find(
          { _id: { $in: result.conversations } },
          (err, result) => {
            if (err) return res.json({ err: err });
            return res.json({ data: result });
          }
        );
      }
    }
  );
});

router
  .route("/get/relationship/:userName")
  .get(middleware.checkToken, (req, res) => {
    User.findOne(
      {
        userName: req.decoded.userName,
        relationship: { $elemMatch: { userName: req.params.userName } },
      },
      { "relationship.typeStatus": 1, _id: 0 },
      (err, result) => {
        if (err) return res.json({ err: err });
        if (result == null || !result.relationship.length) {
          return res.json({ data: [] });
        } else {
          return res.json(result.relationship[0].typeStatus);
        }
      }
    );
  });

router.route("/add/relationship").post(middleware.checkToken, (req, res) => {
  User.findOneAndUpdate(
    { userName: req.decoded.userName },
    { $push: { relationship: req.body.relationship } },
    (err, user) => {
      if (err) return res.status(500).send(err);
      const response = {
        message: "relationship added successfully updated",
        data: user,
      };
      return res.status(200).send(response);
    }
  );
});

router.route("/update").patch(middleware.checkToken, (req, res) => {
  let profile = {};
  Profile.findOne({ userName: req.decoded.userName }, (err, result) => {
    if (err) {
      profile = {};
    }
    if (result != null) {
      profile = result;
    }
  });
  Profile.findOneAndUpdate(
    { userName: req.decoded.userName },
    {
      $set: {
        name: req.body.name ? req.body.name : profile.name,
        profession: req.body.profession
          ? req.body.profession
          : profile.profession,
        DOB: req.body.DOB ? req.body.DOB : profile.DOB,
        titleline: req.body.titleline ? req.body.titleline : profile.titleline,
        about: req.body.about ? req.body.about : profile.about,
      },
    },
    { new: true },
    (err, result) => {
      if (err) return res.json({ err: err });
      if (result == null) {
        return res.json({ data: [] });
      } else {
        return res.json({ data: result });
      }
    }
  );
});

router.route("/delete/:username").delete(middleware.checkToken, (req, res) => {
  User.findOneAndDelete({ userName: req.params.userName }, (err, result) => {
    if (err) return res.status(500).json({ msg: err });
    const msg = {
      msg: "User deleted",
      userName: req.params.userName,
    };
    return res.json(msg);
  });
});

module.exports = router;
