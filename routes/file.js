const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/files");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + "");
  },
});

const upload = multer({
  storage: storage,
});

router.route("/uploadfile").post(upload.single("myfile"), (req, res) => {
  try {
    res.json({ path: req.file.filename });
    // res.send(file);
  } catch (e) {
    return res.json({ error: e });
  }
});

//route to download a file
router.route("/infofile/:file").get((req, res) => {
  var file = "./uploads/files/" + req.params.file;
  fs.stat(file, function (err, stats) {
    try {
      res.json(stats);
    } catch (error) {
      res.json(error);
    }
  });
  // res.get(file);
});
//https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries

module.exports = router;
