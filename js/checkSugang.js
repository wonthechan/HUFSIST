function checkSugang(uID) {
        var FCM = require('fcm-node');
        var serverKey = 'AAAAfCpByns:APA91bGZm3yCBfrIu5KxQrBFr3z8qyym9adieN7lesXoAUsCHtGf0TUuC57uoJ69DedarMuJMtkgVp0ZXLzxvAR6guTfJeNsZ48GTRPaBaUwgmph4meyBUeFeuw8l6zqybOSkI-CpbHm';
        var client_token = '';

        const request = require("request");
        const mainURL = 'http://eclass2.hufs.ac.kr:8181/ilos/main/main_form.acl';
        const eclassGongjiURL = 'http://eclass2.hufs.ac.kr:8181/ilos/st/course/notice_list_form.acl';
        const eclassMaterialURL = 'http://eclass2.hufs.ac.kr:8181/ilos/st/course/lecture_material_list_form.acl';
        const eclassReportURL = 'http://eclass2.hufs.ac.kr:8181/ilos/st/course/report_list_form.acl';
        const cheerio = require('cheerio');
        const userID = uID;
        var userPassword = ''; // Hashed Password
        var loginURL = '';
        var loginCookie = new Object();
        var setValue = new Object();

        // START MAIN TASK
        main();

        // Get Password From MySQL and Set Login URL
        function setLoginURL (){
                return new Promise(function(resolve, reject){
                        // MySQL Config
                        var mysql      = require('mysql');
                        var connection = mysql.createConnection({
                          host     : '106.10.42.35',    // 호스트 주소
                          user     : 's201402783',           // mysql user
                          password : '01040436647',       // mysql password
                          database : 'capstonDB',         // mysql 데이터베이스
                          port: 3306
                        });
                        connection.connect();

                        var selectQuery = 'SELECT userPassword FROM USER WHERE userID = \''
                                                                + userID
                                                                + '\'';
                        // console.log(selectQuery);
                        connection.query(selectQuery,
                        function (error, results, fields) {
                          if (error) throw error;
                          // Check if the password exist
                          if(results.length >= 1){
                                loginURL = "https://eclass2.hufs.ac.kr:4443/ilos/lo/login.acl?usr_id=" + userID + "&usr_pwd=" + results[0].userPassword;
                                resolve();
                          }else{
                                reject({error: "Not Vaild User!"});
                          }
                        });
                        connection.end();
                });
        }

        // Obtain and Set Session Cookie
        function setLoginCookie (){
                return new Promise(function(resolve, reject){
                        request({
                                uri: loginURL,
                                method: 'POST',
                                headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Whale/1.4.64.6 Safari/537.36',
                                        'Origin': 'http://eclass2.hufs.ac.kr:8181',
                                        'Referer': 'http://eclass2.hufs.ac.kr:8181/ilos/main/member/login_form.acl',
                                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'Connection': 'keep-alive',
                                        'Accept-Encoding': 'gzip, deflate',
                                        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
                                }
                        }, function(err, res, body){
                                if(err) return reject(err);
                                if(res.headers['set-cookie'].join().indexOf('JSESSIONID') != -1){
                                        loginCookie = res.headers['set-cookie'];
                                        resolve();
                                }
                                else{
                                        reject({error: "Not Vaild Cookie!"});
                                }
                        });
                });
        }

        // Set New Session For Eclass Room Page
        function eclassRoomConnect(sugangID, loginCookie){
                return new Promise(function(resolve, reject){
                        var postURL = 'http://eclass2.hufs.ac.kr:8181/ilos/st/course/eclass_room2.acl?KJKEY='
                                                        + sugangID
                                                        + '&returnURI=/ilos/st/course/submain_form.acl&encoding=utf-8';
                        request({
                                uri: postURL,
                                method: 'POST',
                                headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Whale/1.4.64.6 Safari/537.36',
                                        'Cookie': loginCookie
                                }
                        }, function(err, res, body){
                                if(err) return reject(err);
                                resolve();
                                // console.log(body);
                            // resolve(res.headers['set-cookie']);
                        });
                });
        }


        // Replace Current Token With New Token
        function updateCurrentID (uID, sugangID, attrName, newValue){
                return new Promise(function(resolve, reject){
                        var mysql      = require('mysql');
                        var connection = mysql.createConnection({
                          host     : '106.10.42.35',    // 호스트 주소
                          user     : 's201402783',           // mysql user
                          password : '01040436647',       // mysql password
                          database : 'capstonDB',         // mysql 데이터베이스
                          port: 3306
                        });
                        connection.connect();
                        var updateQuery = 'UPDATE SUGANG SET '
                                                                + attrName
                                                                + ' = \''
                                                                + newValue
                                                                + '\' WHERE userID = \''
                                                                + userID
                                                                + '\' AND sugangID = \''
                                                                + sugangID
                                                                + '\'';
                        connection.query(updateQuery,
                        function (error, results, fields) {
                          if (error) throw error;
                          resolve();
                        });
                        connection.end();
                });
        }



        // Parse Report Board (과제 게시판)
        function parseLatestReport(idObject, loginCookie){
                return new Promise(function(resolve, reject){
                        request({
                                uri: eclassReportURL,
                                method: 'GET',
                                headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Whale/1.4.64.6 Safari/537.36',
                                        'Referer': 'http://eclass2.hufs.ac.kr:8181/ilos/main/main_form.acl',
                                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                                        'Content-Type': 'text/html; charset=utf-8',
                                        'Accept-Encoding': 'gzip, deflate',
                                        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                                        'Cookie': loginCookie
                                }
                        }, async function(err, res, body){
                                if(err) return reject(err);
                                const $ = cheerio.load(body);
                                let postTitle = '';
                                // 과제 게시글이 적어도 하나 이상 있는 경우에만 파싱을 진행
                                if($("table[class=bbslist] tbody td").length > 1){
                                        // 가장 최근에 올라온 게시글의 제목을 저장하고
                                        // postID 를 기준으로 새글의 여부를 판단
                                        let postHref = $("table[class=bbslist] tbody tr")
                                                                        .first()
                                                                        .find("a")
                                                                        .attr('href');
                                        let newPostID = postHref.substring(postHref.indexOf('=') + 1, postHref.indexOf('&'));
                                        // 새글이 있는 경우
                                        if(newPostID != idObject.reportID){
                                                // 일단 DB에 최신 ID로 업데이트
                                                await updateCurrentID(userID, idObject.sugangID, 'reportID', newPostID);
                                                // 새로운 글이 더 있는지 찾아보기
                                                let postIDArr = $("table[class=bbslist] tbody tr");

                                                for(var i = 0; i < postIDArr.length; i++){
                                                        postHref = postIDArr.eq(i).find("a").attr('href');
                                                        newPostID = postHref.substring(postHref.indexOf('=') + 1, postHref.indexOf('&'));
                                                        if(newPostID == idObject.reportID){
                                                                break;
                                                        }else{
                                                                // 새글에 대해 알림
                                                                postTitle = postIDArr.eq(i).find("a").eq(0).text();
                                                                console.log('[' + idObject.sugangTitle + '] 새 과제 발견! ==> ');
                                                                console.log(postTitle);

                                                                // /** 발송할 Push 메시지 내용 */
                                                                var push_data = {
                                                                    // 수신대상
                                                                    to: client_token,
                                                                    // App에게 전달할 데이터
                                                                    data: {
                                                                        title: '[' + idObject.sugangTitle + '] 새 과제 등록',
                                                                        body: postTitle,
                                                                        url: ''
                                                                    },
                                                                    // 메시지 중요도
                                                                    priority: "high",
                                                                    // App 패키지 이름
                                                                    restricted_package_name: "com.example.hufs4"
                                                                };
                                                                /** 아래는 푸시메시지 발송절차 */
                                                                var fcm = new FCM(serverKey);

                                                                fcm.send(push_data, function(err, response) {
                                                                    if (err) {
                                                                        console.error('Push메시지 발송에 실패했습니다.');
                                                                        console.error(err);
                                                                        return;
                                                                    }
                                                                    console.log('Push메시지가 발송되었습니다.');
                                                                    console.log(response);
                                                                });
                                                                //
                                                        }
                                                }
                                        }else{
                                                console.log('새 과제 게시물이 없습니다.');
                                        }
                                }else{
                                        console.log('해당 강의는 과제 게시물이 없습니다.');
                                }
                                resolve();
                        });
                });
        }



        // Parse Material Board (강의자료)
        function parseLatestMaterial(idObject, loginCookie){
                return new Promise(function(resolve, reject){
                        request({
                                uri: eclassMaterialURL,
                                method: 'GET',
                                headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Whale/1.4.64.6 Safari/537.36',
                                        'Referer': 'http://eclass2.hufs.ac.kr:8181/ilos/main/main_form.acl',
                                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                                        'Content-Type': 'text/html; charset=utf-8',
                                        'Accept-Encoding': 'gzip, deflate',
                                        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                                        'Cookie': loginCookie
                                }
                        }, async function(err, res, body){
                                if(err) return reject(err);
                                const $ = cheerio.load(body);
                                let postTitle = '';
                                // 강의자료 게시글이 적어도 하나 이상 있는 경우에만 파싱을 진행
                                if($("div[class=list_div]").length > 0){
                                        // 가장 최근에 올라온 게시글의 제목을 저장하고
                                        // postID 를 기준으로 새글의 여부를 판단
                                        let postHref = $("div[class=list_div]")
                                                                        .first()
                                                                        .find("a")
                                                                        .attr('href');
                                        let newPostID = postHref.substring(postHref.indexOf('=') + 1, postHref.indexOf('&'));
                                        // console.log(newPostID);
                                        // 새글이 있는 경우
                                        if(newPostID != idObject.materialID){
                                                // 일단 DB에 최신 ID로 업데이트
                                                await updateCurrentID(userID, idObject.sugangID, 'materialID', newPostID);
                                                // 새로운 글이 더 있는지 찾아보기
                                                let postIDArr = $("div[class=list_div]");

                                                for(var i = 0; i < postIDArr.length; i++){
                                                        postHref = postIDArr.eq(i).find("a").attr('href');
                                                        newPostID = postHref.substring(postHref.indexOf('=') + 1, postHref.indexOf('&'));
                                                        if(newPostID == idObject.materialID){
                                                                break;
                                                        }else{
                                                                // 새글에 대해 알림
                                                                postTitle = postIDArr.eq(i).find("a span").eq(0).text().replace(/(^\s*)|(\s*$)/gi, "");
                                                                console.log('[' + idObject.sugangTitle + '] 새 강의자료 발견! ==> ');
                                                                console.log(postTitle);

                                                                /** 발송할 Push 메시지 내용 */
                                                                var push_data = {
                                                                    // 수신대상
                                                                    to: client_token,
                                                                    // App에게 전달할 데이터
                                                                    data: {
                                                                        title: '[' + idObject.sugangTitle + '] 새 강의자료 등록',
                                                                        body: postTitle,
                                                                        url: ''
                                                                    },
                                                                    // 메시지 중요도
                                                                    priority: "high",
                                                                    // App 패키지 이름
                                                                    restricted_package_name: "com.example.hufs4"
                                                                };

                                                                /** 아래는 푸시메시지 발송절차 */
                                                                var fcm = new FCM(serverKey);

                                                                fcm.send(push_data, function(err, response) {
                                                                    if (err) {
                                                                        console.error('Push메시지 발송에 실패했습니다.');
                                                                        console.error(err);
                                                                        return;
                                                                    }
                                                                    console.log('Push메시지가 발송되었습니다.');
                                                                    console.log(response);
                                                                });
                                                                //
                                                        }
                                                }
                                        }else{
                                                console.log('새 강의자료가 없습니다.');
                                        }
                                }else{
                                        console.log('해당 강의는 강의자료가 없습니다.');
                                }
                                resolve();
                        });
                });
        }

        // Parse Gongji Board
        function parseLatestGongji(idObject, loginCookie){
                return new Promise(function(resolve, reject){
                        request({
                                uri: eclassGongjiURL,
                                method: 'GET',
                                headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Whale/1.4.64.6 Safari/537.36',
                                        'Referer': 'http://eclass2.hufs.ac.kr:8181/ilos/main/main_form.acl',
                                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                                        'Content-Type': 'text/html; charset=utf-8',
                                        'Accept-Encoding': 'gzip, deflate',
                                        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                                        'Cookie': loginCookie
                                }
                        }, async function(err, res, body){
                                if(err) return reject(err);
                                const $ = cheerio.load(body);
                                let postTitle = '';
                                // 공지사항이 적어도 하나 이상 있는 경우에만 파싱을 진행
                                if($("table[class=bbslist] tbody td").length > 1){
                                        // 가장 최근에 올라온 게시글의 제목을 저장하고
                                        // postID 를 기준으로 새글의 여부를 판단
                                        let postHref = $("table[class=bbslist] tbody tr")
                                                                        .first()
                                                                        .find("a")
                                                                        .attr('href');
                                        let newPostID = postHref.substring(postHref.indexOf('=') + 1, postHref.indexOf('&'));
                                        // 새글이 있는 경우
                                        if(newPostID != idObject.gongjiID){
                                                // 일단 DB에 최신 ID로 업데이트
                                                await updateCurrentID(userID, idObject.sugangID, 'gongjiID', newPostID);
                                                // 새로운 글이 더 있는지 찾아보기
                                                let postIDArr = $("table[class=bbslist] tbody tr");

                                                for(var i = 0; i < postIDArr.length; i++){
                                                        postHref = postIDArr.eq(i).find("a").attr('href');
                                                        newPostID = postHref.substring(postHref.indexOf('=') + 1, postHref.indexOf('&'));
                                                        if(newPostID == idObject.gongjiID){
                                                                break;
                                                        }else{
                                                                // 새글에 대해 알림
                                                                postTitle = postIDArr.eq(i).find("a").text();
                                                                console.log('[' + idObject.sugangTitle + '] 새 공지사항 발견! ==> ');
                                                                console.log(postTitle);

                                                                /** 발송할 Push 메시지 내용 */
                                                                var push_data = {
                                                                    // 수신대상
                                                                    to: client_token,
                                                                    data: {
                                                                        title: '[' + idObject.sugangTitle + '] 새 공지사항 등록',
                                                                        body: postTitle,
                                                                        url: ''
                                                                    },
                                                                    // 메시지 중요도
                                                                    priority: "high",
                                                                    // App 패키지 이름
                                                                    restricted_package_name: "com.example.hufs4"
                                                                };

                                                                /** 아래는 푸시메시지 발송절차 */
                                                                var fcm = new FCM(serverKey);

                                                                fcm.send(push_data, function(err, response) {
                                                                    if (err) {
                                                                        console.error('Push메시지 발송에 실패했습니다.');
                                                                        console.error(err);
                                                                        return;
                                                                    }
                                                                    console.log('Push메시지가 발송되었습니다.');
                                                                    console.log(response);
                                                                });
                                                                //
                                                        }
                                                }
                                        }else{
                                                console.log('새 글이 없습니다.');
                                        }
                                }else{
                                        console.log('해당 강의는 공지사항이 없습니다.');
                                }
                                resolve();
                        });
                });
        }

        // Replace User's Current Official Board ID with New One
        function updateOfficialDB(){
                return new Promise(function(resolve, reject){
                        console.log('Start updateOfficialDB...');
                        var mysql      = require('mysql');
                        var connection = mysql.createConnection({
                          host     : '106.10.42.35',    // 호스트 주소
                          user     : 's201402783',           // mysql user
                          password : '01040436647',       // mysql password
                          database : 'capstonDB',         // mysql 데이터베이스
                          port: 3306
                        });
                        connection.connect();
                        // 수강 코드와 게시판 별 코드를 전부 가져온다.
                        var selectQuery = 'SELECT GONGJI, HAKSA, JANGHAK FROM USER WHERE userID = \''
                                                                + userID
                                                                + '\'';
                        // console.log(selectQuery);
                        connection.query(selectQuery,
                        function (error, results, fields) {
                        if (error) throw error;
                        // Get User's Cureent Board ID
                        var gNum = results[0].GONGJI;
                        var hNum = results[0].HAKSA;
                        var jNum = results[0].JANGHAK;

                        // Update User's latest Board ID
                        if(setValue.hufsNotice == '1'){
                                console.log('Start hufsNotice...');
                                var gSelectQuery = 'SELECT postID, postTitle, postURL FROM OFFICIAL WHERE boardID = \'GONGJI\' and postID > \''
                                                                + gNum + '\' ORDER BY postID DESC';
                                connection.query(gSelectQuery,
                                        function (error, results, fields) {
                                                if (error) throw error;
                                                if(results.length > 0){
                                                        for(var i = 0; i < results.length; i++){
                                                                console.log('학교 공지 새 글 [' + results[i].postID + ']');
                                                                // console.log(results[i].postTitle);
                                                                // console.log(results[i].postID);
                                                                /** 발송할 Push 메시지 내용 */
                                                                var push_data = {
                                                                    // 수신대상
                                                                    to: client_token,
                                                                    // App에게 전달할 데이터
                                                                    data: {
                                                                        title: '새 공지 게시글',
                                                                        body: results[i].postTitle,
                                                                        url: results[i].postURL
                                                                    },
                                                                    // 메시지 중요도
                                                                    priority: "high",
                                                                    // App 패키지 이름
                                                                    restricted_package_name: "com.example.hufs4"
                                                                };
                                                                /** 아래는 푸시메시지 발송절차 */
                                                                var fcm = new FCM(serverKey);

                                                                fcm.send(push_data, function(err, response) {
                                                                    if (err) {
                                                                        console.error('Push메시지 발송에 실패했습니다.');
                                                                        console.error(err);
                                                                        return;
                                                                    }
                                                                    console.log('Push메시지가 발송되었습니다.');
                                                                    console.log(response);
                                                                });
                                                        }
                                                        var gUpdateQuery = 'UPDATE USER SET GONGJI = \'' + results[0].postID + '\' WHERE userID = \'' + userID + '\'';
                                                        connection.query(gUpdateQuery,
                                                                function (error, results, fields){
                                                                        if (error) throw error;
                                                                });
                                                }else{
                                                        console.log('새로운 학교 공지 게시글이 없습니다.');
                                                }
                                        });
                        }

                        if(setValue.bachelorNotice == '1'){
                                console.log('Start bachelorNotice...');
                                var hSelectQuery = 'SELECT postID, postTitle, postURL FROM OFFICIAL WHERE boardID = \'HAKSA\' and postID > \''
                                                                + hNum + '\' ORDER BY postID DESC';
                                connection.query(hSelectQuery,
                                        function (error, results, fields) {
                                                if (error) throw error;
                                                if(results.length > 0){
                                                        for(var i = 0; i < results.length; i++){
                                                                console.log('학교 학사 게시판 새 글 발견');
                                                                // console.log(results[i].postTitle);
                                                                // console.log(results[i].postID);
                                                                /** 발송할 Push 메시지 내용 */
                                                                var push_data = {
                                                                    // 수신대상
                                                                    to: client_token,
                                                                    // App에게 전달할 데이터
                                                                    data: {
                                                                        title: '새 학사 게시글',
                                                                        body: results[i].postTitle,
                                                                        url: results[i].postURL
                                                                    },
                                                                    // 메시지 중요도
                                                                    priority: "high",
                                                                    // App 패키지 이름
                                                                    restricted_package_name: "com.example.hufs4"
                                                                };

                                                                /** 아래는 푸시메시지 발송절차 */
                                                                var fcm = new FCM(serverKey);

                                                                fcm.send(push_data, function(err, response) {
                                                                    if (err) {
                                                                        console.error('Push메시지 발송에 실패했습니다.');
                                                                        console.error(err);
                                                                        return;
                                                                    }
                                                                    console.log('Push메시지가 발송되었습니다.');
                                                                    console.log(response);
                                                                });
                                                        }
                                                        var hUpdateQuery = 'UPDATE USER SET HAKSA = \'' + results[0].postID + '\' WHERE userID = \'' + userID + '\'';
                                                        connection.query(hUpdateQuery,
                                                                function (error, results, fields){
                                                                        if (error) throw error;
                                                                });
                                                }else{
                                                        console.log('새로운 학교 학사 게시글이 없습니다.');
                                                }
                                        });
                        }

                        if(setValue.scholarshipNotice == '1'){
                                console.log('Start scholarshipNotice...');
                                var jSelectQuery = 'SELECT postID, postTitle, postURL FROM OFFICIAL WHERE boardID = \'JANGHAK\' and postID > \''
                                                                + jNum + '\' ORDER BY postID DESC';
                                connection.query(jSelectQuery,
                                        function (error, results, fields) {
                                                if (error) throw error;
                                                if(results.length > 0){
                                                        for(var i = 0; i < results.length; i++){
                                                                console.log('학교 장학 게시판 새 글 발견');
                                                                // console.log(results[i].postTitle);
                                                                // console.log(results[i].postID);
                                                                /** 발송할 Push 메시지 내용 */
                                                                var push_data = {
                                                                    // 수신대상
                                                                    to: client_token,
                                                                    // App에게 전달할 데이터
                                                                    data: {
                                                                        title: '새 장학 게시글',
                                                                        body: results[i].postTitle,
                                                                        url: results[i].postURL
                                                                    },
                                                                    // 메시지 중요도
                                                                    priority: "high",
                                                                    // App 패키지 이름
                                                                    restricted_package_name: "com.example.hufs4"
                                                                };

                                                                /** 아래는 푸시메시지 발송절차 */
                                                                var fcm = new FCM(serverKey);

                                                                fcm.send(push_data, function(err, response) {
                                                                    if (err) {
                                                                        console.error('Push메시지 발송에 실패했습니다.');
                                                                        console.error(err);
                                                                        return;
                                                                    }
                                                                    console.log('Push메시지가 발송되었습니다.');
                                                                    console.log(response);
                                                                });
                                                        }
                                                        var jUpdateQuery = 'UPDATE USER SET JANGHAK = \'' + results[0].postID + '\' WHERE userID = \'' + userID + '\'';
                                                        connection.query(jUpdateQuery,
                                                                function (error, results, fields){
                                                                        if (error) throw error;
                                                                });
                                                }else{
                                                        console.log('새로운 장학 게시판 글이 없습니다.');
                                                }

                                        });
                        }
                        resolve(results);
                        });
                        //
                });
                connection.end();
        }

        // Return User's Sugang IDs, gongjiIDs and materialIDs
        function getSugangIDs(userID){
                return new Promise(function(resolve, reject){
                        var mysql      = require('mysql');
                        var connection = mysql.createConnection({
                          host     : '106.10.42.35',    // 호스트 주소
                          user     : 's201402783',           // mysql user
                          password : '01040436647',       // mysql password
                          database : 'capstonDB',         // mysql 데이터베이스
                          port: 3306
                        });
                        connection.connect();
                        // 수강 코드와 게시판 별 코드를 전부 가져온다.
                        var selectQuery = 'SELECT sugangID, gongjiID, materialID, sugangTitle, reportID FROM SUGANG WHERE userID = \''
                                                                + userID
                                                                + '\'';
                        // console.log(selectQuery);
                        connection.query(selectQuery,
                        function (error, results, fields) {
                          if (error) throw error;
                          // Return Sugang IDs
                          resolve(results);
                        });
                        connection.end();
                });
        }

        // Get and Set User's Token Value
        function getTokenValue(){
                return new Promise(function(resolve, reject){
                        var mysql      = require('mysql');
                        var connection = mysql.createConnection({
                          host     : '106.10.42.35',    // 호스트 주소
                          user     : 's201402783',           // mysql user
                          password : '01040436647',       // mysql password
                          database : 'capstonDB',         // mysql 데이터베이스
                          port: 3306
                        });
                        connection.connect();
                        var selectQuery = 'SELECT token FROM USER WHERE userID = \''
                                                                + userID
                                                                + '\'';
                        connection.query(selectQuery,
                        function (error, results, fields) {
                                if (error) throw error;
                                // Return Token Value
                                if(results.length > 0){
                                        client_token = results[0].token;
                                        resolve();
                                }
                                else{
                                        console.log("No Token Found!");
                                        reject({error: "No Token Found.!"});
                                }
                        });
                });
                connection.end();
        }

        // Get and Set User's Setting value
        function setSettingValues(){
                return new Promise(function(resolve, reject){
                        var mysql      = require('mysql');
                        var connection = mysql.createConnection({
                          host     : '106.10.42.35',    // 호스트 주소
                          user     : 's201402783',           // mysql user
                          password : '01040436647',       // mysql password
                          database : 'capstonDB',         // mysql 데이터베이스
                          port: 3306
                        });
                        connection.connect();
                        // 수강 코드와 게시판 별 코드를 전부 가져온다.
                        var selectQuery = 'SELECT hufsNotice, bachelorNotice, scholarshipNotice, eNotice, '
                                                                + 'eAssignment, eLecturenote FROM SETTING WHERE userID = \''
                                                                + userID
                                                                + '\'';
                        // console.log(selectQuery);
                        connection.query(selectQuery,
                        function (error, results, fields) {
                          if (error) throw error;
                          // Return Sugang IDs
                          setValue = results[0];
                          resolve();
                        });
                        connection.end();
                });
        }

        async function startEclassTask(){
                // 이클래스 새 글 알림 설정 값이 하나라도 1인 경우 알림 작업을 시작
                if(setValue.eNotice == '1' || setValue.eLecturenote == '1' || setValue.eAssignment == '1'){
                        const results = await getSugangIDs(userID);

                        // for each Sugang ID
                        for(var i = 0; i < results.length; i++){
                                var sugangID = results[i].sugangID;
                                // 이클래스룸 인증을 마치고나서
                                await eclassRoomConnect(sugangID, loginCookie);

                                // 공지 게시판 먼저 파싱
                                if(setValue.eNotice == '1'){
                                        await parseLatestGongji(results[i], loginCookie);
                                }

                                // 그 다음 강의 자료 게시판 파싱
                                if(setValue.eLecturenote == '1'){
                                        await parseLatestMaterial(results[i], loginCookie);
                                }

                                // 마지막으로 과제 게시판 파싱
                                if(setValue.eAssignment == '1'){
                                        await parseLatestReport(results[i], loginCookie);
                                }
                        }
                }
        }

        function startOfficialTask(){
                // 학교 홈페이지 새 글 알림 설정 값이 하나라도 1인 경우 알림 작업을 시작
                if(setValue.hufsNotice == '1' || setValue.bachelorNotice == '1' || setValue.scholarshipNotice == '1'){
                        updateOfficialDB();
                }
        }


        async function main(){
                // Load User's Setting Value and Set (Sync)
                await setSettingValues();
                console.log(JSON.stringify(setValue)); //TEST
                // Load User's Token Value and Set (Sync)
                await getTokenValue();
                console.log(client_token); //TEST
                // Start Parse Task for Official boards (Async)
                startOfficialTask();
                // 이클래스 새 글 알림 설정 값이 하나라도 1인 경우 알림 작업을 시작
                if(setValue.eNotice == '1' || setValue.eLecturenote == '1' || setValue.eAssignment == '1'){
                        // Get User's Password and Set Login URL (Sync)
                        await setLoginURL();
                        // Obtain and Set Login Cookie Using a Password (Sync)
                        await setLoginCookie();
                        // Start Parse Task for E-Class boards (Async)
                        startEclassTask();
                }
        }
}

module.exports = checkSugang
