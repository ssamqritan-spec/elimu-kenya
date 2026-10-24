// Fill in from Supabase > Project Settings > API. The anon key is safe in the browser: tables are locked by RLS.
window.ELIMU={url:'',key:''};
window.FEES={1:300,2:250,3:200,4:150,5:100};
window.AMOUNTS={1:20000,2:16250,3:12500,4:8750,5:5000};
window.PAY_TO='0732532860';
window.money=n=>'KSh '+Number(n).toLocaleString('en-KE');
window.rpc=async(fn,body)=>{const c=window.ELIMU;if(!c.url)return null;const h={'Content-Type':'application/json',apikey:c.key};if(String(c.key).startsWith('eyJ'))h.Authorization='Bearer '+c.key;const r=await fetch(c.url.replace(/\/+$/,'')+'/rest/v1/rpc/'+fn,{method:'POST',headers:h,body:JSON.stringify(body)});const t=await r.text();if(!r.ok)throw new Error(t);return t?JSON.parse(t):null;};
