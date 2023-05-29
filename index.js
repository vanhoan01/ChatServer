const express = require("express");
// const User = require("routers/user.model");
var http = require("http");
const port = process.env.PORT || 60000;
const app = express();
//npm run dev
var server = http.createServer(app);
var io = require("socket.io")(server);
const mongoose = require("mongoose");
const User = require("./models/users.model");
const Chatter = require("./models/chatster.model");

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

const fileRoute = require("./routes/file");
app.use("/file", fileRoute);

const audioRoute = require("./routes/audio");
app.use("/audio", audioRoute);

app.use("/uploads", express.static("uploads"));

const userRoute = require("./routes/user");
app.use("/user", userRoute);

const chatterRoute = require("./routes/chatter");
app.use("/chatter", chatterRoute);

const conversationRoute = require("./routes/conversation");
app.use("/conversation", conversationRoute);

const chatMessageRoute = require("./routes/chatMessage");
app.use("/chatmessage", chatMessageRoute);

const callRoute = require("./routes/call");
app.use("/call", callRoute);

io.on("connection", (socket) => {
  socket.on("signin", (id) => {
    console.log(id, "signin");
    clients[id] = socket;
    User.updateOne(
      {
        userName: id,
      },
      { $set: { precense: "Hoạt động" } },
      (err) => {
        if (err) console.log(err);
      }
    );
    User.updateOne(
      {
        userName: id,
      },
      { $set: { precense: "Hoạt động" } },
      (err) => {
        if (err) console.log(err);
      }
    );
    Chatter.updateOne(
      {
        userName: id,
      },
      { $set: { precense: "Hoạt động" } },
      (err) => {
        if (err) console.log(err);
      }
    );
    // console.log(clients);
  });

  socket.on("message", (msg) => {
    console.log("msg: ", msg);
    var boardws = clients[msg.partition]; //check if there is reciever connection
    if (boardws) {
      console.log("Có user: ", msg.partition);
      boardws.emit("message", msg);
      console.log("đã gửi về: ", msg.partition);
    } else {
      console.log("No reciever user found.");
    }
  });

  socket.on("calling", (caller, creceiver) => {
    //caller
    //receiver
    console.log("Calling to: ", creceiver);
    var boardws = clients[creceiver]; //check if there is reciever connection
    if (boardws) {
      console.log("Có user: ", creceiver);
      boardws.emit("calling", [caller, creceiver]);
      console.log("Nhận Called: ", [caller, creceiver]);
    } else {
      console.log("No reciever user found.");
    }
  });

  socket.on("activecontacts", (userName) => {
    console.log("activecontacts ", userName);
    User.findOne(
      { userName: userName },
      { relationship: 1, _id: 0 },
      (err, result) => {
        if (err) console.log(err);
        if (result == null) {
          console.log({ data: [] });
        } else {
          const unfilter = Object.values(result.relationship).filter(
            (rs) => rs.typeStatus === "Bạn bè"
          );
          const un = unfilter.map((x) => x.userName);
          User.find({ userName: { $in: un } }, { _id: 0 }).exec(
            async (err, result) => {
              if (err) console.log({ err: err });
              const updatedArray = result.map((element) => ({
                ...element._doc,
                isGroup: false,
              }));
              console.log("updatedArray ", updatedArray);
              console.log("Object.keys(clients) ", Object.keys(clients));
              const arr = updatedArray.filter((ele) =>
                Object.keys(clients).includes(ele["userName"])
              );

              // return res.json({ data: arr });
              var boardws = clients[userName];
              boardws.emit("activecontacts", arr);
              console.log("activecontacts ", arr.length);
            }
          );
        }
      }
    );
  });

  socket.on("disconnect", () => {
    var key = Object.keys(clients).find((key) => clients[key].id === socket.id);
    console.log("User Disconnected: ", key);
    delete clients[key];
    User.updateOne(
      {
        userName: key,
      },
      { $set: { precense: "Không hoạt động" } },
      (err) => {
        if (err) console.log(err);
      }
    );
    Chatter.updateOne(
      {
        userName: key,
      },
      { $set: { precense: "Không hoạt động" } },
      (err) => {
        if (err) console.log(err);
      }
    );
    // console.log(clients);
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
