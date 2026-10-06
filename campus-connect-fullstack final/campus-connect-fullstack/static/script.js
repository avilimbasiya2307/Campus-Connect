/* ---------- API layer: talks to the Flask backend (app.py) ---------- */
async function call(url,opt={}){
  const r=await fetch(url,{headers:{'Content-Type':'application/json'},credentials:'same-origin',...opt});
  let d=null;try{d=await r.json()}catch{}
  if(!r.ok)throw Error((d&&d.error)||'Something went wrong');
  return d;
}
const send=(u,b)=>call(u,{method:'POST',body:JSON.stringify(b||{})});
const real={
  me:()=>call('/api/me'),
  signup:(name,email,password)=>send('/api/signup',{name,email,password}),
  login:(email,password)=>send('/api/login',{email,password}),
  logout:()=>send('/api/logout'),
  list:({cat,q,page,size,open,sort,mine})=>call(`/api/posts?cat=${encodeURIComponent(cat)}&q=${encodeURIComponent(q||'')}&page=${page}&size=${size}&open=${open?1:0}&sort=${sort||'new'}${mine?'&mine=1':''}`),
  stats:()=>call('/api/stats'),
  create:p=>send('/api/posts',p),
  patch:(id,action)=>send(`/api/posts/${id}/${action}`),
  remove:id=>call(`/api/posts/${id}`,{method:'DELETE'})
};


