"""独立使用枚举、组合定义和分段穷举复算已收录原题。"""
from itertools import combinations,permutations,product
from math import factorial,comb,perm
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parent.parent
qs=json.loads((ROOT/'qa/questions.json').read_text())
checks=[]
def check(name,ok,detail=''):
 checks.append({'name':name,'pass':bool(ok),'detail':str(detail)})
def ncomb(n,r):return sum(1 for _ in combinations(range(n),r))
expected={
'p-ex1':[perm(7,2),perm(6,3)-perm(10,2),3*perm(6,5)-factorial(3)],
'p-pr1':[perm(5,2),factorial(6),perm(7,6)-perm(7,3)],
'p-ex2':[sum(1 for _ in permutations(range(6),3))],
'p-ex4':[sum(1 for a in permutations(range(7)) if max(a.index(i) for i in [4,5,6])-min(a.index(i) for i in [4,5,6])==2)],
'p-fuwa':[sum(1 for a in permutations(range(5)) if abs(a.index(0)-a.index(4))==1)],
'p-ex6':[sum(1 for mm in combinations(range(9),3) if all(b-a>1 for a,b in zip(mm,mm[1:])))*6*factorial(5)*factorial(4)*factorial(3)],
'c-ex1':[ncomb(6,2),ncomb(6,4),ncomb(7,1),ncomb(7,6),comb(56,55),2*ncomb(6,2)+perm(6,2)],
'c-pr1':[ncomb(8,2),2*ncomb(7,3),ncomb(100,2)],
'c-ex2':[ncomb(10,3),sum(1 for _ in permutations(range(10),3))],
'football':[sum(a!=b for a,b in product(range(6),repeat=2)),ncomb(4,2)],
'courses':[ncomb(8,3),sum(not(0 in a and 1 in a) for a in combinations(range(8),3))],
'weapons':[sum((0 in a)==(1 in a) for a in combinations(range(8),3))],
'chocolate':[len(list(product([0,1],repeat=9)))],
'digitsum':[sum(1 for mask in product([0,1],repeat=8))],
'challenge7':[sum(abs(a.index(0)-a.index(2))==1 and abs(a.index(1)-a.index(3))>1 for a in permutations(range(7)))],
'challenge6':[sum(abs(a.index(0)-a.index(1))>1 for a in permutations(range(6)))],
'lines':[sum(not(all(i<6 for i in a) or all(i>=6 for i in a)) for a in combinations(range(10),3))],
'oddeven':[sum(sum(i%2 for i in a)==2 for a in permutations(range(1,10),4))]
}
check('题组18、作答空32',len(qs)==18 and sum(len(q['fields']) for q in qs)==32)
check('课堂巩固及后续未收录',all(q['page']<=8 and not q['id'].startswith(('review','entry','ability')) for q in qs))
for q in qs:
 actual=[f[1] for f in q['fields']]
 check(q['id']+' 独立复算',actual==expected[q['id']],{'expected':expected[q['id']],'actual':actual})
 check(q['id']+' 教学资料完整',all(q.get(k) for k in ['stem','fields','hint','steps','sum','sim']))
 check(q['id']+' PDF来源记录',q['page'] in [4,5,6,7,8])
html=(ROOT/'docs/index.html').read_text()
check('单文件无外部脚本样式图片',not any(x in html for x in ['<script src=','<link rel="stylesheet"','src="http','src="assets/']))
check('无配音模块',all(x not in html for x in ['<audio','AUDIO','playVoice','voiceBtn','配音']))
check('保留5张原插画',html.count('data:image/jpeg;base64,')==5)
check('P A C 竖排组件',all(x in html for x in ['math-top','math-bottom','math-stack']))
result={'status':'PASS' if all(x['pass'] for x in checks) else 'FAIL','checks':checks,'passed':sum(x['pass'] for x in checks),'total':len(checks),'artifact_sha256':hashlib.sha256(html.encode()).hexdigest()}
(ROOT/'qa/math-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(result['status'],result['passed'],'/',result['total'])
for c in checks:
 if not c['pass']:print(c)
raise SystemExit(0 if result['status']=='PASS' else 1)
