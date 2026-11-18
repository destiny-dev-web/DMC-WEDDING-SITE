(()=>{
const API=(window.DMC_API||'').replace(/\/$/,''),tok=()=>sessionStorage.getItem('dmc_tok');
async function api(p,o={}){const h=Object.assign({},o.headers);if(tok())h.Authorization='Bearer '+tok();let r;
 try{r=await fetch(API+p,Object.assign({},o,{headers:h}))}catch(e){throw Object.assign(new Error('Network error. Check your connection.'),{code:'unavailable'})}
 const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'Request failed'),{code:r.status});return j}
const js=(m,b)=>({method:m,headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
const snap=(id,j)=>({id,exists:!!j.exists,data:()=>j.data,metadata:{}});
function poll(fn,next,err,ms=5000){let last='',dead=false;const run=async()=>{if(dead)return;try{const j=await fn(),s=JSON.stringify(j);if(s!==last){last=s;next(j)}}catch(e){if(err)err(e)}};run();const t=setInterval(run,ms);return()=>{dead=true;clearInterval(t)}}
const DB={doc(path){const id=path.split('/').pop();return{id,path,get:async()=>snap(id,await api('/api/doc/'+path)),set:d=>api('/api/doc/'+path,js('PUT',d)).then(()=>{}),delete:()=>api('/api/doc/'+path,{method:'DELETE'}).then(()=>{}),onSnapshot:(n,e)=>poll(()=>api('/api/doc/'+path),j=>n(snap(id,j)),e)}},
 collection(name){return{add:async d=>{if(name==='pays'){const j=await api('/api/pay/init',js('POST',d));location.href=j.url;return{}}throw new Error('Unsupported')},doc:id=>DB.doc(name+'/'+id),
  onSnapshot:(n,e)=>poll(()=>tok()?api('/api/col/'+name):Promise.reject(new Error('auth')),j=>n({docs:j.docs.map(d=>({id:d.id,exists:true,data:()=>d.data})),size:j.docs.length}),e)}}};
const AS={upload:async f=>{const r=await api('/api/upload',{method:'POST',headers:{'Content-Type':f.type||'image/jpeg'},body:f});return{id:r.id,url:API+r.url}}};
window.claude={use:async n=>n==='db'?DB:n==='assets'?AS:null};
window.DMC={login:async(u,p)=>{const j=await api('/api/login',js('POST',{username:u,password:p}));sessionStorage.setItem('dmc_tok',j.token)}};
})();
