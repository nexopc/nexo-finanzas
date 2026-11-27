const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic=(n,st='')=>`<svg class="i" ${st?`style="${st}"`:''}><use href="#${n}"/></svg>`;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const pad2=n=>String(n).padStart(2,'0');
const ymd=d=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const today=()=>ymd(new Date());
const addDays=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return ymd(d)};
const DOW=['dom','lun','mar','mié','jue','vie','sáb'],MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],MESL=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const fdate=s=>{const d=pd(s);return `${DOW[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}`};
const thou=n=>String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const money=n=>(n<0?'− ':'')+'$ '+thou(n);
const moneyS=n=>{const a=Math.abs(n);if(a>=1e6)return (n<0?'− ':'')+'$ '+(a/1e6).toFixed(a>=1e8?0:1).replace('.',',')+' M';return money(n)};
const grams=g=>(Math.round(g*100)/100).toFixed(2).replace('.',',')+' g';
const num=s=>{s=String(s??'').trim().replace(/[^\d.,-]/g,'');if(!s)return 0;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');return parseFloat(s)||0};
const intv=s=>parseInt(String(s??'').replace(/\D/g,''))||0;
const initials=n=>String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const digits=s=>String(s||'').replace(/\D/g,'');

/* Festivos de Colombia (Ley Emiliani) */
const holCache={};
function holidays(y){
  if(holCache[y])return holCache[y];
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  const em=Math.floor((h+l-7*m+114)/31),ed=((h+l-7*m+114)%31)+1;const easter=new Date(y,em-1,ed);
  const set=new Set();const add=d=>set.add(ymd(d));
  const fixed=[[0,1],[4,1],[6,20],[7,7],[11,8],[11,25]];fixed.forEach(([mo,da])=>add(new Date(y,mo,da)));
  const mon=d=>{const x=new Date(d);while(x.getDay()!==1)x.setDate(x.getDate()+1);return x};
  [[0,6],[2,19],[5,29],[7,15],[9,12],[10,1],[10,11]].forEach(([mo,da])=>add(mon(new Date(y,mo,da))));
  const ea=n=>{const x=new Date(easter);x.setDate(x.getDate()+n);return x};
  add(ea(-3));add(ea(-2));add(ea(43));add(ea(64));add(ea(71));
  return holCache[y]=set;
}
const isHoliday=s=>holidays(+s.slice(0,4)).has(s);
const isOff=s=>pd(s).getDay()===0||isHoliday(s);
