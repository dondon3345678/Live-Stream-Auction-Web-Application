var app = require('express')();
var http= require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');
var bodyParser = require('body-parser');
var session = require('express-session');
//var digtial_sig = require('./digital_sig');
//var crypto = require('crypto');

var test = 'test'
app.use(session({secret: 'test'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;

    app.get('/', function(req, res){
      sess = req.session;
      if(sess.user){
          if(sess.type =='regular'){
            res.redirect('/index_bidder.html');
          }else{
            res.redirect('/index_seller.html');
          }
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
            sess.type = rows[0].type;
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
var currentPlayer = '';
var currentIndex = 0;
var product = {name: "", owner: "?", price: 0, time: ""};
var streamID = "";
var startAuction = "True";
var productList = [];
var userList = [];

io.on('connection', function(socket){
    console.log('a user connected');

	socket.on('add new user',function(msg){
		userList.push(msg);
		console.log("new user:" +msg+ " logged.");
		socket.username = msg;
        console.log(socket.username);
        //send some info to this new bidder
		socket.emit('bidder update', {
			streamID: streamID,
        	itemName: product.name,
        	currentOwner: product.owner,
       		currentPrice: product.price,
        	startAuction: startAuction,
		});
		io.emit('add new user',{
			username: socket.username
		});
		io.emit('list update',{
			userList: userList
		});
	});
    socket.on('seller update', function(data){
        //This is for Seller to update product info
    	console.log('seller update');
    	// console.log(data.streamID);
    	console.log(data.startAuction);
        // restart new bid
        startAuction = data.startAuction;
        streamID = data.streamID;
        product.name = data.itemName;
        product.owner="?";
        product.price=0;
        product.time=Date.now();
    		//productList.push(product);
    		//currentIndex = productList.length-1;
    	    //productList[currentIndex].name = data.itemName;
    	    //productList[currentIndex].streamID = data.streamID;

        io.emit('bidder update',{
        		streamID: streamID,
        		itemName: product.name,
        		startAuction: startAuction,
        		currentPrice: product.price,
        		currentOwner: product.owner
        });	
    });
    socket.on('chat message', function(msg){
		console.log("chat: "+msg);
		io.emit('chat message', {
			username: socket.username,
			msg: msg
		});
	});
	socket.on('new bid', function(data){
		console.log('new bid come from '+ socket.username + ' price is '+data.bid);
		
		var result = compare_price(socket.username, data);
		socket.broadcast.to(socket.id).emit(result);	// emit to special player
	    if(result=='SUCCESS'){	
            console.log('Bid is SUCCESSFUL, now price: '+currentPrice+ ',owner is '+ socket.username);
            io.emit('new bid', {
                username: socket.username,
                price: product.price
            });
        }else{
            console.log('Bid Fail');
        }
	});
    /*
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
	    var hashedPassword = hash.digest('hex');

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
    */
	socket.on('disconnect',function(){			// listen for socket closed
		var index = userList.indexOf(socket.username);
		userList.splice(index, index);
		console.log(socket.username+" left.");
		io.emit('list update',{
			userList: userList
		});
	});
});

http.listen(3000,function(){
    console.log('listening on port 3000');
});

function compare_price(player, data) {
	var result;
    var timeStamp = data.bidTime;
    var price = data.bid;
	if (price <= product.price) result="FAIL";			// a
	else if (startAuction=="false") result="FAIL";		// b
	else if (product.owner==player)	result="FAIL";		// c
	else if (timeStamp < product.time) result="FAIL";   // later bid
    else {
		product.price = price;							// SUCCESS,update product info on server
		product.owner = player;
		product.time = timeStamp;
        result="SUCCESS";
	}
	return result;
}
