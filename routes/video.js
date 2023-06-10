const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".mp4");
  },
});

const upload = multer({
  storage: storage,
});

router.route("/addvideo").post(upload.single("video"), (req, res) => {
  try {
    res.json({ path: req.file.filename });
  } catch (e) {
    return res.json({ error: e });
  }
});

module.exports = router;
