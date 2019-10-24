<?php
        putenv("LANG=ko_KR.UTF-8");
        setlocale(LC_ALL, 'ko_KR.utf8');

        header("Content-Type: text/html; charset-UTF-8");

        $con = mysqli_connect("localhost","s201402783","01040436647","capstonDB");

        $keywords = $_GET["keywords"];
        $command = "/usr/bin/python3 /usr/pyws/filter_task.py {$keywords}";
        $command3 = 'python3 /usr/pyws/test.py';
        ob_start();

        passthru($command);
        $output = ob_get_clean();

        // echo "$output";

        $codeArr = explode(',', $output);
        $response = array();
        for($i = 0; $i < sizeof($codeArr) - 1; $i++){
                // echo $codeArr[$i]."<br>\n";

                $searchQuery = "SELECT * FROM TIMETABLE WHERE Code = '$codeArr[$i]'";

                $result = mysqli_query($con, $searchQuery);

                $row = mysqli_fetch_array($result);

                array_push($response, array("Code"=>$row[0], "Grade"=>$row[3], "Title"=>$row[4], "Instructor"=>$row[5], "Credit"=>$row[6], "Time"=>$row[7], "Schedule"=>$row[8], "Sugang_num"=>$row[9], "Limit_num"=>$row[10], "Note"=>$row[16], "Junpil"=>$row[11], "Cyber"=>$row[12], "Muke"=>$row[13], "Foreign"=>$row[14], "Team"=>$row[15]));
                //echo $row[4]."<br>\n";
        }

        echo json_encode(array("response"=>$response), JSON_UNESCAPED_UNICODE);
        mysqli_close($con);
?>