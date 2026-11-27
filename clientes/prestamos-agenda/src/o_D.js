function makeDates(first,frec,n,mode){
  if(mode===true)mode='todos';if(!mode)mode='sinfest';
  const out=[];const okDay=s=>mode==='todos'||(mode==='sindom'?pd(s).getDay()!==0:!isOff(s));
  const step=s=>frec==='Diario'?addDays(s,1):frec==='Semanal'?addDays(s,7):frec==='Quincenal'?addDays(s,15):(()=>{const x=pd(s);const day=pd(first).getDate();const nx=new Date(x.getFullYear(),x.getMonth()+1,1);const last=new Date(nx.getFullYear(),nx.getMonth()+1,0).getDate();nx.setDate(Math.min(day,last));return ymd(nx)})();
  let base=first;
  while(out.length<n){let f=base;if(frec==='Diario'){while(!okDay(f))f=addDays(f,1);out.push(f);base=addDays(f,1)}
    else{while(!okDay(f))f=addDays(f,1);out.push(f);base=step(base)}}
  return out;
}
function firstDue(frec){const t=today();return frec==='Diario'?addDays(t,1):frec==='Semanal'?addDays(t,7):frec==='Quincenal'?addDays(t,15):(()=>{const d=pd(t);d.setMonth(d.getMonth()+1);return ymd(d)})()}

/* =============== bloqueo =============== */
let pinBuf='';
const b64=buf=>btoa(String.fromCharCode(...new Uint8Array(buf)));
const ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const faceOK=()=>!!(window.PublicKeyCredential&&location.protocol==='https:');
async function faceRegister(){
  try{const cr=await navigator.credentials.create({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rp:{name:(cfg()||{}).nombre||'Oro'},
      user:{id:crypto.getRandomValues(new Uint8Array(16)),name:meName(),displayName:meName()},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],
      authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'preferred'},timeout:60000}});
    S.me.face=b64(cr.rawId);persist();toast('Face ID activado');render()}catch(e){toast('No se pudo activar Face ID en este navegador')}
}
async function faceCheck(){
  try{await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{type:'public-key',id:ub64(S.me.face)}],userVerification:'required',timeout:60000}});unlock()}catch(e){S.me.lockMode='pin';render()}
}
function unlock(){S.me.unlocked=true;S.me.unlocks=(S.me.unlocks||0)+1;S.me.lockMode=null;pinBuf='';persist();render()}
function renderLock(){
  const c=cfg()||{};const usePin=!S.me.face||!faceOK()||S.me.lockMode==='pin';
  let h=`<div class="lock"><span class="appi xl">${logoSvg()}</span><div class="mid">${esc(c.nombre||'')}</div><div class="sub">Hola, ${esc(meName())}</div>`;
  if(!usePin){h+=`<button data-a="faceid" style="margin:34px 0 10px;width:92px;height:92px;border:3px solid var(--gold2);border-radius:28px;display:grid;place-items:center;color:var(--gold2)" aria-label="Entrar con Face ID">${ic('face','width:50px;height:50px;stroke-width:1.8')}</button><div class="sub">Toca para entrar con Face ID</div><button data-a="usepin" class="sub" style="margin-top:22px;color:var(--gold2);min-height:44px">Usar PIN</button>`}
  else{h+=`<div class="dots" id="dots">${[0,1,2,3].map(i=>`<i class="${i<pinBuf.length?'f':''}"></i>`).join('')}</div><div class="pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-a="pin" data-v="${n}">${n}</button>`).join('')}<span></span><button data-a="pin" data-v="0">0</button><button data-a="pin" data-v="x" aria-label="Borrar" style="font-size:1.1em">⌫</button></div>`;
    if(S.me.face&&faceOK())h+=`<button data-a="useface" class="sub" style="margin-top:18px;color:var(--gold2);min-height:44px">Usar Face ID</button>`}
  return h+`</div>`;
}
function needsLock(){return S.me.pin&&!S.me.unlocked&&cfg()}
function chooseLockMode(){S.me.lockMode=(S.me.face&&faceOK()&&((S.me.unlocks||0)%5!==4))?'face':'pin'}