/* ---------- Local fallback: same API in browser storage, so the site also works without the Python server (static hosting / preview) ---------- */
const IMG=Object.fromEntries(['fest','hackathon','textbook','lamp','exam','openmic','bicycle','library'].map(k=>[k,'static/img/'+k+'.jpg']));
const FALL={fest:['🎉','#0ea5e9'],hackathon:['💻','#0ea5e9'],textbook:['📘','#db2777'],lamp:['💡','#db2777'],exam:['📝','#dc2626'],openmic:['🎤','#0ea5e9'],bicycle:['🚲','#db2777'],library:['📚','#dc2626']};
const art=(c1,c2,inner)=>`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380' viewBox='0 0 600 380'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='600' height='380' fill='url(#g)'/>${inner}</svg>`;
const wheel=(x,y)=>`<circle cx='${x}' cy='${y}' r='70' fill='none' stroke='#1d1d1f' stroke-width='9'/><circle cx='${x}' cy='${y}' r='60' fill='none' stroke='#9aa0a6' stroke-width='2'/><g stroke='#b5bac0' stroke-width='1.2'>${[0,45,90,135].map(a=>{const r=a*Math.PI/180,dx=Math.cos(r)*60,dy=Math.sin(r)*60;return `<line x1='${x-dx}' y1='${y-dy}' x2='${x+dx}' y2='${y+dy}'/>`}).join('')}</g><circle cx='${x}' cy='${y}' r='7' fill='#555'/>`;
const ART={
 bicycle:art('#cfe6ff','#f1f7ff',`<rect y='300' width='600' height='80' fill='#8d96a0'/><ellipse cx='300' cy='332' rx='190' ry='11' fill='#000' opacity='.18'/>${wheel(190,262)}${wheel(410,262)}<path d='M190 262L270 262L245 172L372 178L270 262M190 262L245 172M372 178L410 262' stroke='#d62828' stroke-width='8' stroke-linecap='round' stroke-linejoin='round' fill='none'/><path d='M222 160h52' stroke='#222' stroke-width='12' stroke-linecap='round'/><path d='M372 178L380 150L402 144' stroke='#222' stroke-width='7' stroke-linecap='round' fill='none'/><circle cx='270' cy='262' r='16' fill='#444'/><path d='M270 262L288 288' stroke='#222' stroke-width='6'/><rect x='282' y='286' width='22' height='7' rx='3' fill='#222'/>`),
 textbook:art('#f7ead6','#e9cfa6',`<rect y='285' width='600' height='95' fill='#a8703a'/><rect y='285' width='600' height='6' fill='#8a5a2d'/><ellipse cx='300' cy='292' rx='230' ry='10' fill='#000' opacity='.15'/><rect x='120' y='236' width='330' height='46' rx='3' fill='#1f4e8c'/><rect x='140' y='244' width='306' height='30' fill='#f6f1e4'/><rect x='140' y='196' width='300' height='40' rx='3' fill='#c0392b'/><rect x='158' y='203' width='278' height='26' fill='#f6f1e4'/><rect x='210' y='156' width='170' height='40' rx='3' fill='#2e7d5b'/><rect x='234' y='170' width='110' height='8' rx='2' fill='#f6f1e4' opacity='.8'/><rect x='470' y='80' width='110' height='204' rx='4' fill='#3558c4'/><rect x='470' y='80' width='14' height='204' fill='#27439a'/><rect x='494' y='110' width='74' height='46' rx='3' fill='#f6f1e4'/><text x='531' y='140' font-family='Arial' font-size='19' font-weight='700' fill='#27439a' text-anchor='middle'>MATHS</text><text x='531' y='225' font-family='Arial' font-size='52' fill='#fff' text-anchor='middle'>∑</text>`),
 lamp:art('#1b2640','#33436b',`<rect y='296' width='600' height='84' fill='#5e4129'/><polygon points='326,168 404,170 470,296 230,296' fill='#ffd770' opacity='.28'/><ellipse cx='300' cy='296' rx='64' ry='11' fill='#2b2b2e'/><path d='M300 292L262 210L336 142' stroke='#3b3b40' stroke-width='9' stroke-linecap='round' stroke-linejoin='round' fill='none'/><polygon points='300,118 388,124 404,170 326,168' fill='#f2b01e'/><ellipse cx='365' cy='169' rx='38' ry='7' fill='#fff6c9'/><rect x='300' y='268' width='130' height='26' rx='3' fill='#efe7d6'/><rect x='300' y='268' width='130' height='5' fill='#d6ccb6'/><circle cx='110' cy='80' r='3' fill='#fff' opacity='.7'/><circle cx='520' cy='60' r='2.5' fill='#fff' opacity='.7'/>`),
 fest:art('#2a1768','#d63a7a',`<g opacity='.22' fill='#fff'><polygon points='80,0 130,0 330,300 150,300'/><polygon points='520,0 470,0 270,300 450,300'/></g><path d='M0 50Q300 110 600 50' stroke='#fff' stroke-width='2' fill='none'/>${Array.from({length:12},(_,i)=>{const x=25+i*50,y=50+Math.sin(i/11*Math.PI)*30;return `<polygon points='${x-14},${y} ${x+14},${y} ${x},${y+30}' fill='${['#ffd23f','#3bceac','#ee6352','#59cd90'][i%4]}'/>`}).join('')}<rect x='130' y='215' width='340' height='14' fill='#1a1040'/>${Array.from({length:14},(_,i)=>{const x=22+i*43,y=330+(i%3)*10;return `<path d='M${x} ${y-40}L${x-6} ${y-80}M${x+12} ${y-40}L${x+20} ${y-84}' stroke='#0b0820' stroke-width='5' stroke-linecap='round'/><circle cx='${x+6}' cy='${y-48}' r='17' fill='#0b0820'/><rect x='${x-14}' y='${y-34}' width='40' height='70' rx='14' fill='#0b0820'/>`}).join('')}${Array.from({length:30},(_,i)=>`<circle cx='${(i*97)%600}' cy='${70+(i*53)%170}' r='3' fill='${['#ffd23f','#3bceac','#fff','#ff9ff3'][i%4]}'/>`).join('')}`),
 hackathon:art('#0f2027','#2c5364',`<rect y='300' width='600' height='80' fill='#1b2a33'/><rect x='150' y='128' width='230' height='150' rx='9' fill='#c9ced4'/><rect x='158' y='136' width='214' height='132' rx='4' fill='#0b1117'/>${Array.from({length:9},(_,i)=>`<rect x='${172+(i%3)*14}' y='${148+i*13}' width='${50+(i*37)%110}' height='6' rx='3' fill='${['#4ade80','#60a5fa','#f472b6','#facc15'][i%4]}'/>`).join('')}<polygon points='126,278 404,278 430,298 100,298' fill='#aeb4bb'/><rect x='408' y='170' width='130' height='90' rx='7' fill='#c9ced4'/><rect x='414' y='176' width='118' height='76' rx='3' fill='#101820'/>${Array.from({length:5},(_,i)=>`<rect x='${424+(i%2)*10}' y='${186+i*12}' width='${40+(i*29)%60}' height='5' rx='2' fill='${['#60a5fa','#4ade80','#facc15'][i%3]}'/>`).join('')}<polygon points='396,260 550,260 566,276 380,276' fill='#aeb4bb'/><rect x='60' y='246' width='44' height='46' rx='6' fill='#f3efe6'/><path d='M104 258q22 0 22 18q0 16-22 16' stroke='#f3efe6' stroke-width='6' fill='none'/><rect x='64' y='250' width='36' height='8' fill='#6b4226'/>`),
 openmic:art('#14101f','#4a1d2f',`<polygon points='300,0 190,330 410,330' fill='#ffe29a' opacity='.22'/><rect width='90' height='380' fill='#7a1020'/><rect x='510' width='90' height='380' fill='#7a1020'/><g stroke='#5d0c18' stroke-width='3'>${[18,40,62,84].map(x=>`<line x1='${x}' y1='0' x2='${x}' y2='380'/><line x1='${600-x}' y1='0' x2='${600-x}' y2='380'/>`).join('')}</g><rect y='322' width='600' height='58' fill='#3a261b'/><ellipse cx='300' cy='326' rx='120' ry='14' fill='#ffe29a' opacity='.25'/><path d='M300 140V318' stroke='#999' stroke-width='7'/><ellipse cx='300' cy='322' rx='42' ry='8' fill='#222'/><circle cx='300' cy='104' r='27' fill='#b9bdc2'/><g stroke='#7b8087' stroke-width='2'>${[-16,-8,0,8,16].map(d=>`<line x1='${300+d}' y1='86' x2='${300+d}' y2='122'/>`).join('')}</g><rect x='286' y='128' width='28' height='34' rx='6' fill='#2b2b30'/>`),
 exam:art('#e8eef6','#c8d4e6',`<circle cx='505' cy='85' r='48' fill='#fff' stroke='#37474f' stroke-width='6'/><path d='M505 85V55M505 85L525 98' stroke='#37474f' stroke-width='5' stroke-linecap='round'/><rect y='262' width='600' height='118' fill='#c4a174'/><rect y='262' width='600' height='8' fill='#a98457'/><g transform='rotate(-4 280 200)'><rect x='170' y='120' width='220' height='150' rx='3' fill='#fff' stroke='#cfd6df'/><text x='200' y='154' font-family='Arial' font-size='22' font-weight='700' fill='#27439a'>EXAM</text>${Array.from({length:6},(_,i)=>`<rect x='200' y='${170+i*15}' width='${150-(i%3)*30}' height='5' rx='2' fill='#c7cfdb'/>`).join('')}<circle cx='362' cy='150' r='14' fill='none' stroke='#2e7d5b' stroke-width='4'/></g><g transform='rotate(-18 420 250)'><rect x='330' y='244' width='150' height='10' rx='3' fill='#f2c230'/><polygon points='330,244 306,249 330,254' fill='#f3d9b1'/><polygon points='312,247 306,249 312,251' fill='#333'/><rect x='470' y='244' width='14' height='10' fill='#ee6352'/></g>`),
 library:art('#f2e6d3','#d9c09a',`<rect x='50' y='30' width='500' height='330' rx='6' fill='#6a4a2e'/>${[0,1,2].map(r=>{const y=52+r*100;let x=70,s='',i=0;while(x<525){const w=14+(i*7)%16,h=58+(i*13+r*17)%32;s+=`<rect x='${x}' y='${y+84-h}' width='${w}' height='${h}' rx='2' fill='${['#b03a2e','#2874a6','#1e8449','#b7950b','#6c3483','#d35400','#117a65'][(i+r*2)%7]}'/>`;x+=w+2;i++}return `<rect x='62' y='${y}' width='476' height='86' fill='#3e2b1a'/>${s}<rect x='62' y='${y+84}' width='476' height='8' fill='#8a6238'/>`}).join('')}`)
};
const phImg=src=>{const k=String(src).split('/').pop().replace('.jpg',''),[e,col]=FALL[k]||['📌','#4f6df5'];return 'data:image/svg+xml,'+encodeURIComponent(ART[k]||`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380'><rect width='100%' height='100%' fill='${col}'/><text x='50%' y='55%' font-size='120' text-anchor='middle' dominant-baseline='middle'>${e}</text></svg>`)};
const S={m:{},get(k,d){if(k in S.m)return S.m[k];try{const v=JSON.parse(localStorage.getItem('cc_'+k));if(v!==null)return S.m[k]=v}catch{}return S.m[k]=d},set(k,v){S.m[k]=v;try{localStorage.setItem('cc_'+k,JSON.stringify(v))}catch{}}};
let local=false;
const need=()=>{const u=S.get('uid',null);if(!u)throw Error('Please log in');return u};
function seedLocal(){
  const n=Date.now(),m=60000,day=k=>new Date(n+k*864e5).toISOString().slice(0,10);
  const ph=(e,k)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='320'><rect width='100%' height='100%' fill='${k}'/><text x='50%' y='55%' font-size='120' text-anchor='middle' dominant-baseline='middle'>${e}</text></svg>`);
  const mk=(id,t,d,c,mins,o={})=>({id,t,d,c,ts:n-mins*m,by:o.by||1,name:o.name||'Demo Student',ups:[],done:false,img:o.img||null,menu:o.menu||null,extra:o.extra||null});
  const us=S.get('users',[]);
  if(!us.length)us.push({id:1,name:'Demo Student',email:'demo@campus.edu',pw:btoa('demo1234'),role:'student'});
  if(!us.some(u=>u.role==='admin'))us.push({id:2,name:'Campus Admin',email:'admin@campus.edu',pw:btoa('admin1234'),role:'admin'});
  S.set('users',us);
  const ps=S.get('posts',[]);
  if(!ps.length)ps.push(mk(1,'Black AirPods case found','Found near the library entrance. Pick up at the front desk.','Lost and Found',12,{img:ph('🎧','#4f6df5')}),
    mk(2,'Library Room 204 is free','Seats 6, whiteboard available until 6 PM.','Study Rooms',35,{img:ph('📚','#7c5cf5')}),
    mk(3,'Free pizza at Student Union','Robotics Club info session, 5:30 PM. Come hungry!','Free Food',60,{img:ph('🍕','#e8590c'),menu:{items:['Margherita pizza','Garlic bread','Cold drinks'],diet:'Veg'}}),
    mk(4,'Dorm B water shutdown','Maintenance tomorrow 10 AM to 1 PM. Plan ahead.','Notices',180));
  if(!ps.some(p=>['Events','Marketplace','Announcements'].includes(p.c)))ps.push(
    mk(11,'Welcome Week Fest','Music, stalls and games for all new students.','Events',20,{img:IMG.fest,extra:{date:day(3),time:'17:00',location:'Main Lawn'}}),
    mk(12,'Hackathon kickoff','24-hour build sprint. Teams of up to 4.','Events',50,{img:IMG.hackathon,extra:{date:day(7),time:'10:00',location:'CS Building, Lab 2'}}),
    mk(13,'Engineering Maths textbook','Lightly used, no highlights.','Marketplace',90,{img:IMG.textbook,extra:{price:350,contact:'demo@campus.edu'}}),
    mk(14,'Study desk lamp','LED, 3 brightness levels, works perfectly.','Marketplace',120,{img:IMG.lamp,extra:{price:499,contact:'demo@campus.edu'}}),
    mk(16,'Open Mic Night','Sing, play or just watch. Sign up at the door.','Events',10,{img:IMG.openmic,extra:{date:day(5),time:'18:30',location:'Student Union Cafe'}}),
    mk(17,'Cycle in good condition','Geared cycle, 1 year old. Helmet included.','Marketplace',30,{img:IMG.bicycle,extra:{price:2500,contact:'demo@campus.edu'}}),
    mk(18,'Library open till 11 PM','Extended timings during exam season, starting Monday.','Announcements',2,{by:2,name:'Campus Admin',img:IMG.library}),
    mk(15,'Mid-semester exams start soon','Timetable is on the student portal. Carry your ID card.','Announcements',5,{by:2,name:'Campus Admin',img:IMG.exam}));
  const mapId={11:'fest',12:'hackathon',13:'textbook',14:'lamp',15:'exam',16:'openmic',17:'bicycle',18:'library'};
  ps.forEach(p=>{if(mapId[p.id])p.img=IMG[mapId[p.id]]});
  S.set('posts',ps);
}
const pub=u=>({id:u.id,name:u.name,email:u.email,role:u.role||'student'});
const loc={
  async me(){const id=S.get('uid',null);const u=S.get('users',[]).find(x=>x.id===id);return u?pub(u):null},
  async signup(name,email,pw){email=email.toLowerCase();const us=S.get('users',[]);
    if(us.some(u=>u.email===email))throw Error('Email already registered');
    if(pw.length<6)throw Error('Password must be at least 6 characters');
    const u={id:Date.now(),name,email,pw:btoa(pw)};us.push(u);S.set('users',us);S.set('uid',u.id);return pub(u)},
  async login(email,pw){const u=S.get('users',[]).find(x=>x.email===email.toLowerCase()&&x.pw===btoa(pw));
    if(!u)throw Error('Wrong email or password');S.set('uid',u.id);return pub(u)},
  async logout(){S.set('uid',null)},
  async list({cat,q,page,size,open,sort,mine}){q=(q||'').toLowerCase();const uid=S.get('uid',null);
    if(mine&&!uid)throw Error('Please log in');const today=new Date().toISOString().slice(0,10);
    const all=S.get('posts',[]).filter(p=>(cat==='All'||p.c===cat)&&(!q||(p.t+p.d+(p.menu?p.menu.items.join(' '):'')+(p.extra?JSON.stringify(p.extra):'')).toLowerCase().includes(q))&&!(open&&p.done)&&(!mine||p.by===uid)&&(sort!=='event'||(p.extra&&p.extra.date>=today)));
    all.sort(sort==='event'?(a,b)=>(a.extra.date+a.extra.time).localeCompare(b.extra.date+b.extra.time):sort==='pin'?(a,b)=>((b.c==='Announcements')-(a.c==='Announcements'))||b.ts-a.ts:(a,b)=>b.ts-a.ts);
    return{items:all.slice(0,page*size),total:all.length}},
  async stats(){const p=S.get('posts',[]);return{posts:p.length,users:S.get('users',[]).length,res:p.filter(x=>x.done).length}},
  async create(p){const uid=need(),u=S.get('users',[]).find(x=>x.id===uid),ps=S.get('posts',[]);if(p.c==='Announcements'&&u.role!=='admin')throw Error('Only admins can post announcements');
    ps.unshift({id:Date.now(),t:p.t,d:p.d,c:p.c,img:p.img||null,menu:p.menu||null,extra:p.extra||null,ts:Date.now(),by:uid,name:u.name,ups:[],done:false});S.set('posts',ps)},
  async patch(id,a){const uid=need(),ps=S.get('posts',[]),p=ps.find(x=>x.id==id);if(!p)return;
    if(a==='up'){const i=p.ups.indexOf(uid);i<0?p.ups.push(uid):p.ups.splice(i,1)}
    else{if(p.by!==uid)throw Error('Only the author can do that');p.done=!p.done}S.set('posts',ps)},
  async remove(id){const uid=need();S.set('posts',S.get('posts',[]).filter(p=>!(p.id==id&&p.by===uid)))}
};
const api=new Proxy({},{get:(_,k)=>(...a)=>(local?loc:real)[k](...a)});

/* ---------- UI ---------- */
const $=id=>document.getElementById(id);
const CATS=['All','Lost and Found','Study Rooms','Free Food','Notices','Events','Marketplace','Announcements'],CUR='₹';
const ICONS={'Lost and Found':'🔍','Study Rooms':'📚','Free Food':'🍕','Notices':'📢','Events':'🎉','Marketplace':'🛍️','Announcements':'📣'};
const esc=s=>s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let me=null,cat='All',q='',page=1,SIZE=6,mode='login';
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2200)}
function ago(ts){const s=Math.floor((Date.now()-ts)/1000);if(s<60)return'Just now';const m=Math.floor(s/60);if(m<60)return m+' min ago';const h=Math.floor(m/60);return h<24?h+' hr ago':new Date(ts).toLocaleDateString()}
function renderAuth(){syncForms();loginSec();
  $('auth').innerHTML=me?`<div class="user"><a href="#prof" class="user" title="My profile"><div class="av">${esc(me.name[0].toUpperCase())}</div><span class="uname">${esc(me.name)}</span></a><button class="ghost" id="out">Log out</button></div>`:`<button class="btn sm" id="in">Log in</button>`;
  if(me)$('out').onclick=()=>{api.logout();me=null;renderAuth();render();toast('Logged out')};
  else $('in').onclick=()=>openModal('login');
}
function openModal(m){setMode(m);$('modal').classList.add('open');$('err').textContent='';setTimeout(()=>$((m==='signup')?'an':'ae').focus(),50)}
function closeModal(){$('modal').classList.remove('open');$('lb').classList.remove('open')}
function setMode(m){mode=m;document.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===m));$('nameL').hidden=m!=='signup';$('an').required=m==='signup';$('asub').textContent=m==='signup'?'Create account':'Log in'}
const fmtDate=(d,t)=>{const x=new Date(d+'T'+(t||'00:00'));return x.toLocaleDateString([],{weekday:'short',day:'numeric',month:'short'})+(t?' · '+x.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'')};
function card(p){
  const x=p.extra||{},pin=p.c==='Announcements',sold=p.c==='Marketplace';
  return `<article class="post c${CATS.indexOf(p.c)} ${p.done?'done':''} ${pin?'official':''}">
    <span class="badge">${pin?'📌 Official · ':''}${ICONS[p.c]} ${p.c}${p.done?(sold?' · Sold':' · Resolved'):''}</span>${p.img?`<img class="thumb" loading="lazy" src="${esc(p.img)}" onerror="this.onerror=null;this.src=phImg(this.getAttribute('src'))" alt="Photo for ${esc(p.t)}">`:''}
    <h4>${esc(p.t)}</h4>${x.price!=null?`<div class="price">${CUR}${Number(x.price).toLocaleString()}</div>`:''}
    ${x.date?`<div class="ev"><div>📅 ${fmtDate(x.date,x.time)}</div><div>📍 ${esc(x.location||'')}</div></div>`:''}
    <p>${esc(p.d)}</p>${x.contact?`<div class="ct">📞 ${esc(x.contact)}</div>`:''}
    ${p.menu?`<div class="fmenu"><div class="mh">🍽️ Menu <span class="dt">${DIET[p.menu.diet]||''}</span></div><div class="chips">${p.menu.items.map(i=>`<span class="chip">${esc(i)}</span>`).join('')}</div></div>`:''}
    <div class="meta">${esc(p.name)} · 🕒 ${ago(p.ts)}</div>
    <div class="acts"><button data-a="up" data-id="${p.id}" class="${me&&p.ups.includes(me.id)?'on':''}">👍 Helpful ${p.ups.length||''}</button>
    ${me&&me.id===p.by?`<button data-a="done" data-id="${p.id}">${p.done?'Reopen':(sold?'Mark sold':'Mark resolved')}</button><button data-a="del" data-id="${p.id}">Delete</button>`:''}</div></article>`;
}
async function render(quiet){
  $('tabs').innerHTML=CATS.map(c=>`<button class="tab ${c===cat?'on':''}" data-f="${c}">${c}</button>`).join('');
  if(!quiet)$('feed').innerHTML='<div class="sk"></div><div class="sk"></div><div class="sk"></div>';
  const sort=cat==='Events'?'event':(cat==='All'||cat==='Announcements')?'pin':'new';
  let r;try{r=await api.list({cat,q,page,size:SIZE,open:hideDone,sort})}catch{if(!quiet)$('feed').innerHTML='<div class="empty">Could not load updates. <button class="ghost" onclick="render()">Retry</button></div>';return}
  $('feed').classList.toggle('quiet',!!quiet);const {items,total}=r;
  $('feed').innerHTML=items.length?items.map(card).join(''):`<div class="empty">${q?'No matches.':cat==='Events'?'No upcoming events yet. Post one!':'Nothing here yet. Be the first to post!'}</div>`;
  $('more').hidden=items.length>=total;
  const s=await api.stats();$('sPosts').textContent=s.posts;$('sUsers').textContent=s.users;$('sRes').textContent=s.res;
  loadSide();
}
async function loadSide(){
  try{
    const an=await api.list({cat:'Announcements',page:1,size:3,sort:'new'});
    $('announcements').hidden=!an.items.length;$('ann').innerHTML=an.items.map(card).join('');
    const ev=await api.list({cat:'Events',page:1,size:6,sort:'event'});
    $('evGrid').innerHTML=ev.items.length?ev.items.map(card).join(''):'<div class="empty">No upcoming events yet. Post one!</div>';
    const mk=await api.list({cat:'Marketplace',page:1,size:6,sort:'new'});
    $('mkGrid').innerHTML=mk.items.length?mk.items.map(card).join(''):'<div class="empty">Nothing for sale yet. List an item!</div>';
    const ac=await api.list({cat:'All',page:1,size:8,sort:'new'});
    $('act').innerHTML=ac.items.map(p=>`<li><span class="dot c${CATS.indexOf(p.c)}"></span><div><b>${esc(p.name)}</b> posted in ${ICONS[p.c]} ${p.c}: ${esc(p.t)}<small>${ago(p.ts)}</small></div></li>`).join('');
    $('prof').hidden=!me;
    if(me){const mine=await api.list({cat:'All',page:1,size:50,sort:'new',mine:true}),L=mine.items;
      $('pav').textContent=me.name[0].toUpperCase();$('pname').textContent=me.name;$('pmail').textContent=me.email+' · '+(me.role==='admin'?'Admin':'Student');
      $('pc').textContent=mine.total;$('ph2').textContent=L.reduce((s,p)=>s+p.ups.length,0);$('pr').textContent=L.filter(p=>p.done).length;
      $('myposts').innerHTML=L.length?L.map(card).join(''):'<div class="empty">You have not posted yet. Share something above!</div>'}
  }catch{}
}
function setCat(c){cat=c;page=1;render()}
$('tabs').onclick=e=>{if(e.target.dataset.f)setCat(e.target.dataset.f)};
document.querySelectorAll('.card').forEach(c=>c.onclick=()=>{if(c.dataset.go)return $(c.dataset.go).scrollIntoView();setCat(c.dataset.cat);$('updates').scrollIntoView()});
document.querySelectorAll('.menu a').forEach(a=>a.onclick=()=>{if(a.dataset.cat)setCat(a.dataset.cat);$('menu').classList.remove('open')});
$('loginLink').onclick=e=>{e.preventDefault();me?toast('You are already logged in'):openModal('login')};
$('burger').onclick=()=>$('menu').classList.toggle('open');
$('more').onclick=()=>{page++;render()};
let qt;$('q').oninput=e=>{clearTimeout(qt);qt=setTimeout(()=>{q=e.target.value.trim();page=1;render()},250)};
$('theme').onclick=()=>{const r=document.documentElement,d=getComputedStyle(r).getPropertyValue('--bg').trim()==='#0e1320';r.dataset.theme=d?'light':'dark';S.set('theme',r.dataset.theme)};
const th=S.get('theme',null);if(th)document.documentElement.dataset.theme=th;
document.addEventListener('click',async e=>{
  const b=e.target.closest('button[data-a]');if(!b)return;
  if(!me)return openModal('login');
  const id=b.dataset.id,a=b.dataset.a;
  if(a==='up')await api.patch(id,'up');
  if(a==='done'){await api.patch(id,'done');toast('Status updated')}
  if(a==='del'&&confirm('Delete this post?')){await api.remove(id);toast('Post deleted')}
  render();
});
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
$('af').onsubmit=async e=>{
  e.preventDefault();$('err').textContent='';$('asub').disabled=true;
  try{
    me=mode==='signup'?await api.signup($('an').value.trim(),$('ae').value,$('ap').value):await api.login($('ae').value,$('ap').value);
    closeModal();renderAuth();render();toast('Welcome, '+me.name+'!');e.target.reset();
  }catch(x){$('err').textContent=x.message}
  $('asub').disabled=false;
};
$('modal').onclick=e=>{if(e.target===$('modal'))closeModal()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
setInterval(()=>{if(!$('modal').classList.contains('open'))render(true)},30000);
let hideDone=false;
const DIET={'Veg':'🟢 Veg','Non-veg':'🔴 Non-veg','Veg & non-veg':'🟢🔴 Veg & non-veg'};
async function shrink(file){
  const url=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(file)});
  const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url});
  const k=Math.min(1,800/Math.max(im.width,im.height)),cv=document.createElement('canvas');
  cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
  return cv.toDataURL('image/jpeg',.72);
}
document.addEventListener('click',e=>{if(e.target.classList.contains('thumb')){$('lbi').src=e.target.src;$('lb').classList.add('open')}});
$('lb').onclick=()=>$('lb').classList.remove('open');
$('hd').onchange=e=>{hideDone=e.target.checked;page=1;render()};
$('fab').onclick=()=>{$('post').scrollIntoView();setTimeout(()=>$('L-t').focus({preventScroll:true}),400)};
const FORMS=[
 {p:'L',el:'fLost',c:'Lost and Found',name:'🔍 Lost and Found',tip:'Report something you lost or found.',tm:70,ph:['e.g. Blue water bottle','Colour, brand, where it was found or lost, how to claim it.'],photo:'Add photo',ptip:'A clear photo helps the owner recognise it.',btn:'Post to Lost and Found',
  extra:`<label>Type<select id="L-k"><option>Found</option><option>Lost</option></select></label>`,
  build:()=>({t:$('L-k').value+': '+$('L-t').value.trim()})},
 {p:'F',el:'fFood',c:'Free Food',name:'🍕 Free Food Menu',tip:'Share where the food is and what is on the menu.',ph:['e.g. Free pizza at Student Union','Where, when, and who is hosting?'],photo:'Add food photo',ptip:'Optional: helps people find the spot.',btn:'Post Free Food Menu',
  extra:`<label>Menu items (comma or new line)<input id="F-m" required maxlength="300" placeholder="Pizza, Garlic bread, Cold drinks"></label><label>Food type<select id="F-x"><option>Veg</option><option>Non-veg</option><option>Veg &amp; non-veg</option></select></label>`,
  build:()=>{const items=$('F-m').value.split(/[,\n]/).map(s=>s.trim().slice(0,40)).filter(Boolean).slice(0,12);
    if(!items.length){toast('Add at least one menu item');return null}
    return{t:$('F-t').value.trim(),menu:{items,diet:$('F-x').value}}}}
];
FORMS.push(
 {p:'E',el:'fEvent',c:'Events',name:'🎉 Post a Campus Event',tip:'Events appear sorted by upcoming date.',ph:['e.g. Welcome Week Fest','What is it about? Who can join?'],photo:'Add poster',ptip:'Optional: event poster.',btn:'Post Event',
  extra:`<div class="r2"><label>Date<input id="E-dt" type="date" required></label><label>Time<input id="E-tm" type="time" required></label></div><label>Location<input id="E-lc" required maxlength="60" placeholder="e.g. Auditorium, Block A"></label>`,
  build:()=>({t:$('E-t').value.trim(),extra:{date:$('E-dt').value,time:$('E-tm').value,location:$('E-lc').value.trim()}})},
 {p:'M',el:'fMarket',c:'Marketplace',name:'🛍️ Sell an Item',tip:'Add a price and how buyers can reach you.',tl:'Item name',ph:['e.g. Engineering Maths textbook','Condition, age, why you are selling.'],photo:'Add item photo',ptip:'Photos help items sell faster.',btn:'List Item',
  extra:`<div class="r2"><label>Price (${CUR})<input id="M-pr" type="number" min="0" step="1" required></label><label>Contact info<input id="M-ct" required maxlength="60" placeholder="Phone or email"></label></div>`,
  build:()=>({t:$('M-t').value.trim(),extra:{price:Number($('M-pr').value),contact:$('M-ct').value.trim()}})},
 {p:'A',el:'fAnn',c:'Announcements',name:'📣 Official Announcement',tip:'Admins only. Shown on top of every feed with an Official badge.',ph:['e.g. Library closed on Friday','Details of the official update.'],photo:'Add image',ptip:'Optional.',btn:'Publish Announcement',extra:'',
  build:()=>({t:$('A-t').value.trim()})}
);
FORMS.forEach(f=>{
  {const bx=document.createElement('div');bx.className='box';bx.id=f.el;bx.hidden=f.p!=='L';$('forms').appendChild(bx)}
  const p=f.p,g=s=>$(p+'-'+s);let photo=null;
  $(f.el).innerHTML=`<h3 class="fh">${f.name}</h3><p class="hint">${f.tip}</p><form id="${p}-F">
    <label>${f.tl||'Title'}<input id="${p}-t" required maxlength="${f.tm||80}" placeholder="${f.ph[0]}"></label>${f.extra}
    <label>Description<textarea id="${p}-d" required maxlength="300" placeholder="${f.ph[1]}"></textarea></label>
    <div class="photo"><input type="file" id="${p}-i" accept="image/*" hidden><button type="button" class="ghost" id="${p}-p">📷 ${f.photo}</button><span class="hint">${f.ptip}</span>
      <div class="pv" id="${p}-v" hidden><img id="${p}-vi" alt="Photo preview"><button type="button" class="ghost" id="${p}-r" aria-label="Remove photo">✕</button></div></div>
    <div><button class="btn" type="submit">${f.btn}</button></div></form>`;
  const clear=()=>{photo=null;g('v').hidden=true;g('vi').removeAttribute('src')};
  g('p').onclick=()=>g('i').click();g('r').onclick=clear;
  g('i').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;
    if(!file.type.startsWith('image/'))return toast('Please choose an image file');
    try{photo=await shrink(file);g('vi').src=photo;g('v').hidden=false}catch{toast('Could not read that image')}};
  g('F').onsubmit=async e=>{e.preventDefault();
    if(!me){toast('Please log in to post');return openModal('login')}
    const x=f.build();if(!x)return;
    try{await api.create({t:x.t,d:g('d').value.trim(),c:f.c,img:photo,menu:x.menu||null,extra:x.extra||null})}catch(err){return toast(err.message)}
    e.target.reset();clear();cat=f.c;page=1;await render();toast('Posted!');$('updates').scrollIntoView()};
});
const TABS={L:'🔍 Lost & Found',F:'🍕 Free Food',E:'🎉 Event',M:'🛍️ Sell item',A:'📣 Announcement'};
let curForm='L';
function syncForms(){const adm=me&&me.role==='admin';if(curForm==='A'&&!adm)curForm='L';
  $('ptabs').innerHTML=FORMS.filter(f=>f.p!=='A'||adm).map(f=>`<button class="tab ${f.p===curForm?'on':''}" data-p="${f.p}">${TABS[f.p]}</button>`).join('');
  FORMS.forEach(f=>$(f.el).hidden=f.p!==curForm)}
$('ptabs').onclick=e=>{const b=e.target.closest('[data-p]');if(b){curForm=b.dataset.p;syncForms()}};
$('E-dt').min=new Date().toISOString().slice(0,10);syncForms();
function loginSec(){
  $('lgTxt').textContent=me?`You are logged in as ${me.name} (${me.role==='admin'?'Admin':'Student'}).`:'Log in to post updates, vote and manage your posts. Or try a demo account in one tap.';
  $('lgBtns').innerHTML=me?`<a class="btn sm" href="#prof">My profile</a><button class="ghost" id="lgOut">Log out</button>`:`<button class="btn sm" id="lgIn">Log in</button><button class="ghost" id="lgUp">Sign up</button><button class="ghost" data-q="demo@campus.edu|demo1234">Demo student</button><button class="ghost" data-q="admin@campus.edu|admin1234">Demo admin</button>`;
}
$('lgBtns').onclick=async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.id==='lgIn')openModal('login');else if(b.id==='lgUp')openModal('signup');else if(b.id==='lgOut')$('out').click();
  else if(b.dataset.q){const[x,y]=b.dataset.q.split('|');try{me=await api.login(x,y);renderAuth();render();toast('Welcome, '+me.name+'!')}catch(err){toast(err.message)}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-open],[data-view]');if(!b)return;
  if(b.dataset.open){curForm=b.dataset.open;syncForms();$('post').scrollIntoView()}else{setCat(b.dataset.view);$('updates').scrollIntoView()}});
real.me().catch(()=>{local=true;seedLocal();return loc.me()}).then(u=>{me=u;renderAuth();render()});
