var express = require('express');
var app = express();
const serveStatic = require('serve-static');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(serveStatic(__dirname + "/"));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('Server started ' + port);
