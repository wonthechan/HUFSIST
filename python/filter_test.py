#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os
import sys

keyword_list = []

# input keyword 잘라내고 리스트에 넣기
for each in sys.argv[1].split('_'):
    keyword_list.append(each)

len_keyword = len(keyword_list)

# load each syllabus txt file
try:
        sDirectory = os.listdir("/root/tokens/")
except Exception as ex:
        print(ex)

f = open("/root/tokens/" + sDirectory[0], 'r', encoding='utf-8')

try:
        target = f.read()
except Exception as ex3:
        print(ex3)

token_dic_list = []

# Make Dic
for file in sDirectory:
    f = open("/root/tokens/" + file, 'r', encoding='utf-8')
    target = f.read()
    token_dic = {}
    lines = target.split('\n')
    for line in lines:
        if line != '':
            token_KV = line.split(' ')
            token_dic[token_KV[0]] = int(token_KV[1])
    token_dic['$code$'] = file.split('.')[0]
    token_dic_list.append(token_dic)

# filterd Dictionary List
# Key : 일치하는 키워드의 개수 / Value : 일치하는 키워드의 개수가 Key 인 강의들의 리스트
key_freq_dic = {}
# 초기화
for i in range(0, len_keyword):
    key_freq_dic[i] = []

for dic in token_dic_list:
    # 일치하는 키워드의 개수 파악
    cnt = 0
    freq = 0
    for keyword in keyword_list:
        if keyword in dic.keys():
            cnt = cnt + 1
            freq = freq + dic.get(keyword) # 일치 하는 키워드의 빈도 수를 누적
    # 일치하는 키워드가 하나라도 있는 경우에만 해당 리스트에 append
    if cnt > 0:
        dic['$freq$'] = freq # 누적 변수 덧붙이기
        key_freq_dic[cnt-1].append(dic)
        # print(str(cnt) + ' / ' + str(dic.get('$freq$')))

# 키워드 일치 수 그룹 내에서 빈도수로 정렬
for i in range(0, len_keyword):
    # 누적 변수로 내림차순 정렬
    sorted_dic = sorted(key_freq_dic.get(i), key=lambda t : t['$freq$'], reverse=True)
    # 정렬 된 리스트로 업데이트
    key_freq_dic[i] = sorted_dic

for i in range(0, len_keyword):
   for entry in key_freq_dic.get(len_keyword-1 - i):
       print(entry['$code$'], end=',')