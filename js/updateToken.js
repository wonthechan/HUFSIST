function updateToken(uID, token) {
        const userID = uID;
        const newToken = token;

        updateTask(userID, newToken);

        async function updateTask(userID, newToken){

                const currentToken = await getCurrentToken(uID);

                if(currentToken != newToken){
                        // 기존 토큰 값과 로그인 시 얻어온 새로운 토큰 값이 다르다면 DB에 새로운 토큰 값으로 업데이트 한다.
                        await updateCurrentToken(userID, newToken);
                }else{
                        // 새로운 토큰 값과 기존 토큰 값이 동일합니다.
                }
        }

        // Replace Current Token With New Token
        function updateCurrentToken (uID, newToken){
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
                        var updateQuery = 'UPDATE USER SET token = \''
                                                                + newToken
                                                                + '\' WHERE userID = \''
                                                                + userID
                                                                + '\'';
                        connection.query(updateQuery,
                        function (error, results, fields) {
                          if (error) throw error;
                          resolve();
                        });
                        connection.end();
                });
        }

        // Get Current Token Value From MySQL
        function getCurrentToken (uID){
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
                                resolve(results[0].token);
                          }else{
                                console.log('No result');
                                reject(error);
                          }

                        });
                        connection.end();
                });
        }
}

module.exports = updateToken