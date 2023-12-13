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

// This sends the content to show in the app
app.get("/", (req, res) => {
  res.render(__dirname + "/views/index.ejs", {
    messages: JSON.parse(fs.readFileSync('data/chat.json')) 
  });
});

io.on('connection', (socket)=>{
  console.log("a user connected via socket!")
  socket.on('disconnect', ()=>{
      console.log("a user disconnected!")
  })
  socket.on('chat message', (msg)=>{
      console.log("Message: "+msg)
      let data = JSON.parse(fs.readFileSync('data/chat.json'))
      data.push({"name": "test", "msg":msg})
      fs.writeFile('data/chat.json', JSON.stringify(data, null, 2), err => {
      if (err) { throw err }
      console.log('JSON data is saved.')
      })
      io.emit('chat message', msg)
  })
})

// This tells the app in which port it should run
server.listen(8000, function () {
    console.log("Server started, check: http://localhost:%d", 8000)
});