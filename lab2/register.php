<?php
   include("config.php");
   session_start();
   
   if($_SERVER["REQUEST_METHOD"] == "POST") {
      // username and password sent from form 
      
      $myusername = mysqli_real_escape_string($db,$_POST['r_username']);
      $mypassword = mysqli_real_escape_string($db,$_POST['r_password']); 
      
      ## to do: change this ##
      $sql = "INSERT INTO table VALUE($myusername,$mypassword)";
      $result = mysqli_query($db,$sql);
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
      $active = $row['active'];
      
      $count = mysqli_num_rows($result);
      
      // If result matched $myusername and $mypassword, table row must be 1 row
		
      header("location: welcome.php");
   }
?>
