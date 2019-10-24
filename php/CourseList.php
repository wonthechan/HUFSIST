<?php
   header("Content-Type: text/html; charset-UTF-8");
    $con = mysqli_connect("localhost","s201402783","01040436647","capstonDB");

    $gubun = $_GET["Gubun"];
    $grade = $_GET["Grade"];
    $isMajor = $_GET["isMajor"];
    $filterText = $_GET["FilterOption"];
    $searchText = $_GET["DetailFilter"];
    # 치환
    if(strcmp($grade, "전학년") == 0){
        $grade = "%";
    }
    if(strcmp($gubun, "전체") == 0){
        $gubun = "%";
    }

    if(strcmp($filterText, "교수명") == 0){
        $filterText = "Instructor";
        $searchText = "%{$searchText}%";
    }elseif(strcmp($filterText, "요일,교시") == 0){
        $filterText = "Schedule";
        $searchText = "%{$searchText}%";
    }elseif(strcmp($filterText, "강의명") == 0){
        $filterText = "Title";
        $searchText = "%{$searchText}%";
    }else{
        $filterText = "Instructor";
        $searchText = "%";
    }

    $searchQuery = "SELECT * FROM TIMETABLE WHERE Major = '$isMajor' AND Gubun LIKE '$gubun' AND Grade LIKE '$grade' AND {$filterText} LIKE '{$searchText}' ORDER BY Grade ASC";
    $result = mysqli_query($con, $searchQuery);

    $response = array();
    while($row = mysqli_fetch_array($result)){
        array_push($response, array("Code"=>$row[0], "Grade"=>$row[3], "Title"=>$row[4], "Instructor"=>$row[5], "Credit"=>$row[6], "Time"=>$row[7], "Schedule"=>$row[8], "Sugang_num"=>$row[9], "Limit_num"=>$row[10], "Note"=>$row[16], "Junpil"=>$row[11], "Cyber"=>$row[12], "Muke"=>$row[13], "Foreign"=>$row[14], "Team"=>$row[15]));
    }

    echo json_encode(array("response"=>$response), JSON_UNESCAPED_UNICODE);
    mysqli_close($con);
?>
root@wonthechan:/var/www/html# ls
CourseList.php  GetSetting.php  index.html  info.php  InputKeywords.php  UserLeave.php  UserLogin.php  UserRegister.php  UserSetting.php  UserValidate.php
root@wonthechan:/var/www/html# cat Cours*
<?php
   header("Content-Type: text/html; charset-UTF-8");
    $con = mysqli_connect("localhost","s201402783","01040436647","capstonDB");

    $gubun = $_GET["Gubun"];
    $grade = $_GET["Grade"];
    $isMajor = $_GET["isMajor"];
    $filterText = $_GET["FilterOption"];
    $searchText = $_GET["DetailFilter"];
    # 치환
    if(strcmp($grade, "전학년") == 0){
        $grade = "%";
    }
    if(strcmp($gubun, "전체") == 0){
        $gubun = "%";
    }

    if(strcmp($filterText, "교수명") == 0){
        $filterText = "Instructor";
        $searchText = "%{$searchText}%";
    }elseif(strcmp($filterText, "요일,교시") == 0){
        $filterText = "Schedule";
        $searchText = "%{$searchText}%";
    }elseif(strcmp($filterText, "강의명") == 0){
        $filterText = "Title";
        $searchText = "%{$searchText}%";
    }else{
        $filterText = "Instructor";
        $searchText = "%";
    }

    $searchQuery = "SELECT * FROM TIMETABLE WHERE Major = '$isMajor' AND Gubun LIKE '$gubun' AND Grade LIKE '$grade' AND {$filterText} LIKE '{$searchText}' ORDER BY Grade ASC";
    $result = mysqli_query($con, $searchQuery);

    $response = array();
    while($row = mysqli_fetch_array($result)){
        array_push($response, array("Code"=>$row[0], "Grade"=>$row[3], "Title"=>$row[4], "Instructor"=>$row[5], "Credit"=>$row[6], "Time"=>$row[7], "Schedule"=>$row[8], "Sugang_num"=>$row[9], "Limit_num"=>$row[10], "Note"=>$row[16], "Junpil"=>$row[11], "Cyber"=>$row[12], "Muke"=>$row[13], "Foreign"=>$row[14], "Team"=>$row[15]));
    }

    echo json_encode(array("response"=>$response), JSON_UNESCAPED_UNICODE);
    mysqli_close($con);
?>
