var app = require('express')();
var http= require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
      res.sendFile(__dirname + '/index.html');
});
app.get('/index_seller.html', function(req, res){
      res.sendFile(__dirname + '/index_seller.html');
});

app.get('/index_bidder.html', function(req, res){
      res.sendFile(__dirname + '/index_bidder.html');
});



io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('update youtube', function(streamID){
        console.log('Seller update Youtube.');
        io.emit('update youtube',streamID);
    });
});

http.listen(3000,function(){
    console.log('listening on port 3000');
});
