<?php
        $con = mysqli_connect("localhost", "s201402783", "01040436647", "capstonDB");

        $userID = $_GET["userID"];

        $deleteQuery = "DELETE FROM USER WHERE userID='$userID'";

        mysqli_query($con, $deleteQuery);

        mysqli_close($con);

        $response["success"] = true;

        echo json_encode($response);
?>