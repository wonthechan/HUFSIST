<?php
        $con = mysqli_connect("localhost", "s201402783", "01040436647", "capstonDB");

        $userID = $_POST["userID"];
        $userPassword = $_POST["userPassword"];
        $token = $_POST["userTokenID"];

        // Insert User to USER DB Table
        $statement = mysqli_prepare($con, "INSERT INTO USER(userID, userPassword, token) VALUES(?, ?, ?)");
        mysqli_stmt_bind_param($statement, "sss", $userID, $userPassword, $token);
        mysqli_stmt_execute($statement);

        // Insert User To SETTING DB Table (initialize every value to '0')
        $statement2 = mysqli_prepare($con, "INSERT INTO SETTING(userID) VALUES(?)");
        mysqli_stmt_bind_param($statement2, "s", $userID);
        mysqli_stmt_execute($statement2);

        $response = array();
        $response["success"] = true;

        echo json_encode($response);
?>