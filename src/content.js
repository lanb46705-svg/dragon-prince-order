const COMICS = [
 {id:'story0',type:'comic',art:0,title:'序幕 · 王国的危机',chapter:'龙晶试炼',lines:['少年：“光之门正在熄灭！”','长老：“找到所有不同的龙晶顺序，才能恢复能量。”','星鳞：“这一次，我们不只要排顺序，还要学会选伙伴、找空位！”']},
 {id:'story1',type:'comic',art:1,title:'同样龙晶，不同魔法',chapter:'龙晶试炼',lines:['先放火晶，再放冰晶，门后燃起温暖的火光。','交换先后，冰霜通道出现了。','星鳞：“东西没有变，只是顺序变了！来亲自试试吧。”']},
 {id:'story2',type:'comic',art:2,title:'第二道封印',chapter:'龙晶试炼',lines:['星鳞：“门后竟然还有一道封印！”','少年：“这次有四块龙晶，仍然只有两个槽位。”','星鳞：“先预测，再动手。你能用分类记录做到不重不漏吗？”']},
 {id:'story3',type:'comic',art:3,title:'王宫里的六把椅子',chapter:'排列',lines:['三位客人来到王宫，眼前摆着六把不同的椅子。','少年：“龙晶有先后，座位也会带来不同安排吗？”','星鳞：“先替第一位客人选一把，再想第二位、第三位。”']},
 {id:'story4',type:'comic',art:4,title:'不能分开的双龙',chapter:'捆绑与插空',lines:['两条幼龙一分开，结界的能量就散了。','星鳞：“我们紧靠在一起，光圈就能恢复！”','少年：“先把它们看成一组，再安排组内顺序。”']}
];
const PAGES = [
 {id:'cover',type:'cover',title:'龙王子：顺序之门',chapter:'冒险起点'},COMICS[0],COMICS[1],
 {id:'gems3',type:'gems',n:3,title:'三晶解锁游戏',chapter:'龙晶试炼'},
 {id:'notation',type:'notation',title:'认识上下排布的 P',chapter:'龙晶试炼'},COMICS[2],
 {id:'gems4',type:'gems',n:4,title:'四晶预测挑战',chapter:'龙晶试炼'}
];
for(const q of QUESTIONS){
 if(q.id==='p-ex2')PAGES.push(COMICS[3]);
 if(q.id==='p-ex4')PAGES.push(COMICS[4],{id:'binding',type:'method',mode:'bind',title:'捆绑：外部与内部',chapter:'捆绑与插空'});
 if(q.id==='p-ex6')PAGES.push({id:'insertion',type:'method',mode:'gap',title:'插空：两端也有位置',chapter:'捆绑与插空'});
 if(q.id==='c-ex1')PAGES.push({id:'combination',type:'combination',title:'顺序不重要的时候',chapter:'组合'});
 PAGES.push({id:q.id,type:'question',title:q.title,chapter:q.chapter,q});
}
PAGES.push({id:'final',type:'final',title:'点亮顺序之门',chapter:'冒险终章'});

