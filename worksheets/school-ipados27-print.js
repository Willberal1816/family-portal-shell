/* Same-site native Share-sheet printing for iPadOS standalone school app.
   Chrome-rendered PDF files retain original workbook pages and Tracking IDs.
   Keep existing verified Emma PDFs intact; new dated lesson PDFs share the same iPadOS path. */
(function(){
 'use strict';
 var root='/family-portal-shell/worksheets/curriculum/';
 var stems=['emma-math-package-nets-43','emma-la-trail-update-43','emma-reading-nov10-book-43','emma-social-harbor-records-41','emma-art-distance-path-43','emma-math-garden-layout-44','natalie-math-market-receipt-44','emma-la-creek-notice-44','natalie-la-garden-survey-44','emma-reading-setting-change-44','natalie-reading-turning-points-44','emma-science-flight-data-44','natalie-science-rocket-evidence-44','emma-project-straw-rocket-44','natalie-project-straw-rocket-44','emma-math-group-or-extra-45','natalie-math-two-market-baskets-45','emma-la-library-announcement-45','natalie-la-bus-stop-survey-45','emma-reading-change-of-plan-45','natalie-reading-claim-certainty-45','emma-science-ramp-controls-45','natalie-science-spring-toy-energy-45','emma-social-library-rules-45','natalie-social-park-hearing-45','emma-math-totes-inside-outside-46','natalie-math-competing-promos-46','emma-la-park-invitation-edit-46','natalie-la-trail-signup-evidence-46','emma-reading-quote-vs-guess-46','natalie-reading-two-motives-46','emma-health-clean-hands-station-46','natalie-health-food-safety-audit-46','emma-cooking-water-measure-lab-46','natalie-cooking-scale-water-batch-46','emma-math-reading-room-data-47','natalie-math-van-rules-proof-47','emma-la-animal-field-notes-47','natalie-la-museum-source-audit-47','emma-reading-dialogue-character-47','natalie-reading-reliable-narrator-47','emma-science-fabric-absorption-47','natalie-science-insulation-cooling-47','emma-geo-map-purpose-47','natalie-geo-date-line-cards-47','emma-math-fraction-strip-matches-48','natalie-math-spinner-outcomes-48','emma-la-stage-directions-48','natalie-la-library-letter-48','emma-reading-two-clues-prediction-48','natalie-reading-theme-two-scenes-48','emma-social-community-fund-48','natalie-social-river-crossing-48','emma-art-four-panel-action-48','natalie-art-poster-hierarchy-48','emma-math-museum-timetable-49','natalie-math-l-park-area-49','emma-la-weather-event-49','natalie-la-science-abstract-49','emma-read-motive-actions-49','natalie-read-story-structure-49','emma-sci-pond-food-chain-49','natalie-sci-pond-foodweb-49','emma-project-paper-tower-load-49','natalie-project-paper-tower-efficiency-49','emma-math-groups-outside-50','emma-la-desk-log-50','emma-read-true-order-50','emma-sci-absorption-test-50','emma-social-town-meeting-50','natalie-math-customary-length-50','natalie-la-west-gate-survey-50','natalie-read-word-choices-50','natalie-sci-fahrenheit-cooling-50','natalie-social-ferry-sources-50','emma-math-festival-kits-51','natalie-math-trail-measure-51','emma-la-garden-record-51','natalie-la-shuttle-survey-51','emma-reading-middle-event-51','natalie-reading-key-word-51','emma-health-comfort-breaks-51','natalie-health-focus-log-51','emma-cooking-wraps-measure-51','natalie-cooking-wraps-measure-51','emma-math-loose-extras-repair-52','natalie-math-unit-check-repair-52','emma-la-bird-count-notice-52','natalie-la-club-response-report-52','emma-reading-page-proof-sequence-52','natalie-reading-word-two-readings-52','emma-science-absorption-evidence-check-52','natalie-science-cooling-evidence-check-52','emma-geo-map-evidence-choice-52','natalie-geo-date-line-proof-52'];
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
