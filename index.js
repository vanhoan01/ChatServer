const express = require("express");
var http = require("http");
const port = process.env.PORT || 5000;
const app = express();
//npm run dev
var server = http.createServer(app);
var io = require("socket.io")(server);
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://hoanchatapp:251201@clusterchat.hfnrjxm.mongodb.net/ChatDB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .catch((err) => console.log(err.reason));

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDb connected");
});

//middLewre
app.use(express.json());
var clients = {};
const imageRoute = require("./routes/image");
app.use("/image", imageRoute);
app.use("/uploads", express.static("uploads"));

const userRoute = require("./routes/user");
app.use("/user", userRoute);

const chatterRoute = require("./routes/chatter");
app.use("/chatter", chatterRoute);

const conversationRoute = require("./routes/conversation");
app.use("/conversation", conversationRoute);

const chatMessageRoute = require("./routes/chatMessage");
app.use("/chatmessage", chatMessageRoute);

io.on("connection", (socket) => {
  console.log("connected");
  console.log(socket.id, "has joined");
  // socket.join("abc_group");
  socket.on("signin", (id) => {
    console.log(id);
    clients[id] = socket;
    console.log(clients);
  });
  socket.on("message", (msg) => {
    console.log(msg);
    // console.log('msg', msg, {...msg, sourceId: 'othermsg'});
    // io.to("abc_group").emit("sendMsgServer", { ...msg, sourceId: "otherMsg" });
    let targetId = msg.targetId;
    if (clients[targetId]) clients[targetId].emit("message", msg);
  });
});

data = {
  msg: "Welcome on Chat App",
  info: "This is a root endpoint",
  Working: "Documentations of other endpoints will be release soon",
};

app.route("/").get((req, res) => res.json(data));

server.listen(port, "0.0.0.0", () => {
  console.log("server started");
});
