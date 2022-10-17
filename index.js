const express = require("express");
var http = require("http");
const app = express();
const port = process.env.PORT || 5000;
var server = http.createServer(app);
var io = require("socket.io")(server);
const mongoose = require("mongoose");

mongoose.connect(
    "mongodb+srv://hoanchatapp:251201@clusterchat.hfnrjxm.mongodb.net/?retryWrites=true&w=majority",
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).catch(err => console.log(err.reason));

const connection = mongoose.connection;
connection.once("open", ()=>{
    console.log("MongoDb connected");
});

//middLewre
app.use(express.json());
// var clients = {};
const routes = require("./routes");
app.use("/routes", routes);
app.use("/uploads", express.static("uploads"));

// io.on("connection", (socket)=>{
//     console.log("connected");
//     console.log(socket.id, "has joined");
//     socket.on("signin", (id)=>{
//         console.log(id);
//         clients[id]=socket;
//         console.log(clients);
//     });
//     socket.on("message", (msg)=>{
//         console.log(msg);
//         let targetId = msg.targetId;
//         if(clients[targetId])
//             clients[targetId].emit("message", msg);
//     });
// });

data = {
    msg: "Welcome on DevStack Blog App development YouTube video series",
    info: "This is a root endpoint",
    Working: "Documentations of other endpoints will be release soon :)",
    request:
      "Hey if you did'nt subscribed my YouTube channle please subscribe it",
  };
  
app.route("/").get((req, res) => res.json(data));

server.listen(port, "0.0.0.0", ()=>{
    console.log("server started");
});