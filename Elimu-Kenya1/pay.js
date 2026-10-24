'use strict';
const $=s=>document.querySelector(s),A=JSON.parse(sessionStorage.getItem('elimu-app')||'null');
function note(t){$('#noteList').insertAdjacentHTML('afterbegin','<li>'+t+'</li>');$('#notesEmpty').hidden=true;$('#dot').hidden=false}
$('#bell').onclick=()=>{const o=$('#notes').hidden;$('#notes').hidden=!o;$('#bell').setAttribute('aria-expanded',String(o));$('#dot').hidden=true};
const configured=Boolean(window.ELIMU?.url&&window.ELIMU?.key);
const PAY_TO=window.PAY_TO||'0732532860';
const PAY_TO_VARIANTS=[PAY_TO,'+254'+PAY_TO.slice(1),'254'+PAY_TO.slice(1),PAY_TO.slice(1)];

function paidToUs(msg){
 const flat=String(msg||'').replace(/[\s\-()]/g,'').toLowerCase();
 return PAY_TO_VARIANTS.some(v=>flat.includes(String(v).replace(/[\s\-()]/g,'').toLowerCase()));
}
function niceName(){const n=A?.name?.trim();return n?n.split(/\s+/)[0]:'Applicant'}

const copyBtn=$('#copyNum');
if(copyBtn){
 copyBtn.onclick=async()=>{
  const num=(window.PAY_TO||'0732532860');
  try{
   if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(num)}
   else{const t=document.createElement('textarea');t.value=num;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}
   copyBtn.textContent='Copied ✓';copyBtn.classList.add('copied');
   setTimeout(()=>{copyBtn.textContent='Copy number';copyBtn.classList.remove('copied')},2000);
  }catch(e){copyBtn.textContent='Copy failed';setTimeout(()=>copyBtn.textContent='Copy number',2000)}
 };
}

if(!A){$('#noApp').hidden=false}else{$('#payView').hidden=false;$('#sRef').textContent=A.ref;$('#sAmt').textContent=money(A.amount);$('#sFee').textContent=money(A.fee);$('#stAmt').textContent=money(A.fee);$('#payPhone').value=A.phone||'';
if(sessionStorage.getItem('elimu-wait')===A.ref)wait()}
document.querySelectorAll('.method').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.method').forEach(x=>{x.classList.remove('sel');x.setAttribute('aria-pressed','false')});
 b.classList.add('sel');b.setAttribute('aria-pressed','true');$('#toast').hidden=true;
 if(b.dataset.ready!=='1'){
 const name=A?.name?.trim()||'Applicant';
 $('#methodMessage').textContent=name+', '+b.querySelector('b').textContent+' is not yet available in your region. Please use M-Pesa Send money instead.';
 b.insertAdjacentElement('afterend',$('#toast'));$('#toast').hidden=false;
 }
});
if(A&&!configured){
 $('#payBtn').disabled=true;$('#payBtn').textContent='Verify payment';
}
$('#toastX').onclick=()=>$('#toast').hidden=true;
$('#payForm').onsubmit=async e=>{e.preventDefault();if(!A)return;const btn=$('#payBtn');
const msg=$('#smsMessage').value||'';
if(!paidToUs(msg)){
 $('#payStatus').textContent=niceName()+', the payment seems to not have gone through, kindly recheck the payment and try again.';
 return;
}
if(!configured){$('#payStatus').textContent='';return;}
btn.disabled=true;$('#payStatus').textContent='';
try{await rpc('submit_payment',{p_ref:A.ref,p_code:msg,p_phone:$('#payPhone').value});sessionStorage.setItem('elimu-wait',A.ref);note('Payment details submitted. Verification is pending.');wait()}
catch(x){console.error(x);$('#payStatus').textContent='We could not record your payment. Check the message and try again.';btn.disabled=false}};
function wait(){if(!configured)return;$('#sendPanel').hidden=true;$('#waitView').hidden=false;const t=setInterval(async()=>{let s;try{const r=await rpc('application_status',{p_ref:A.ref});s=r===null?'pending':r}catch{s='pending'}if(s==='verified'){clearInterval(t);sessionStorage.removeItem('elimu-wait');done()}},4000)}
function done(){$('#payView').hidden=true;$('#doneView').hidden=false;$('#dRef').textContent=A.ref;$('#dAmt').textContent=money(A.amount);$('#okToast').hidden=false;note('<b>You have successfully applied.</b> Reference '+A.ref);$('#dot').hidden=false;setTimeout(()=>$('#okToast').hidden=true,9000);window.scrollTo({top:0,behavior:'smooth'})}