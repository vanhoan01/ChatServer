const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/audios");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + "");
  },
});

const upload = multer({
  storage: storage,
});

router.route("/uploadaudio").post(upload.single("myaudio"), (req, res) => {
  try {
    res.json({ path: req.file.filename });
    // res.send(file);
  } catch (e) {
    return res.json({ error: e });
  }
});
//https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries

module.exports = router;
