/* Same-site native Share-sheet printing for iPadOS standalone school app.
   Chrome-rendered PDF files retain original workbook pages and Tracking IDs.
   Keep existing verified Emma PDFs intact; new dated lesson PDFs share the same iPadOS path. */
(function(){
 'use strict';
 var root='/family-portal-shell/worksheets/curriculum/';
 var stems=['emma-math-package-nets-43','emma-la-trail-update-43','emma-reading-nov10-book-43','emma-social-harbor-records-41','emma-art-distance-path-43','emma-math-garden-layout-44','natalie-math-market-receipt-44','emma-la-creek-notice-44','natalie-la-garden-survey-44','emma-reading-setting-change-44','natalie-reading-turning-points-44','emma-science-flight-data-44','natalie-science-rocket-evidence-44','emma-project-straw-rocket-44','natalie-project-straw-rocket-44'];
 var resources={},states={};
 stems.forEach(function(stem){
   var lesson=root+'lessons/'+stem+'.html';
   resources[lesson]={pdf:root+'print-pdf/'+stem+'.pdf',name:(stem.indexOf('natalie-')===0?'Natalie-':'Emma-')+stem.replace(/^(emma|natalie)-/,'')+'.pdf'};
   states[lesson]={file:null,loading:false,error:''};
 });
 function requestedPath(url){
   try{return new URL(String(url||location.href),location.href).pathname}catch(e){return ''}
 }
 function isIPadHomeApp(){
   var ios=/iPad|iPhone|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
   var standalone=navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);
   return !!(ios&&standalone);
 }
 function showStatus(message){
   var host=document.getElementById('app')||document.getElementById('school-page-controls')||document.querySelector('main');
   if(!host)return;
   var label=document.getElementById('school-pdf-print-status');
   if(!label){
     label=document.createElement('div');label.id='school-pdf-print-status';label.setAttribute('role','status');
     label.style.cssText='padding:10px;margin:10px 0;background:#fffbe9;color:#222;border:1px solid #d8ae4f;border-radius:8px;font:15px/1.4 Arial,sans-serif';
     host.appendChild(label);
   }
   label.textContent=message;
 }
 function prepare(path){
   var asset=resources[path],state=states[path];
   if(!asset||!state||state.file||state.loading||!isIPadHomeApp())return;
   if(!navigator.share||!navigator.canShare){state.error='Native document sharing is unavailable on this device.';return}
   state.loading=true;
   fetch(asset.pdf,{cache:'no-store'}).then(function(r){
     if(!r.ok)throw new Error('The printable PDF has not loaded (HTTP '+r.status+').');
     return r.arrayBuffer();
   }).then(function(bytes){
     var b=new Uint8Array(bytes.slice(0,4));
     if(b.length!==4||b[0]!==37||b[1]!==80||b[2]!==68||b[3]!==70)throw new Error('The printable file was not a valid PDF.');
     var file=new File([bytes],asset.name,{type:'application/pdf'});
     if(!navigator.canShare({files:[file]}))throw new Error('This iPad cannot share PDF files for printing.');
     state.file=file;state.error='';
     var label=document.getElementById('school-pdf-print-status');
     if(label)label.textContent='Worksheet ready. Tap Print Worksheet again and select Print from the iPad Share sheet.';
   }).catch(function(e){state.error=e&&e.message||'The printable file could not be prepared.';showStatus(state.error)})
   .finally(function(){state.loading=false});
 }
 window.schoolPrepareNativePrint=function(url){prepare(requestedPath(url))};
 window.schoolNativePrint=function(url){
   var path=requestedPath(url);
   if(!isIPadHomeApp()||!resources[path])return false;
   var state=states[path];
   if(state.file){
     showStatus('In the iPad Share sheet, choose Print to print the worksheet. Your School Portal remains open.');
     try{
       navigator.share({files:[state.file],title:(path.indexOf('/natalie-')>=0?'Natalie School Worksheet':'Emma School Worksheet')}).catch(function(e){
         if(e&&e.name==='AbortError')return;
         showStatus('Could not open the iPad Share sheet: '+(e&&e.message||'Unknown error'));
       });
     }catch(e){showStatus('Could not open the iPad Share sheet: '+(e&&e.message||'Unknown error'))}
   }else{
     showStatus(state.error||'Preparing the two-page worksheet. Tap Print Worksheet again when the ready message appears.');
     prepare(path);
   }
   return true;
 };
 function initialize(){
   if(!isIPadHomeApp())return;
   var here=requestedPath(location.href);
   if(resources[here]){prepare(here);return}
   if(document.getElementById('app'))stems.forEach(function(stem){prepare(root+'lessons/'+stem+'.html')});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
 else initialize();
})();
