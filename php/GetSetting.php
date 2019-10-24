<?php
    $con = mysqli_connect("localhost", "s201402783", "01040436647", "capstonDB");

    if (mysqli_connect_errno($con))
    {
        echo "Failed to connect to MySQL: " . mysqli_connect_error();
    }
    mysqli_set_charset($con, "utf8");

    $userID = $_GET['userID'];

//    $searchQuery = mysqli_query($con,"SELECT * FROM SETTING where userID='$userID'");
    $searchQuery = "SELECT * FROM SETTING where userID='$userID'";

    $result = mysqli_query($con, $searchQuery);
    $row = mysqli_fetch_array($result);
    $data = array();
    if($result){
        array_push($data,
                  array('hufsNotice'=>$row[1],
                       'bachelorNotice'=>$row[2],
                       'scholarshipNotice'=>$row[3],
                       'eNotice'=>$row[4],
                       'eAssignment'=>$row[5],
                       'eLecturenote'=>$row[6]));
        header('Content-Type: application/json; charset=utf8');
        $json = json_encode(array("getSetting"=>$data), JSON_PRETTY_PRINT+JSON_UNESCAPED_UNICODE);
        echo $json;
    }
    else{
        echo "SQL문 처리중 에러 발생 : ";
        echo mysqli_error($con);
    }


    mysqli_close($con);
?>