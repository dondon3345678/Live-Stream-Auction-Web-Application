var app = require('express')();
var http= require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');
var bodyParser = require('body-parser');
var session = require('express-session');

var test = 'test'
app.use(session({secret: 'test'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;

app.get('/', function(req, res){
      sess = req.session;
      if(sess.user){
          res.redirect('/index_seller.html');
      }else{
          res.redirect( '/login.html');
      }
});
app.post('/login.html', function(req,res){
      console.log(req.body.username);
      console.log(req.body.password);
      sess = req.session;
      db.query('select * from users where name = ? and password = ?',[req.body.username,req.body.password],function(err,rows){
        if(err){
            console.log(err);
        }else if(rows.length==0){
            console.log("wrong");
        }else{
            console.log(req.body.username+" log in");
            sess.user = req.body.username;
            if(rows[0].type == 'regular'){
                res.redirect('/index_bidder.html');
            }else{
                //'seller'
                res.redirect('/index_seller.html');
            }
        }
      })
});


app.get('/login.html', function(req,res){
    res.sendFile(__dirname+'/login.html');
});
app.get('/index_seller.html', function(req, res){
      res.sendFile(__dirname + '/index_seller.html');
});
app.get('/index_bidder.html', function(req, res){
      res.sendFile(__dirname + '/index_bidder.html');
});
var currentPrice = 0;
var startAuction = 0;
var currentPlayer = '';

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
    		currentPrice = 0;		// restart new bid
    		startAuction = 0;
    	} else {
    		startAuction = 1;
    	}

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
		
		if (currentPrice < price) {
			currentPrice = price;
		}
		// var result = compare_price(socket.username, price);
		// socket.broadcast.to(socket.id).emit(result);	// emit to special player
		
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

function compare_price(player, price) {
	var result;
	if (price <= currentPrice) result="FAIL";			// a
	else if (!startAuction) result="FAIL";				// b
	else if (currentPlayer==player)	result="FAIL";		// c
	else {
		currentPrice = price;							// SUCCESS
		currentPlayer = player;
		result="SUCCESS"
	}

	/* COMPARE
	a.價錢小於目前最高價 FAIL
	b.此商品已經結標 FAIL
	c.自己已經是目前的最高價出標者 FAIL
	d.比別人晚出價 FAIL
	e.SUCCESS */
		
}