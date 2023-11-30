const express = require("express");

var app = express();
const path = require('path')

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))

// This sends the content to show in the app
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
  });

// This tells the app in which port it should run
app.listen(8000, function () {
    console.log("Application started, check: http://localhost:%d/", 8000)
});