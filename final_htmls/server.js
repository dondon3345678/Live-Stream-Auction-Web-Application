var app = require('express')();
var http= require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
//var digtial_sig = require('./digital_sig');
var crypto = require('crypto');

var test = 'test'
app.use(session({secret: 'test'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
      //Login
      console.log(req.body.username);
      console.log(req.body.password);
      sess = req.session;
      let hash = crypto.createHash('md5');
      let pwdhash = hash.update(req.body.password).digest('hex');
      db.query('select * from users where name = ? and password = ?',[req.body.username,pwdhash],function(err,rows){
        if(err){
            console.log(err);
            res.redirect('/');
        }else if(rows.length==0){
            console.log("wrong");
            res.redirect('/');
        }else{
            console.log(req.body.username+" log in");
            sess.user = req.body.username;
            sess.type = rows[0].type;
            res.cookie('name', req.body.username);
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
      console.log("Name: "+req.cookies.name);
    });
    app.get('/index_bidder.html', function(req, res){
      res.sendFile(__dirname + '/index_bidder.html');
      console.log("Name: "+req.cookies.name);
    });
    app.get('/register.html', function(req, res){
    res.sendFile(__dirname + '/register.html');
    });
var currentPrice = 0;
var currentPlayer = '';
var currentIndex = 0;
var product = {name: "", owner: "?", price: 0, time: ""};
var streamID = "";
var startAuction = "false";
var productListText = '';
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

        io.emit('bidder update',{
        		streamID: streamID,
        		itemName: product.name,
        		startAuction: startAuction,
        		currentPrice: product.price,
        		currentOwner: product.owner
        });	
    });
    socket.on('auction end', function(msg){
        io.emit('auction end',{
            productName: product.name,
            productPrice: product.price,
            productOwner: product.owner
        });
        console.log("Seller end current auction.");
		db.query("insert into products (pid, name, owner,price) values (?,?,?,?)", [0,product.name, product.owner, product.price], function(error, res){
            if(error){
                console.log("Product register error");
            }else{
                console.log("Product register OK");
            }
        
        });
        productListText = productListText+"<tr><td>"+product.name+"</td><td>"+ product.price+"</td><td>"+ product.owner+"</td></tr>";
        io.emit('product list update', {
            list: productListText;
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
	socket.on('register', function(data){
        console.log(data);
	    var username = data.username;
	    var password = data.password;
	    var confirm_password = data.confirm_password;
	    var email = data.email;
		var type = data.type;

		var result = {};
        console.log("PWd "+ password);
        console.log("con" + confirm_password);
	    if(password != confirm_password){
	    	console.log("Password doesn't match");
	    	result['message'] = "password doesn't match"
			result['status_code'] = 400;
			socket.emit("register",result);
			return;
	    }
        let hash = crypto.createHash('md5');
	    hash.update(password);
	    var hashedPassword = hash.digest('hex');

	    db.query("select * from users where name = ?", [username], function(error, row){
	    	if(error){
	    		console.log(error);
				result['message'] = "Internal Server Error";
				result['status_code'] = 500;
				socket.emit("register",result);
				return;
	    	}
	    	if(row.length > 0){
	    		console.log("useranem", username, "already exits");
				result['message'] = "username already exists";
				result['status_code'] = 400;
				socket.emit("register",result);
				return;
	    	};
	    });
	    // write to DB
		db.query("insert into users (pid, name, email,password, type) values (?,?,?,?,?)", [0,username, email, hashedPassword,type], function(error, res){
			if(error){
				console.log(error);
				result['message'] = "Internal Server Error";
				result['status_code'] = 500;
                socket.emit("register",result);
				return;
			}
		});
		// success
		result['message'] = "Success";
		result['username'] = username;
		result['status_code'] = 200;
		socket.emit("register",result);
		return;
	});
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
