var app = require('express')();
var http= require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');
var bodyParser = require('body-parser');
var session = require('express-session');
var digtial_sig = require('./digital_sig');
var crypto = require('crypto');

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

app.get('/register.html', function(req, res){
	res.sendFile(__dirname + '/register.html');
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
	socket.on('register', function(req){
	    var hash = crypto.createHash('sha256');
	    var username = req.body.username;
	    var password = req.body.passowrd;
	    var confirm_password = req.body.password;
	    var eamil = req.body.email;
		var time = req.body.submitTime;

		var result = {};
	    if(password != confirm_password){
	    	console.log("Password doesn't match");
	    	result['message'] = "password doesn't match"
			result['status_code'] = 400;
			socket.broadcast.to(socket.id).emit(result);
			return;
	    }
	    hash.update(password);
	    var hashedPassword = hash.digest('base64');

	    db.query("select 1 from user where name = ? order by name limit 1", [username], function(error, results, fields){
	    	if(error){
	    		console.log(error);
				result['message'] = "Internal Server Error";
				result['status_code'] = 500;
				socket.broadcast.to(socket.id).emit(result);
				return;
	    	}
	    	if(results.length > 0){
	    		console.log("useranem", username, "already exits");
				result['message'] = "username already exists";
				result['status_code'] = 400;
				socket.broadcast.to(socket.id).emit(result);
				return;
	    	};
	    });
	    // write to DB
		db.query("insert into user (name, password, email, timesatmp) values ?", [username, hashedPassword, email, timestamp], function(error, result){
			if(error){
				console.log(error);
				result['message'] = "Internal Server Error";
				result['status_code'] = 500;
				socket.broadcast.to(socket.id).emit(result);
				return;
			}
		});
		// success
		result['message'] = "success";
		result['username'] = username;
		result['status_code'] = 200;
		socket.broadcast.to(socket.id).emit(result);
		return;
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
