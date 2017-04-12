<?
/** config **/
    $sqlserver = "localhost";
    $sqluser = "radius";
    $sqlpass = "AAAA0857";
    $db = "radius";
    $con = mysql_connect($sqlserver, $sqluser, $sqlpass);
    mysql_select_db($db, $con);

    if ($_GET["res"] == "reg")
    {
    	$username = $_GET['register_username'];
            $password = $_GET['register_password'];
    	echo $username;
    	mysql_query("INSERT INTO radcheck (username, attribute, op, value) VALUES ($username,'User-Password', ':=', $password)");
        mysql_query("INSERT INTO radusergroup (username, groupname) VALUES ($username, 'user')");
        header("Location: index.php");
    }
    else
    {
	   echo '<h1>Please input your username and password</h1><form name="form1" method="get" action="register.php"><table><tr><th>Username</th><td><input type="text" name="register_username"></td></tr><tr><th>Password</th><td><input type="password" name="register_password"></td></tr></table><input type="hidden" name="res" value="reg"><input type="submit" name="register" value="register"></form>';
    }
?>
