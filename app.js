const express = require("express")

var app = express()

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'))

// This sends the content to show in the app
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
  });

// This tells the app in which port it should run
app.listen(3000, function () {
    console.log("Started application on port %d", 3000)
});