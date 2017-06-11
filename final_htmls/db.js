var mysql = require('mysql');

var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'member'
});

connection.connect()

module.exports=connection;
/*
connection.query('select * from radcheck',function(err,rows){
    console.log(rows[0].username);

});
*/
