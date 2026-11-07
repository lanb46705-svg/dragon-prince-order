"""从源文件构建离线单文件；生成物不得直接手改。"""
import base64,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
def read(p):return (ROOT/p).read_text()
def data(p,mime):return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
js="const fs=require('fs'),vm=require('vm');let x={};vm.runInNewContext(fs.readFileSync('src/questions.js','utf8')+fs.readFileSync('src/content.js','utf8')+';globalThis.result={questions:QUESTIONS,pages:PAGES.map(({id,type,title})=>({id,type,title}))}',x);process.stdout.write(JSON.stringify(x.result))"
content=json.loads(subprocess.check_output(['node','-e',js],cwd=ROOT))
art={p.stem:data(p,'image/jpeg') for p in sorted((ROOT/'assets').glob('comic*.jpeg'))}
s=read('src/template.html').replace('34个作答空','32个作答空')
s=s.replace('/*__CSS__*/',read('src/style.css')+'\n'+read('src/drag.css'))
s=s.replace('/*__ASSETS__*/','const ART='+json.dumps(art,separators=(',',':'))+';')
s=s.replace('/*__DATA__*/',read('src/questions.js')+'\n'+read('src/content.js'))
s=s.replace('/*__APP__*/',read('src/app.js')+'\n'+read('src/drag.js')+'\nresize();render();')
assert not re.search(r'/\*__(CSS|ASSETS|DATA|APP)__\*/',s)
(ROOT/'docs').mkdir(exist_ok=True);(ROOT/'output').mkdir(exist_ok=True)
for p in [ROOT/'docs/index.html',ROOT/'output/龙王子_顺序之门_互动完整版.html']:p.write_text(s)
(ROOT/'docs/.nojekyll').touch()
(ROOT/'reference/source.json').write_text(json.dumps([{k:q[k] for k in ['id','label','page','endPage','stem'] if k in q} for q in content['questions']],ensure_ascii=False,indent=2))
(ROOT/'qa/questions.json').write_text(json.dumps(content['questions'],ensure_ascii=False,indent=2))
(ROOT/'qa/pages.json').write_text(json.dumps(content['pages'],ensure_ascii=False,indent=2))
print(f'构建 {len(content["pages"])} 场景，{len(content["questions"])} 题组，{sum(len(q["fields"]) for q in content["questions"])} 空；单文件 {len(s.encode())/1024/1024:.2f} MB')
