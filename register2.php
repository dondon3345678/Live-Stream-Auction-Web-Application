<?
/** config **/

    $sqlserver = "localhost";
    $sqluser = "radius";
    $sqlpass = "AAAA0857";
    $db = "radius";

    $con = mysql_connect($sqlserver, $sqluser, $sqlpass);
    //echo "before select db";
    //exit();
    mysql_select_db($db, $con);
    echo $_GET["res"];
    if($_GET["res"] == "reg")
    {
	echo "if"; exit;
	$username = $_GET['register_username'];
        $password = $_GET['register_password'];
	echo $username;
	mysql_query("INSERT INTO radcheck (username, attribute, op, value) VALUES ($username,'User-Password', ':=', $password)");
    mysql_query("INSERT INTO radusergroup (username, groupname) VALUES ($username, 'user')");
    Header("Location: index.php");
    }

    else
    {
	echo '<h1>Please input your username and password</h1><form name="form1" method="get" action="register.php?res=reg"><table><tr><th>Username</th><td><input type="text" name="register_username"></td></tr><tr><th>Password</th><td><input type="password" name="register_password"></td></tr></table><input type="submit" name="register" value="register"></form>'
    }



?>
