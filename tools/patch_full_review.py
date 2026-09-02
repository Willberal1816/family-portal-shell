from pathlib import Path
import re

portal_path = Path('index.html')
workflow_path = Path('.github/workflows/validate-student-class-flow.yml')
portal = portal_path.read_text(encoding='utf-8')
workflow = workflow_path.read_text(encoding='utf-8')

css_marker = '.worksheet-frame{width:100%;height:720px;border:1px solid var(--line);border-radius:12px;background:white}'
review_css = css_marker + '.review-document{display:grid;gap:16px;margin:16px 0}.review-page{background:#fff;border:1px solid var(--line);border-radius:12px;padding:8px;overflow:hidden}.review-page-label{font-size:.84rem;font-weight:800;color:var(--muted);margin:2px 4px 8px}.review-page img{display:block;width:100%;height:auto;background:#fff;border-radius:6px}.review-loading{padding:34px 14px;text-align:center}.review-work{min-height:70vh}@media(max-width:600px){.review-page{padding:4px}.review-document{gap:12px}}'
if review_css not in portal:
    if css_marker not in portal:
        raise SystemExit('Could not find worksheet-frame CSS marker')
    portal = portal.replace(css_marker, review_css, 1)

return_old = 'function returnToDay(){clearActiveClass();loadDay()}'
return_new = "function returnToDay(){clearActiveClass();if(typeof clearReviewObjectUrls==='function')clearReviewObjectUrls();loadDay()}"
if return_old in portal:
    portal = portal.replace(return_old, return_new, 1)
elif return_new not in portal:
    raise SystemExit('Could not find returnToDay marker')

new_review = r'''var reviewObjectUrls=[];
function clearReviewObjectUrls(){reviewObjectUrls.forEach(function(u){try{URL.revokeObjectURL(u)}catch(e){}});reviewObjectUrls=[]}
function reviewBytesToHex(buf){return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0')}).join('')}
function reviewB64Bytes(v){var s=atob(String(v||'')),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
async function loadEncryptedReviewPages(a){
  var student=firstName().toLowerCase(),date=String((data&&data.date)||currentDate||''),base='review-data/'+date+'/'+student;
  var mr=await fetch(base+'.json',{cache:'no-store'});if(!mr.ok)throw new Error('The full Review Packet is not ready for this day.');
  var m=await mr.json();if(String(m.student)!==student||String(m.date)!==date||m.format!=='webp-pages-v1')throw new Error('The Review Packet identity did not match this school day.');
  var br=await fetch(base+'.bin',{cache:'no-store'});if(!br.ok)throw new Error('The full Review Packet pages could not be loaded.');
  var cipher=new Uint8Array(await br.arrayBuffer()),enc=new TextEncoder();
  var keyBits=await crypto.subtle.digest('SHA-256',enc.encode('moran-review-v2|'+backend+'|'+student+'|'+date));
  var key=await crypto.subtle.importKey('raw',keyBits,{name:'AES-GCM'},false,['decrypt']);
  var plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:reviewB64Bytes(m.iv),additionalData:enc.encode(m.aad)},key,cipher);
  var hash=reviewBytesToHex(await crypto.subtle.digest('SHA-256',plain));if(hash!==String(m.sha256))throw new Error('The Review Packet integrity check failed.');
  var bytes=new Uint8Array(plain),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),hlen=view.getUint32(0,false),header=JSON.parse(new TextDecoder().decode(bytes.slice(4,4+hlen))),pos=4+hlen;
  clearReviewObjectUrls();
  var pages=[];(header.lengths||[]).forEach(function(len,i){len=Number(len);var part=bytes.slice(pos,pos+len);pos+=len;var u=URL.createObjectURL(new Blob([part],{type:header.mime||'image/webp'}));reviewObjectUrls.push(u);pages.push({number:i+1,url:u})});
  if(!pages.length||pages.length!==Number(m.pages||0))throw new Error('The Review Packet page count did not match.');return pages;
}
async function showClassReview(a){
  if(!a)return;active=null;clearReviewObjectUrls();
  document.getElementById('app').innerHTML='<article class="card work review-work"><div class="lesson-kicker">Full Review Packet</div><h2>'+esc(firstName())+' · '+esc((data&&data.displayDate)||currentDate)+'</h2><div class="review-loading"><b>Opening your reviewed pages…</b><p class="muted">Loading the actual student work, expected work, teacher corrections, and learning decisions.</p></div><div class="actions"><button onclick="returnToDay()">Back to School Portal</button></div></article>';
  try{
    var pages=await loadEncryptedReviewPages(a),html='<article class="card work review-work"><div class="lesson-kicker">Full Review Packet</div><h2>'+esc(firstName())+' · '+esc((data&&data.displayDate)||currentDate)+'</h2><p class="muted">'+pages.length+' reviewed pages. Read each subject in order with Mom or Dad.</p><div class="review-document">';
    pages.forEach(function(p){html+='<section class="review-page"><div class="review-page-label">Page '+p.number+' of '+pages.length+'</div><img src="'+p.url+'" alt="Review Packet page '+p.number+'" loading="lazy" decoding="async"></section>'});
    html+='</div><div class="actions"><button onclick="returnToDay()">Back to School Portal</button></div></article>';document.getElementById('app').innerHTML=html;
  }catch(err){document.getElementById('app').innerHTML='<article class="card work"><div class="lesson-kicker">Full Review Packet</div><h2>Review could not open</h2><div class="card error"><b>The full reviewed pages did not load.</b><p>'+esc(err&&err.message?err.message:err)+'</p></div><div class="actions"><button onclick="returnToDay()">Back to School Portal</button><button onclick="showClassReview(findAssignment('+Number(a.row)+'))">Try Again</button></div></article>'}
}
function openReview(row){var a=findAssignment(row);if(a)showClassReview(a)}
'''
pattern = re.compile(r"function showClassReview\(a\)\{.*?\}\nfunction openReview\(row\)\{.*?\}\n", re.S)
if 'async function loadEncryptedReviewPages(a)' not in portal:
    portal, count = pattern.subn(new_review, portal, count=1)
    if count != 1:
        raise SystemExit(f'Expected one summary Review route, replaced {count}')

