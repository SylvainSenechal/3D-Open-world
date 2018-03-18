var express = require('express');

var app = express();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/tt.html');
});


app.get('/spark1.png', function(req, res) {
    res.sendFile(__dirname + '/spark1.png');
});
app.listen(8080);