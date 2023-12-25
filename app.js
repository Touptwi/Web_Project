const express = require("express");
const path = require('path')
const fs = require('fs');


var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))

let nickname = "guest";

// This sends the content to show in the app
app.get("/connected", (req, res) => {
  res.render(__dirname + "/views/index.ejs", {
    name: nickname,
    messages: JSON.parse(fs.readFileSync('data/chat.json')),
    users: JSON.stringify(JSON.parse(fs.readFileSync('data/users.json')))
  });
});

app.get("/", (req, res) => {
  res.render(__dirname + "/views/connexion.ejs");
});

app.get("/connexion", (req, res) => {
  nickname = req.query.nickname,
  res.redirect('/connected')
});

io.on('connection', socket=>{
  console.log( socket.id + " connected via socket! ")
  let data = JSON.parse(fs.readFileSync('data/users.json'))
  for ( var user  of data ) {
		if(user.nickname == nickname) {
      io.emit('connection', nickname, socket.id)
      user.id = socket.id;
    }
	}
  fs.writeFile('data/users.json', JSON.stringify(data, null, 2), err => {
  if (err) { throw err }
  })
  socket.on('disconnect', ()=>{
    console.log( socket.id + " disconnected! ")
  })
  socket.on('chat message', (name, msg, color)=>{
    let data = JSON.parse(fs.readFileSync('data/chat.json'))
    data.push({"name": name, "msg":msg, "color":color})
    fs.writeFile('data/chat.json', JSON.stringify(data, null, 2), err => {
    if (err) { throw err }
    })
    io.emit('chat message', name, msg, color)
  })
  socket.on('update coords', (users, id, X, Z, Rx, Ry, Rz)=>{
    for (var user of users) {
      if(user.id == id) {
        user.positionX = X;
        user.positionZ = Z;
        user.rotationX = Rx;
        user.rotationY = Ry;
        user.rotationZ = Rz;
      }
    }
    fs.writeFile('data/users.json', JSON.stringify(users, null, 2), err => {
    if (err) { throw err }
    })
    io.emit('update coords', id, X, Z, Rx, Ry, Rz)
})
})

// This tells the app in which port it should run
server.listen(8000, function () {
    console.log("Server started, check: http://localhost:%d", 8000)
});