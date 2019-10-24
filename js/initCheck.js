function initCheck(uID) {
        // DB에 모든 필드의 ID 값을 최신 값으로 교체 하는 스크립트 (알림기능을 오랜기간동안 꺼두었다가 다시 켜는 경우)
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

        // Get Password From MySQL
        function getPasswordFromDB (uID){
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
                                userPassword = results[0].userPassword;
                                resolve(userPassword);
                          }else{
                                reject({error: "Not Vaild User!"});
                          }
                        });
                        connection.end();
                });
        }

        // Get Session Cookie
        function getLoginCookie (paramURL){
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
                                        resolve(res.headers['set-cookie']);
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

        // Replace Current ID value With New One
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
                                        }else{
                                                //console.log('새 과제 게시물이 없습니다.');
                                        }
                                }else{
                                        //console.log('해당 강의는 과제 게시물이 없습니다.');
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
                                        // 새글이 있는 경우
                                        if(newPostID != idObject.materialID){
                                                // 일단 DB에 최신 ID로 업데이트
                                                await updateCurrentID(userID, idObject.sugangID, 'materialID', newPostID);
                                        }else{
                                                //console.log('새 강의자료가 없습니다.');
                                        }
                                }else{
                                        //console.log('해당 강의는 강의자료가 없습니다.');
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
                                        // 가장 최근에 올라온 게시글의 ID 파싱
                                        let postHref = $("table[class=bbslist] tbody tr")
                                                                        .first()
                                                                        .find("a")
                                                                        .attr('href');
                                        let newPostID = postHref.substring(postHref.indexOf('=') + 1, postHref.indexOf('&'));

                                        // 새글이 있는 경우 (기능이 꺼져있던 동안 쌓인 게시글은 전부 무시하고 최신 게시물 아이디로 교체)
                                        if(newPostID != idObject.gongjiID){
                                                // 일단 DB에 최신 ID로 업데이트
                                                await updateCurrentID(userID, idObject.sugangID, 'gongjiID', newPostID);
                                        }else{
                                                //console.log('새 글이 없습니다.');
                                        }
                                }else{
                                        //console.log('해당 강의는 공지사항이 없습니다.');
                                }
                                resolve();
                        });
                });
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

        //
        function updateOfficialDB(cols){
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
                        // User의 공지, 학사, 장학 ID를 모두 Update 한다.

                        var updateQuery = 'UPDATE USER SET '
                                                                + cols[0].boardID + ' = \'' + cols[0].postID + '\', '
                                                                + cols[1].boardID + ' = \'' + cols[1].postID + '\', '
                                                                + cols[2].boardID + ' = \'' + cols[2].postID + '\' '
                                                                + 'WHERE userID = \'' + userID + '\'';
                        // console.log(updateQuery);
                        connection.query(updateQuery,
                        function (error, results, fields) {
                          if (error) throw error;
                          // Return Sugang IDs
                          resolve();
                        });
                        connection.end();
                });
        }

        // Return Latest Official ID From DB
        function getLatestOfficialID(){
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
                        var selectQuery = 'SELECT * FROM view_latest_official'
                        // console.log(selectQuery);
                        connection.query(selectQuery,
                        function (error, results, fields) {
                          if (error) throw error;
                          // Return Sugang IDs
                          if(results.length != 3){
                                reject(error);
                          }else{
                                resolve(results);
                          }
                        });
                        connection.end();
                });
        }

        async function proceedCheckTask(loginCookie){
                console.log('Start initCheck...');
                // set token value
                const results = await getSugangIDs(userID);

                // for each Sugang ID
                for(var i = 0; i < results.length; i++){
                        var sugangID = results[i].sugangID;
                        // 이클래스룸 인증을 마치고나서
                        await eclassRoomConnect(sugangID, loginCookie);
                        // 공지 게시판 먼저 파싱
                        await parseLatestGongji(results[i], loginCookie);
                        // 그 다음 강의 자료 게시판 파싱
                        await parseLatestMaterial(results[i], loginCookie);
                        // 마지막으로 과제 게시판 파싱
                        await parseLatestReport(results[i], loginCookie);
                 }
        }

        async function updateOfficial(){
                const results2 = await getLatestOfficialID();
                updateOfficialDB(results2);
        }


        getPasswordFromDB(userID)
                .then(function(result){
                        // set URL for login page
                        loginURL = "https://eclass2.hufs.ac.kr:4443/ilos/lo/login.acl?usr_id=" + userID + "&usr_pwd=" + result;
                        getLoginCookie(loginURL)
                                .then(function(result){
                                        loginCookie = result;
                                        // Start Check Task
                                        proceedCheckTask(loginCookie);
                                        updateOfficial();
                                }).catch(function(err){
                                        console.log(err);
                                });
                }).catch(function(err){
                        console.log(err);
                });
}

module.exports = initCheck
