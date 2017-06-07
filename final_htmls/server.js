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

var currentPrice = 0;

io.on('connection', function(socket){
    console.log('a user connected');

	socket.on('add user',function(msg){
		socket.username = msg;
		console.log("new user:"+msg+" logged.");
		io.emit('add user',{
			username: socket.username
		});
	});
    socket.on('update info', function(data){
    	console.log('update info');
    	// console.log(data.streamID);
    	console.log(data.startAuction);
    	if (data.startAuction == "false") {
    		currentPrice = 0;
    	}		// restart new bid

        io.emit('update info',{
        		streamID: data.streamID,
        		itemName: data.itemName,
        		// priceGap: data.priceGap,
        		startAuction: data.startAuction,
        		currentPrice: currentPrice
        });	
    });
    socket.on('chat message', function(msg){
		console.log("chat: "+msg);
  		//發佈新訊息
		io.emit('chat message', {
			username: socket.username,
			msg: msg
		});
	});
	socket.on('new bid', function(price){
		console.log('new bid: '+price);
		// need to compare

		if (currentPrice < price) {
			currentPrice = price;
		}
		console.log('now price: '+currentPrice);

		io.emit('new bid', {
			username: socket.username,
			price: currentPrice,
		});
	});
});

http.listen(3000,function(){
    console.log('listening on port 3000');
});
