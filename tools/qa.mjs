import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/liaoxiaojiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'qa/screenshots');fs.mkdirSync(out,{recursive:true});
const checks=[],errors=[];
const check=(name,ok,detail='')=>{checks.push({name,pass:!!ok,detail});if(!ok)console.log('FAIL',name,detail)};
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765');
const jump=async id=>page.evaluate(id=>go(PAGES.findIndex(p=>p.id===id)),id);
const snap=async name=>page.screenshot({path:path.join(out,name+'.png')});
let pages=await page.evaluate(()=>PAGES.map(p=>({id:p.id,type:p.type})));
check('31个场景',pages.length===31);
for(let i=0;i<pages.length;i++){
 const p=pages[i];await jump(p.id);
 check(p.id+' 非空页面',(await page.locator('#page').innerText()).trim().length>20);
 check(p.id+' 按钮未越过页脚',await page.evaluate(()=>[...document.querySelectorAll('#page button,#page input')].filter(e=>!e.closest('.lab-content,.solution,.stem-box')).every(e=>{let r=e.getBoundingClientRect();return r.bottom<=823&&r.top>=80})));
 await snap(`${String(i+1).padStart(2,'0')}-${p.id}`);
 if(p.type==='question'){
  check(p.id+' 题干完整可见',await page.locator('.stem-box').evaluate(e=>e.scrollHeight<=e.clientHeight+1));
  await page.locator('.question-actions .primary').click();
  check(p.id+' 空答案提示',(await page.locator('#answerFeedback').innerText()).includes('每一空'));
  const answers=await page.evaluate(()=>getQ().fields.map(f=>f[1]));
  for(let k=0;k<answers.length;k++)await page.locator('#ans-'+k).fill('0');
  await page.locator('.question-actions .primary').click();
  check(p.id+' 错答提示',await page.locator('.answer-field input.incorrect').count()===answers.length);
  for(let k=0;k<answers.length;k++)await page.locator('#ans-'+k).fill(String(answers[k]));
  await page.locator('.question-actions .primary').click();
  check(p.id+' 正答逐空核对',await page.locator('.answer-field input.correct').count()===answers.length);
  check(p.id+' 点亮题组',await page.evaluate(()=>states[getQ().id].done));
  await page.getByRole('button',{name:'想一想',exact:true}).click();
  check(p.id+' 提示可打开',await page.locator('#solution').innerText().then(s=>s.includes('思考提示')));
  const count=await page.evaluate(()=>getQ().steps.length+1);
  for(let k=0;k<count;k++)await page.evaluate(()=>nextStep());
  check(p.id+' 全部解析与小结',await page.locator('#solution .summary').count()===1);
  await page.evaluate(()=>$('solution').scrollTop=0);
  await snap(`${String(i+1).padStart(2,'0')}-${p.id}-solution-top`);
  await page.evaluate(()=>$('solution').scrollTop=$('solution').scrollHeight);
  await snap(`${String(i+1).padStart(2,'0')}-${p.id}-solution-end`);
  await page.evaluate(()=>showAnswers());await page.evaluate(()=>checkAnswer());
  check(p.id+' 参考答案不伪报自主完成',await page.locator('#answerFeedback').innerText().then(s=>s.includes('参考答案')));
  await page.evaluate(()=>resetQuestion());
  check(p.id+' 重练清空作答',await page.locator('.answer-field input').evaluateAll(es=>es.every(e=>e.value==='')));
 }
}
// 数学符号：上取数，下总数；位置几何独立测量。
await jump('notation');
check('P的取数在总数上方',await page.locator('.math').first().evaluate(e=>{let a=e.querySelector('.math-top').getBoundingClientRect(),b=e.querySelector('.math-bottom').getBoundingClientRect();return a.bottom<=b.top&&e.querySelector('.math-top').textContent==='2'&&e.querySelector('.math-bottom').textContent==='4'}));
await page.getByLabel('第1个连乘数',{exact:true}).fill('4');await page.getByLabel('第2个连乘数',{exact:true}).fill('3');
await page.getByRole('button',{name:'核对连乘',exact:true}).click();check('连乘自主填写正确',await page.locator('.lab-feedback').innerText().then(s=>s.includes('正确')));
await page.getByLabel('实验总数',{exact:true}).selectOption('1');await page.getByLabel('实验取数',{exact:true}).selectOption('1');await page.getByLabel('第1个连乘数',{exact:true}).fill('1');await page.evaluate(()=>act('calcCheck'));check('排列边界1取1',await page.locator('.lab-feedback').innerText().then(s=>s.includes('1种排列')));
await page.getByLabel('实验计数类型',{exact:true}).selectOption('C');await page.evaluate(()=>act('demo'));await page.evaluate(()=>act('demo'));check('组合边界1选1',await page.locator('.calc-explain').innerText().then(s=>s.includes('1')));
// 龙晶去重、反序、重置、预测和教师示例隔离。
await jump('gems3');await page.evaluate(()=>gemReset());await page.getByRole('button',{name:'火晶',exact:true}).click();await page.getByRole('button',{name:'冰晶',exact:true}).click();check('龙晶发现',await page.evaluate(()=>gemState().found.length===1));await page.evaluate(()=>gemNew());await page.evaluate(()=>{pickGem(0);pickGem(1)});check('龙晶重复不增加',await page.evaluate(()=>gemState().found.length===1));await page.evaluate(()=>gemNew());await page.evaluate(()=>{pickGem(1);pickGem(0)});check('龙晶反序为新排列',await page.evaluate(()=>gemState().found.length===2));await page.evaluate(()=>gemDemo());check('教师示例不计自主发现',await page.evaluate(()=>gemState().found.length===2&&gemState().teacher===1));await page.evaluate(()=>{for(const a of allPairs(3)){gemNew();pickGem(a[0]);pickGem(a[1])}});check('三晶6种全部自主记录',await page.evaluate(()=>gemState().found.length===6));
await jump('gems4');await page.getByLabel('四晶预测总数').fill('12');await page.getByRole('button',{name:'核对预测',exact:true}).click();check('四晶预测12',await page.evaluate(()=>gemState().predicted));
// 实际鼠标拖放：小朋友拖到椅子；占位冲突、撤销与重置。
await jump('p-ex2');await page.locator('.tokens .token').nth(0).dragTo(page.locator('.seat').nth(2));check('真实拖放坐椅子',await page.evaluate(()=>simState().positions[2]===0));await page.evaluate(()=>{act('person',1);act('seat',2)});check('座位不可重占',await page.evaluate(()=>simState().positions[2]===0));await page.evaluate(()=>{act('person',1);act('seat',0);act('person',2);act('seat',5);act('check')});check('座位方案记录',await page.evaluate(()=>simState().found.length===1));await page.evaluate(()=>act('undo'));check('撤销记录',await page.evaluate(()=>simState().found.length===0));await page.evaluate(()=>act('reset'));check('座位重置',await page.evaluate(()=>simState().positions.every(x=>x===null)));
await jump('p-fuwa');await page.evaluate(()=>act('check'));check('不相邻被拒绝',await page.evaluate(()=>simState().found.length===0));await page.getByRole('button',{name:'捆成一组',exact:true}).click();check('实际捆绑为整体',await page.evaluate(()=>simState().line.some(a=>a.join(',')==='0,4')));await page.locator('.arrange-line .bundle').dragTo(page.locator('.arrange-line .token').last());check('真实拖动整体保留成员',await page.evaluate(()=>simState().line.at(-1).length===2));await page.getByRole('button',{name:'交换组内顺序',exact:true}).click();await page.getByRole('button',{name:'检查并记录',exact:true}).click();check('组内交换有效方案',await page.evaluate(()=>simState().found.length===1));await snap('interaction-bundle');
await jump('p-ex6');await page.evaluate(()=>{act('special',0);act('gap',0);act('special',1);act('gap',6);act('special',2);act('gap',3);act('check')});check('插空两端都可放',await page.evaluate(()=>simState().spaces[0]===0&&simState().spaces[6]===1&&simState().found.length===1));await page.evaluate(()=>act('inner'));check('女生组内可改顺序',await page.evaluate(()=>simState().inner[0]==='女队2'));await snap('interaction-insertion');
// 课程/刀枪限制，组合反序去重。
await jump('courses');await page.evaluate(()=>{act('select',0);act('select',1);act('select',2);act('check')});check('课程冲突不能记录',await page.evaluate(()=>simState().found.length===0));await page.evaluate(()=>{act('select',1);act('select',3);act('check')});check('课程改错可记录',await page.evaluate(()=>simState().found.length===1));await snap('interaction-courses');
await jump('weapons');await page.evaluate(()=>{act('select',0);act('select',2);act('select',3);act('check')});check('刀枪只选一个被拒绝',await page.evaluate(()=>simState().found.length===0));await page.evaluate(()=>{act('select',0);act('select',4);act('check')});check('刀枪都不选有效',await page.evaluate(()=>simState().found.length===1));await page.evaluate(()=>{act('clearPick');act('select',0);act('select',1);act('select',2);act('check')});check('刀枪都选有效',await page.evaluate(()=>simState().found.length===2));
await jump('combination');await page.evaluate(()=>{act('modeC');act('select',0);act('select',1);act('check');act('clearPick');act('select',1);act('select',0);act('check')});check('组合反序去重',await page.evaluate(()=>simState().found.length===1));await page.evaluate(()=>{act('modeP');act('select',0);act('select',1);act('check');act('clearPick');act('select',1);act('select',0);act('check')});check('排列反序两种',await page.evaluate(()=>simState().found.length===2));
await jump('football');await page.evaluate(()=>{act('select',0);act('select',1);act('check');act('clearPick');act('select',1);act('select',0);act('check')});check('主客场区分顺序',await page.evaluate(()=>simState().found.length===2));await page.evaluate(()=>{act('modeC');act('select',0);act('select',1);act('check');act('clearPick');act('select',1);act('select',0);act('check')});check('单循环不重复',await page.evaluate(()=>simState().found.length===1));
// 巧克力512种分段、数位和256种分段：逐个实际生成并核对总和。
for(const [id,n,total] of [['chocolate',10,512],['digitsum',9,256]]){await jump(id);let result=await page.evaluate(({n,total})=>{let s=simState();for(let m=0;m<total;m++){s.cuts=Array.from({length:n-1},(_,i)=>!!(m&(1<<i)));let groups=cutGroups(s.cuts,n);if(groups.reduce((a,b)=>a+b,0)!==n||groups.some(x=>x<1))return false;checkSim(sceneConfig(),s)}renderLab();return s.found.length===total},{n,total});check(id+' 所有分段穷举',result);await snap('interaction-'+id)}
await jump('challenge7');await page.evaluate(()=>act('demo'));check('挑战教师方案真实满足全部条件',await page.evaluate(()=>arrangementValidity(sceneConfig(),simState().line.flat())===''));await page.evaluate(()=>{act('check')});check('挑战方案记录',await page.evaluate(()=>simState().found.length===1));await page.evaluate(()=>{states[getQ().id].step=99;refreshSolution()});check('原解析错空数明确更正960',await page.locator('#solution').innerText().then(s=>s.includes('576')&&s.includes('960')));
await jump('lines');await page.evaluate(()=>{act('point',0);act('point',1);act('point',2);act('check')});check('共线点不能成三角形',await page.evaluate(()=>simState().found.length===0));await page.evaluate(()=>{act('point',2);act('point',6);act('check')});check('不同线点可成三角形',await page.evaluate(()=>simState().found.length===1));await snap('interaction-triangle');
await jump('oddeven');await page.evaluate(()=>{act('digit',0);act('digit',1);act('digit',2);act('digit',3);act('check');act('reverse');act('check')});check('奇偶两两数字排列',await page.evaluate(()=>simState().found.length===2));await snap('interaction-digits');
// 每个组件预设均走到教师演示终点，检查真实可用而非空弹窗。
for(const p of pages){if(!['question','method','notation','combination'].includes(p.type))continue;await jump(p.id);const t=await page.evaluate(()=>sceneConfig().type);if(['calc','arrange','gaps'].includes(t)){await page.evaluate(()=>{for(let i=0;i<12;i++)act('demo')});check(p.id+' 教师演示终点有内容',(await page.locator('#labContent').innerText()).length>60)}}
// 进度刷新保留，目录、搜索、键盘和工具。
await page.reload();check('刷新保留18题组进度',await page.evaluate(()=>QUESTIONS.every(q=>states[q.id].done)));
await page.getByRole('button',{name:'☷ 目录',exact:true}).click();check('目录实际打开',await page.locator('#menu').isVisible());await page.getByLabel('搜索目录').fill('三角形');check('目录搜索',await page.locator('.menu-card').count()===1);await page.getByRole('button',{name:'返回课件 ×',exact:true}).first().click();
await page.mouse.click(10,85);await page.keyboard.press('ArrowRight');check('键盘下一页',await page.evaluate(()=>index===1));await page.keyboard.press('Home');check('Home回封面',await page.evaluate(()=>index===0));
await page.getByRole('button',{name:'使用帮助',exact:true}).click();check('帮助有完整操作说明',(await page.locator('#help').innerText()).includes('拖动'));await page.keyboard.press('Escape');check('Esc关浮层',!(await page.locator('#help').isVisible()));
await page.getByRole('button',{name:'画笔',exact:true}).click();await page.mouse.move(600,400);await page.mouse.down();await page.mouse.move(700,420,{steps:10});await page.mouse.up();await page.getByRole('button',{name:'完成',exact:true}).click();const drawn=await page.evaluate(()=>ctx.getImageData(650,410,1,1).data[3]>0);check('画笔实际绘制',drawn);await page.evaluate(()=>go(1));await page.evaluate(()=>go(0));await page.waitForTimeout(80);check('画笔翻页保留',await page.evaluate(()=>ctx.getImageData(650,410,1,1).data[3]>0));await page.getByRole('button',{name:'画笔',exact:true}).click();await page.getByRole('button',{name:'清空本页',exact:true}).click();check('画笔清空',await page.evaluate(()=>ctx.getImageData(650,410,1,1).data[3]===0));await page.evaluate(()=>setPen(false));
await page.getByRole('button',{name:'计时',exact:true}).click();await page.waitForTimeout(1500);check('计时器真实倒计时',await page.evaluate(()=>timerRunning&&timerLeft<480));await page.getByRole('button',{name:'暂停',exact:true}).click();check('计时暂停',await page.evaluate(()=>!timerRunning));
page.once('dialog',async d=>await d.accept('3'));await page.getByRole('button',{name:'计时设置',exact:true}).click();check('计时可设置3分钟',await page.evaluate(()=>timerDuration===180&&timerLeft===180));await page.evaluate(()=>{timerLeft=20;timerPaint()});await page.getByRole('button',{name:'重置计时',exact:true}).click();check('计时重置到设定时长',await page.evaluate(()=>timerLeft===180&&!timerRunning));
await page.getByRole('button',{name:'全屏',exact:true}).click();check('全屏按钮进入',await page.evaluate(()=>!!document.fullscreenElement));if(await page.evaluate(()=>!!document.fullscreenElement))await page.evaluate(()=>document.exitFullscreen());
await jump('final');await snap('final-complete');await page.getByRole('button',{name:'清空练习记录',exact:true}).click();await page.getByRole('button',{name:'保留记录',exact:true}).click();check('记录清空可取消',await page.evaluate(()=>QUESTIONS.every(q=>states[q.id].done)));
await page.getByRole('button',{name:'清空练习记录',exact:true}).click();await page.getByRole('button',{name:'确认清空',exact:true}).click();check('确认清空本课记录',await page.evaluate(()=>QUESTIONS.every(q=>!states[q.id].done)));
// 真正断网打开单文件，检查图片与交互；纵向手机布局。
const offline=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce',offline:true});const op=await offline.newPage();await op.goto('file://'+path.join(root,'output/龙王子_顺序之门_互动完整版.html'));check('完全离线单文件启动',await op.locator('#page h1').count()===1);await op.evaluate(()=>go(PAGES.findIndex(p=>p.id==='story0')));check('离线原插画可解码',await op.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0));await op.evaluate(()=>go(PAGES.findIndex(p=>p.id==='p-ex2')));await op.locator('.tokens .token').first().click();await op.locator('.seat').first().click();check('离线交互真实可操作',await op.evaluate(()=>simState().positions[0]===0));await op.screenshot({path:path.join(out,'offline-1366.png')});
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const mp=await mobile.newPage();await mp.goto('http://127.0.0.1:8765');for(const id of ['cover','p-ex1','p-ex6','football','chocolate']){await mp.evaluate(id=>go(PAGES.findIndex(p=>p.id===id)),id);check(id+' 手机无横向溢出',await mp.evaluate(()=>document.documentElement.scrollWidth<=391));await mp.screenshot({path:path.join(out,'mobile-'+id+'.png'),fullPage:true})}
for(const {id} of pages){await mp.evaluate(id=>go(PAGES.findIndex(p=>p.id===id)),id);check(id+' 手机页面宽度约束',await mp.evaluate(()=>document.documentElement.scrollWidth<=391));}
check('无浏览器脚本错误',errors.length===0,errors);
const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'docs/index.html'))).digest('hex');
const report={status:checks.every(c=>c.pass)?'PASS':'FAIL',checks,passed:checks.filter(c=>c.pass).length,total:checks.length,errors,artifact_sha256:hash,screenshots:fs.readdirSync(out).filter(p=>p.endsWith('.png')).length};fs.writeFileSync(path.join(root,'qa/ui-report.json'),JSON.stringify(report,null,2));console.log(report.status,report.passed+'/'+report.total,report.screenshots+' screenshots');
await browser.close();process.exit(report.status==='PASS'?0:1);
