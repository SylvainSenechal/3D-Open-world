var express = require('express');

var app = express();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.get('/tree1.json', function(req, res) {
    res.sendFile(__dirname + '/tree1.json');
});
app.get('/tree2.json', function(req, res) {
    res.sendFile(__dirname + '/tree2.json');
});
app.get('/tree3.json', function(req, res) {
    res.sendFile(__dirname + '/tree3.json');
});
app.get('/tree4.json', function(req, res) {
    res.sendFile(__dirname + '/tree4.json');
});
app.get('/jeu.js', function(req, res) {
    res.sendFile(__dirname + '/jeu.js');
});



app.get('/img/neg-x.jpg', function(req, res) {
    res.sendFile(__dirname + '/img/neg-x.jpg');
});
app.get('/img/neg-y.jpg', function(req, res) {
    res.sendFile(__dirname + '/img/neg-y.jpg');
});
app.get('/img/neg-z.jpg', function(req, res) {
    res.sendFile(__dirname + '/img/neg-z.jpg');
});
app.get('/img/pos-x.jpg', function(req, res) {
    res.sendFile(__dirname + '/img/pos-x.jpg');
});
app.get('/img/pos-y.jpg', function(req, res) {
    res.sendFile(__dirname + '/img/pos-y.jpg');
});
app.get('/img/pos-z.jpg', function(req, res) {
    res.sendFile(__dirname + '/img/pos-z.jpg');
});


app.listen(8080);
/*app.listen(8080,'192.168.1.30');
 || 'localhost',function() {
    console.log('Application worker ' + process.pid + ' started...');
  }
  );*/