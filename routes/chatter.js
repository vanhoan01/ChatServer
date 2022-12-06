const express = require("express");
const config = require("../config");
const Chatter = require("../models/chatster.model");
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

router.route("/register").post((req, res) => {
  const chatter = Chatter({
    partition: req.body.partition,
    userName: req.body.userName,
    displayName: req.body.displayName,
    avatarImage: req.body.avatarImage,
    lastSeenAt: req.body.lastSeenAt,
    precense: req.body.precense,
  });
  chatter
    .save()
    .then(() => {
      return res.json({ msg: "Chatter successfully stored" });
    })
    .catch((err) => {
      return res.status(400).json({ err: err });
    });
});

router.route("/getData").get(middleware.checkToken, (req, res) => {
  Profile.findOne({ username: req.decoded.username }, (err, result) => {
    if (err) return res.json({ err: err });
    if (result == null) {
      return res.json({ data: [] });
    } else {
      return res.json({ data: result });
    }
  });
});

router.route("/update").patch(middleware.checkToken, (req, res) => {
  let profile = {};
  Profile.findOne({ username: req.decoded.username }, (err, result) => {
    if (err) {
      profile = {};
    }
    if (result != null) {
      profile = result;
    }
  });
  Profile.findOneAndUpdate(
    { username: req.decoded.username },
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
//req.params.query
router.route("/search/:query").get(middleware.checkToken, (req, res) => {
  Chatter.find({ displayName: { $regex: req.params.query, $options: "i" } })
    .sort({ displayName: 1 })
    .limit(20)
    .exec((err, result) => {
      if (err) return res.json({ err: err });
      return res.json({ data: result });
    });
});

router.route("/delete/:username").delete(middleware.checkToken, (req, res) => {
  User.findOneAndDelete({ username: req.params.username }, (err, result) => {
    if (err) return res.status(500).json({ msg: err });
    const msg = {
      msg: "User deleted",
      username: req.params.username,
    };
    return res.json(msg);
  });
});

module.exports = router;
