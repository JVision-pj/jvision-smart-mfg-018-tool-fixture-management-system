const config=window.APP_CONFIG;
const qs=s=>document.querySelector(s),qsa=s=>document.querySelectorAll(s);
const original={title:config.title,subtitle:qs('.subtitle').textContent,kpiLabels:[...qsa('.kpi small')].map(x=>x.textContent),kpiValues:[...qsa('.kpi strong')].map(x=>x.textContent),rows:config.rows};
const views=[
 {name:'總覽儀表板',suffix:'',subtitle:original.subtitle,kpis:original.kpiLabels,values:original.kpiValues,mult:1,table:'即時作業清單',hint:'關鍵工作與狀態追蹤'},
 {name:'即時監控',suffix:'即時監控',subtitle:'即時接收現場訊號、設備狀態與營運事件',kpis:['即時訊號','運行中','待確認','資料延遲'],values:['1,284','96.8%','6','1.2s'],mult:1.06,table:'即時事件串流',hint:'最近 30 分鐘狀態更新'},
 {name:'作業管理',suffix:'作業管理',subtitle:'集中管理任務、負責人、優先順序與處理進度',kpis:['進行中','今日完成','即將逾期','完成率'],values:['24','38','5','92.6%'],mult:.94,table:'待辦作業佇列',hint:'依優先程度排序的工作項目'},
 {name:'分析報表',suffix:'分析報表',subtitle:'比較績效趨勢、目標差異與改善效益',kpis:['本期績效','較上期','目標差距','改善效益'],values:['94.2%','+4.8%','-1.6%','NT$ 680K'],mult:1.1,table:'績效分析明細',hint:'本期指標與基準比較'},
 {name:'異常中心',suffix:'異常中心',subtitle:'彙整風險、異常事件與改善處置狀態',kpis:['未結異常','高風險','平均回應','結案率'],values:['12','4','6.8m','91.4%'],mult:.86,table:'異常處置清單',hint:'需關注事件與改善進度'},
 {name:'系統設定',suffix:'系統設定',subtitle:'管理資料來源、通知規則與系統整合狀態',kpis:['資料來源','連線正常','同步排程','系統健康度'],values:['18','17','6','99.8%'],mult:1.02,table:'整合與同步狀態',hint:'系統連線及資料更新設定'},
];
let activeView=0;
function drawChart(mult=1){const data=config.chart.map((v,i)=>Math.round(v*mult+(activeView?Math.sin(i+activeView)*3:0))),w=720,h=210,p=28,max=Math.max(...data)+8,min=Math.min(...data)-8,pts=data.map((v,i)=>[p+i*(w-p*2)/(data.length-1),h-p-(v-min)/(max-min)*(h-p*2)]),d=pts.map((x,i)=>(i?'L':'M')+x.join(',')).join(' ');qs('#chartLine').setAttribute('d',d);qs('#chartArea').setAttribute('d',d+' L '+pts.at(-1)[0]+','+(h-p)+' L '+pts[0][0]+','+(h-p)+' Z');qs('#points').innerHTML=pts.map(x=>'<circle class="point" cx="'+x[0]+'" cy="'+x[1]+'" r="4"/>').join('');qs('#labels').innerHTML=config.labels.map((x,i)=>'<text class="axis-label" x="'+pts[i][0]+'" y="205" text-anchor="middle">'+x+'</text>').join('')}
function statusClass(v){return /高風險|立即|緊急|逾期|異常/.test(v)?'risk':/注意|待|檢驗|調查/.test(v)?'warn':''}
function viewRows(){if(activeView===5)return [['ERP / MES','API','正常','已連線'],['IoT Gateway','MQTT','正常','已連線'],['通知服務','Webhook','6 條規則','啟用'],['資料倉儲','Batch','每日 02:00','已排程']];if(activeView===4)return original.rows.map((r,i)=>[r[0],['設備異常','交期風險','資料偏離','流程逾期'][i%4],['剛剛','8 分前','21 分前','45 分前'][i%4],i===3?'高風險':i===1?'注意':'處理中']);return original.rows}
function renderRows(filter=''){const rows=viewRows().filter(r=>r.join(' ').toLowerCase().includes(filter.toLowerCase()));qs('#rows').innerHTML=rows.map(r=>'<tr>'+r.map((v,i)=>'<td>'+(i===r.length-1?'<span class="status '+statusClass(v)+'">'+v+'</span>':v)+'</td>').join('')+'</tr>').join('')}
function renderView(index){activeView=index;const v=views[index];qsa('.nav button').forEach((b,i)=>b.classList.toggle('active',i===index));qs('.topbar h1').textContent=v.suffix?original.title+' · '+v.suffix:original.title;qs('.subtitle').textContent=v.subtitle;qs('.eyebrow').textContent=v.name.toUpperCase()+' · LIVE OPERATIONS';qsa('.kpi').forEach((card,i)=>{card.querySelector('small').textContent=v.kpis[i];card.querySelector('strong').textContent=v.values[i]});const heads=qsa('.panel-head h2');if(heads[0])heads[0].textContent=index===3?'績效趨勢分析':index===4?'異常發生趨勢':index===5?'資料同步趨勢':'營運趨勢';if(heads[2])heads[2].textContent=v.table;const hints=qsa('.panel-head span');if(hints[2])hints[2].textContent=v.hint;qs('#search').value='';drawChart(v.mult);renderRows();showToast('已切換至「'+v.name+'」')}
qsa('.nav button').forEach((b,i)=>b.onclick=()=>renderView(i));
qs('#refresh').onclick=()=>{drawChart(views[activeView].mult*(.96+Math.random()*.1));showToast('即時資料已更新')};
qs('#range').onchange=e=>{const factor=e.target.value==='today'?.92:e.target.value==='month'?1.04:1;drawChart(views[activeView].mult*factor);showToast('已切換分析期間')};
qs('#search').oninput=e=>renderRows(e.target.value);
qsa('.alert button').forEach(b=>b.onclick=()=>b.closest('.alert').remove());
qs('#export').onclick=()=>showToast('報表已加入匯出佇列');
function showToast(t){const x=qs('#toast');x.textContent=t;x.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>x.classList.remove('show'),2200)}
renderView(0);