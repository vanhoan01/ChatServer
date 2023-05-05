//https://www.section.io/engineering-education/agora-express-token-server/
//https://pub.dev/packages/agora_token_service/example
//https://www.agora.io/en/blog/connecting-to-agora-with-tokens-flutter/
const express = require("express");
const ChatMessage = require("../models/chatMessages.model");
const middleware = require("../middleware");
const Agora = require("agora-access-token");
const router = express.Router();

router.route("/rtctoken").post(middleware.checkToken, (req, res) => {
  const appID = "fc5fd6a4dc284209955a8d448ac503f7";
  const appCertificate = "bbb6a26ec5de4fc5a861c01050c48adf";
  const expirationTimeInSeconds = 3600 * 24;
  const uid = Math.floor(Math.random() * 100000);
  const role = Agora.RtcRole.PUBLISHER;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

  const token = Agora.RtcTokenBuilder.buildTokenWithAccount(
    appID,
    appCertificate,
    req.body.channelName,
    req.body.account,
    role,
    expirationTimestamp
  );
  console.log("channel: ", req.body.channelName);
  console.log("token: ", token);
  return res.json(token);
});

module.exports = router;
