'use strict';
const $=s=>document.querySelector(s),form=$('#application'),labels=['Studies and funding','Personal details','Review and submit'];let step=0;
function data(){const f=[...form.querySelectorAll('fieldset')];f.forEach(x=>x.disabled=false);const d=Object.fromEntries(new FormData(form));f.forEach((x,i)=>x.disabled=i!==step);return d}
function inst(d){return String(d.institution||'').trim()}
const PH={'University':'Type a university name','TVET college':'Type a TVET college name','Polytechnic':'Type a polytechnic name'};
const norm=s=>String(s).toLowerCase().replace(/[\u2018\u2019`]/g,"'").replace(/\s+/g,' ').trim();
function toggleType(){const t=$('#instType').value,n=$('#instName');$('#instBlock').hidden=!t;n.disabled=!t;n.required=!!t;n.placeholder=PH[t]||''}
function filterI(){const t=$('#instType').value,all=(window.INSTITUTIONS||{})[t]||[],cur=norm($('#instName').value),q=cur.split(' ').filter(Boolean),box=$('#instList');box.replaceChildren();let c=0;
if(t)all.forEach(name=>{const k=norm(name);if(!q.every(w=>k.includes(w)))return;c++;const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.textContent=name;b.setAttribute('aria-pressed',String(k===cur));b.onclick=()=>pick(name);li.append(b);box.append(li)});
box.hidden=!t||!c;$('#instCount').textContent=!t?'':c?c+(c===1?' institution shown.':' institutions shown.'):'Not listed? Keep typing your institution name.'}
function pick(name){const n=$('#instName');n.value=name;filterI();n.blur()}
function render(){form.querySelectorAll('fieldset').forEach((f,i)=>{f.hidden=i!==step;f.disabled=i!==step});$('#stepLabel').textContent=`0${step+1} / ${labels[step]}`;$('#stepNumber').textContent=`STEP ${step+1} OF 3`;$('#progressBar').style.width=((step+1)/3*100)+'%';$('#back').hidden=step===0;$('#continue').textContent=step===2?'Submit application':'Continue →';$('#formStatus').textContent='';
if(step===2){const d=data(),r=$('#review');r.replaceChildren();[['Name',d.student],['Phone',d.phone],['Email',d.email],['Institution',inst(d)+' ('+d.instType+')'],['Course / year',d.course+' / '+d.year],['HELB / HEF support',d.helb],['Funding band','Band '+d.band],['Home county',d.county],['Parent / guardian',d.guardian+' ('+d.relationship+')'],['Circumstances',d.condition]].forEach(([k,v])=>{const a=document.createElement('dt'),b=document.createElement('dd');a.textContent=k;b.textContent=v;r.append(a,b)});
$('#feeHead').textContent='Proposed bursary award: '+money(AMOUNTS[d.band])+' (Band '+d.band+')';$('#feeText').textContent='';}}
$('#continue').onclick=async()=>{if(!form.reportValidity())return;if(step<2){step++;render();window.scrollTo({top:0,behavior:'smooth'});return}
const d=data(),btn=$('#continue');btn.disabled=true;btn.textContent='Submitting…';
try{const p={...d,institution:inst(d)};delete p.consent;
const res=await rpc('submit_application',{p});const out=res||{ref:'EK-'+Date.now().toString(36).toUpperCase(),amount:AMOUNTS[d.band],fee:FEES[d.band]};
sessionStorage.setItem('elimu-app',JSON.stringify({ref:out.ref,amount:out.amount,fee:out.fee,name:d.student,phone:d.phone}));location.href='pay.html'}
catch(e){console.error(e);$('#formStatus').textContent='We could not submit your application. Check your connection and try again.';btn.disabled=false;btn.textContent='Submit application'}};
$('#back').onclick=()=>{step--;render()};form.onsubmit=e=>{e.preventDefault();$('#continue').click()};
$('#instType').onchange=()=>{$('#instName').value='';toggleType();filterI()};$('#instName').oninput=filterI;$('#instName').onfocus=e=>{const t=e.target;if(t.value&&$('#instList').querySelectorAll('button').length===1)setTimeout(()=>t.select(),0)};toggleType();filterI();render();