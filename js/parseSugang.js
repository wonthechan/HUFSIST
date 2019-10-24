function parseSugang(uID, uPW) {
    const request = require("request");
    const mainURL = 'http://eclass2.hufs.ac.kr:8181/ilos/main/main_form.acl';
    const cheerio = require('cheerio');
    const userID = uID;
    const userPassword = uPW; // Hashed Password

    // Get Session Cookie
    let loginURL = "https://eclass2.hufs.ac.kr:4443/ilos/lo/login.acl?usr_id=" + userID + "&usr_pwd=" + userPassword;
    var loginCookie = new Object();


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
                 // console.log(res.headers['set-cookie']);
                 resolve(res.headers['set-cookie']);
                 // console.log(typeof(res.headers['set-cookie'][1]));
            });
        });
    }

    getLoginCookie(loginURL)
        .then(function(result){
            loginCookie = result;
            // console.log(loginCookie);
            request({
                uri: mainURL,
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
            }, function(err, res, body){
                if(err) return reject(err);
                const $ = cheerio.load(body);
                let lecInfo = $("em[class=sub_open]");

                // MySQL Config
                var mysql      = require('mysql');
                var connection = mysql.createConnection({
                  host     : '106.10.42.35',    // 호스트 주소
                  user     : 's201402783',      // mysql user
                  password : '01040436647',     // mysql password
                  database : 'capstonDB',       // mysql 데이터베이스
                  port: 3306
                });
                connection.connect();

                // 추출
                $("em[class=sub_open]").each(function(item){
                    var lecRawTitle = $(this).attr('title');
                    var lecRawCode = $(this).attr('onclick');
                    console.log(lecRawTitle.substring(0, lecRawTitle.length - 9));
                    console.log(lecRawCode.split('\'')[1]);

                    var insertQuery = 'INSERT INTO SUGANG(userID, sugangID, sugangTitle) VALUES(\''
                                        + userID
                                        + '\', \''
                                        + lecRawCode.split('\'')[1]
                                        + '\', \''
                                        + lecRawTitle.substring(0, lecRawTitle.length - 9)
                                        + '\')';
                    console.log(insertQuery);
                    connection.query(insertQuery,
                    function (error, results, fields) {
                      if (error) throw error;
                      // console.log('The solution is: ', results[0].init);
                      // // 0이면 과목 파싱 작업 시작
                      // // 1이면 과목 별 게시물 넘버 파싱 시작
                      // if(results[0].init == '0'){
                      //    console.log("YES");
                      // }
                    });
                })
                connection.end();
            });

        }).catch(function(err){
                console.log(err);
        });
}

module.exports = parseSugang