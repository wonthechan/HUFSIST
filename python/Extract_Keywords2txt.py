import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from konlpy.tag import Okt
import os

okt=Okt()

# load Stopwords txt to list
f = open("./stopwords_kr.txt", 'r')
stop_words = f.read()
stop_words = stop_words.split('\n')

# Save File Config
result_txt = open("./keywords.txt", mode='wt', encoding='utf-8')

# load each syllabus txt file
sDirectory = os.listdir("./syllabus/")
# Get All Refined Tokens from each TXT
all_refined_tokens = []
for file in sDirectory:
    f = open("./syllabus/" + file, 'r')
    raw_syllabus = f.read()

    nouns_syllabus = okt.nouns(raw_syllabus)

    for w in nouns_syllabus:
        if w not in stop_words:
            all_refined_tokens.append(w)

word2index = {}
bow = []

for voca in all_refined_tokens:
    if voca not in word2index.keys():
        word2index[voca] = len(word2index)
        # token을 읽으면서, word2index에 없는 (not in) 단어는 새로 추가하고, 이미 있는 단어는 넘깁니다.
        bow.insert(len(word2index) - 1, 1)
    # BoW 전체에 전부 기본값 1을 넣어줍니다. 단어의 개수는 최소 1개 이상이기 때문입니다.
    else:
        index = word2index.get(voca)
        # 재등장하는 단어의 인덱스를 받아옵니다.
        bow[index] = bow[index] + 1
        # 재등장한 단어는 해당하는 인덱스의 위치에 1을 더해줍니다. (단어의 개수를 세는 것입니다.)

token_dic = {}

for token in word2index:
    token_dic[token] = bow[word2index.get(token)]

token_dic_sorted = sorted(token_dic.items(), key=lambda t : t[1], reverse=True)

for element in token_dic_sorted:
    result_txt.write(element[0] + ' ' + str(element[1]) + '\n')