# Update validation so CI enforces full-document Review rather than the retired summary-only route.
workflow = workflow.replace("      - 'index.html'\n", "      - 'index.html'\n      - 'review-data/**'\n", 2) if "      - 'review-data/**'" not in workflow else workflow
workflow = workflow.replace("              'portal-hosted class Review screen': \"function showClassReview(a)\",\n              'student Review decision': \"function studentReviewDecisionHtml(a)\",\n              'Review opens class Review screen': \"function openReview(row){var a=findAssignment(row);if(a)showClassReview(a)}\",\n", "              'encrypted full Review loader': \"async function loadEncryptedReviewPages(a)\",\n              'full Review page renderer': \"class=\\\"review-page\\\"\",\n              'private-link Review key derivation': \"moran-review-v2|\",\n              'Review opens full packet screen': \"function openReview(row){var a=findAssignment(row);if(a)showClassReview(a)}\",\n")
legacy_check = "          if \"var u=reviewPacketUrl(a);if(u){window.open(u\" in portal or 'window.open(reviewPacketUrl' in portal:\n              errors.append('Student Review is navigating to an external Review Packet URL instead of staying inside School Portal')\n"
extra_check = legacy_check + "          if \"reviewHtml(a)+studentReviewDecisionHtml(a)\" in portal:\n              errors.append('Summary-only Review route remains; Review must render the full corrective packet pages')\n          for student in ('emma','natalie'):\n              manifest=Path('review-data/2026-09-01')/(student+'.json'); blob=Path('review-data/2026-09-01')/(student+'.bin')\n              if not manifest.exists() or not blob.exists() or blob.stat().st_size < 100000:\n                  errors.append(f'Encrypted full Review assets missing for {student}')\n"
if 'Summary-only Review route remains' not in workflow:
    if legacy_check not in workflow:
        raise SystemExit('Could not find Review validation insertion marker')
    workflow = workflow.replace(legacy_check, extra_check, 1)
workflow = workflow.replace('portal-hosted class Review delivery', 'encrypted full Review Packet delivery')

portal_path.write_text(portal, encoding='utf-8')
workflow_path.write_text(workflow, encoding='utf-8')
print('Patched encrypted full Review delivery and validation.')
