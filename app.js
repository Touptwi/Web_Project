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

io.on('connection', (socket)=>{
  console.log("%d connected via socket!", socket.id)
  socket.on('disconnect', ()=>{
      console.log("%d disconnected!", socket.id)
  })
  socket.on('chat message', (name, msg)=>{
      let data1 = JSON.parse(fs.readFileSync('data/chat.json'))
      data1.push({"name": name, "msg":msg})
      fs.writeFile('data/chat.json', JSON.stringify(data1, null, 2), err => {
      if (err) { throw err }
      console.log('JSON data is saved.')
      })
      io.emit('chat message', name, msg)
  })
  socket.on('update coords', (id, X, Z)=>{
    let data2 = JSON.parse(fs.readFileSync('data/users.json'))
    for (var user of data2) {
      if(user.id == id) {
        user.positionX = X;
        user.positionZ = Z;
      }
    }
    fs.writeFile('data/users.json', JSON.stringify(data2, null, 2), err => {
    if (err) { throw err }
    console.log('JSON data is saved.')
    })
    io.emit('update coords', id, X, Z)
})
})

// This tells the app in which port it should run
server.listen(8000, function () {
    console.log("Server started, check: http://localhost:%d", 8000)
});