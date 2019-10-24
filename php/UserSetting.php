<?php
   $con = mysqli_connect("localhost", "s201402783", "01040436647", "capstonDB");

   $userID = $_GET["userID"];
   $hufsNotice = $_GET["hufsNotice"];
   $bachelorNotice = $_GET["bachelorNotice"];
   $scholarshipNotice = $_GET["scholarshipNotice"];
   $eNotice = $_GET["eNotice"];
   $eAssignment = $_GET["eAssignment"];
   $eLecturenote = $_GET["eLecturenote"];

   $updateQuery = "UPDATE SETTING SET hufsNotice='$hufsNotice', bachelorNotice='$bachelorNotice', scholarshipNotice='$scholarshipNotice', eNotice='$eNotice', eAssignment='$eAssignment', eLecturenote='$eLecturenote' WHERE userID = '$userID'";
   mysqli_query($con, $updateQuery);

   mysqli_close($con);

   $response["success"] = true;

   echo json_encode($response);
?>