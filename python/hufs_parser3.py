import requests
from bs4 import BeautifulSoup
import os
import pymysql
import telegram

# Telegram Config
bot = telegram.Bot(token='632325521:AAED2kE4qeRUahZU6gvGxiW44vzhEeDLNlQ')
#chat_id = bot.getUpdates()[-1].message.chat.id
chat_id = 656764398

# MySQL Config
conn = pymysql.connect(host = '106.10.42.35', user = 's201402783', password = '01040436647', db = 'capstonDB')
curs = conn.cursor()

# File Path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Haksa Crawling
req = requests.get('http://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=37080&siteId=hufs&menuType=T&uId=4&sortChar=AB&linkUrl=04_0202.html&mainFrame=right')
req.encoding = 'utf-8'

html = req.text
soup = BeautifulSoup(html, 'html.parser')
nums = soup.select('td.no > span.mini_eng')

latest_num = nums[0].text.strip()

with open(os.path.join(BASE_DIR, 'hak_latest_num.txt'), 'r') as f_read:
        before = f_read.readline()
        f_read.close()
        if before != latest_num:
                cnt = int(latest_num)-int(before)

                for i in range(0,cnt):
                        num_latest = nums[i].text.strip()
                        title_latest = nums[i].findNext('td').text.replace('\n','').replace('\t','').replace(' ','')
                        arr = nums[i].findNext('a').get('href').split('=')
                        link_latest = 'http://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=37080&siteId=hufs&menuType=T&uId=4&sortChar=AB&linkUrl=04_0202.html&mainFrame=right&dum=dum&boardId=109336176&page=1&command=view&boardSeq=' + arr[4]

                        print('[학사] ' + title_latest)
                        title_latest = title_latest.replace("'", "''")
                        insertQuery = 'INSERT INTO OFFICIAL(boardID, postID, postTitle, postURL) VALUES(\'HAKSA\', ' + '\'' + num_latest + '\', ' + '\'' + title_latest + '\', ' + '\'' + link_latest + '\')'
                        curs.execute(insertQuery)
                        final_message = "(새 학사 공지 알림)\n" + title_latest + "\n" + link_latest
                        bot.sendMessage(chat_id=chat_id, text=final_message)

                with open(os.path.join(BASE_DIR, 'hak_latest_num.txt'), 'w+') as f_write:
                        f_write.write(latest_num)
                        f_write.close()
        conn.commit()


# Gongji Crawling
req = requests.get('http://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=37079&siteId=hufs&menuType=T&uId=4&sortChar=AB&linkUrl=04_0202.html&mainFrame=right')
req.encoding = 'utf-8'

html = req.text
soup = BeautifulSoup(html, 'html.parser')
nums = soup.select('td.no > span.mini_eng')

latest_num = nums[0].text.strip()

with open(os.path.join(BASE_DIR, 'gong_latest_num.txt'), 'r') as f_read:
        before = f_read.readline()
        f_read.close()
        if before != latest_num:
                cnt = int(latest_num)-int(before)

                for i in range(0,cnt):
                        num_latest = nums[i].text.strip()
                        title_latest = nums[i].findNext('td').text.replace('\n','').replace('\t','').replace(' ','')
                        arr = nums[i].findNext('a').get('href').split('=')
                        link_latest = 'http://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=37079&siteId=hufs&menuType=T&uId=4&sortChar=AB&linkUrl=04_0201.html&mainFrame=right&dum=dum&boardId=41661&page=1&command=view&boardSeq=' + arr[4]
                        print('[공지] ' + title_latest)
                        title_latest = title_latest.replace("'", "''")
                        insertQuery = 'INSERT INTO OFFICIAL(boardID, postID, postTitle, postURL) VALUES(\'GONGJI\', ' + '\'' + num_latest + '\', ' + '\'' + title_latest + '\', ' + '\'' + link_latest + '\')'
                        curs.execute(insertQuery)
                        final_message = "(새 공지 알림)\n" + title_latest + "\n" + link_latest
                        bot.sendMessage(chat_id=chat_id, text=final_message)

                with open(os.path.join(BASE_DIR, 'gong_latest_num.txt'), 'w+') as f_write:
                        f_write.write(latest_num)
                        f_write.close()
        conn.commit()

# Janghak Crawling
req = requests.get('http://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=37081&siteId=hufs&menuType=T&uId=4&sortChar=AB&linkUrl=04_0203.html&mainFrame=right')
req.encoding = 'utf-8'

html = req.text
soup = BeautifulSoup(html, 'html.parser')
nums = soup.select('td.no > span.mini_eng')

latest_num = nums[0].text.strip()

with open(os.path.join(BASE_DIR, 'jang_latest_num.txt'), 'r') as f_read:
        before = f_read.readline()
        f_read.close()
        if before != latest_num:
                cnt = int(latest_num)-int(before)

                for i in range(0,cnt):
                        num_latest = nums[i].text.strip()
                        title_latest = nums[i].findNext('td').text.replace('\n','').replace('\t','').replace(' ','')
                        arr = nums[i].findNext('a').get('href').split('=')
                        link_latest = 'http://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=37081&siteId=hufs&menuType=T&uId=4&sortChar=AB&linkUrl=04_0203.html&mainFrame=right&dum=dum&boardId=118188197&page=1&command=view&boardSeq=' + arr[4]

                        print('[장학] ' + title_latest)
                        title_latest = title_latest.replace("'", "''")
                        insertQuery = 'INSERT INTO OFFICIAL(boardID, postID, postTitle, postURL) VALUES(\'JANGHAK\', ' + '\'' + num_latest + '\', ' + '\'' + title_latest + '\', ' + '\'' + link_latest + '\')'
                        curs.execute(insertQuery)
                        final_message = "(새 장학 알림)\n" + title_latest + "\n" + link_latest
                        bot.sendMessage(chat_id=chat_id, text=final_message)

                with open(os.path.join(BASE_DIR, 'jang_latest_num.txt'), 'w+') as f_write:
                        f_write.write(latest_num)
                        f_write.close()
        conn.commit()

conn.close()