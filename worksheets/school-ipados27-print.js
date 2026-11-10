/* Same-site iPadOS standalone printing for Emma's November 10 Math worksheet.
   Native Share sheet receives a validated two-page PDF instead of calling the
   iPadOS 27 standalone window.print() path that silently fails. */
(function(){
  'use strict';
  var lessonPath='/family-portal-shell/worksheets/curriculum/lessons/emma-math-package-nets-43.html';
  var pdfPath='/family-portal-shell/worksheets/curriculum/print-pdf/emma-math-package-nets-43.pdf';
  var pdfName='Emma-Math-2026-11-10-Box-Nets.pdf';
  var pdfFile=null,loading=false,loadError='';
  function eligible(url){
    try{
      var path=new URL(String(url||''),location.href).pathname;
      var ios=/iPad|iPhone|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
      var standalone=navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);
      return !!(ios&&standalone&&path===lessonPath);
    }catch(e){return false}
  }
  function status(message){
    var host=document.getElementById('app')||document.getElementById('school-page-controls')||document.querySelector('main');
    if(!host)return;
    var label=document.getElementById('school-pdf-print-status');
    if(!label){label=document.createElement('div');label.id='school-pdf-print-status';label.setAttribute('role','status');label.style.cssText='padding:10px;margin:10px 0;background:#fffbe9;color:#222;border:1px solid #d8ae4f;border-radius:8px;font:15px/1.4 Arial,sans-serif';host.appendChild(label)}
    label.textContent=message;
  }
  function ready(){
    if(pdfFile||loading||!eligible(lessonPath))return;
    if(!navigator.share||!navigator.canShare){loadError='This iPad does not provide the required native document sharing feature.';return}
    loading=true;
    fetch(pdfPath,{cache:'no-store'}).then(function(r){
      if(!r.ok)throw new Error('Print document is not available (HTTP '+r.status+').');
      return r.arrayBuffer();
    }).then(function(bytes){
      var header=new Uint8Array(bytes.slice(0,4));
      if(header.length!==4||header[0]!==37||header[1]!==80||header[2]!==68||header[3]!==70)throw new Error('Print document is not a PDF.');
      var file=new File([bytes],pdfName,{type:'application/pdf'});
      if(!navigator.canShare({files:[file]}))throw new Error('This iPad cannot offer PDF printing through its Share sheet.');
      pdfFile=file;loadError='';
      var label=document.getElementById('school-pdf-print-status');
      if(label)label.textContent='Worksheet ready. Tap Print Worksheet again, then choose Print in the iPad Share sheet.';
    }).catch(function(e){loadError=e&&e.message||'Could not prepare the printable worksheet.';status(loadError)})
      .finally(function(){loading=false});
  }
  window.schoolNativePrint=function(url){
    if(!eligible(url))return false;
    if(pdfFile){
      status('Select Print in the iPad Share sheet to print these two worksheet pages.');
      try{
        navigator.share({files:[pdfFile],title:'Emma Math Worksheet'}).catch(function(e){
          if(e&&e.name==='AbortError')return;
          status('Could not open the iPad Share sheet: '+(e&&e.message||'Unknown error'));
        });
      }catch(e){status('Could not open the iPad Share sheet: '+(e&&e.message||'Unknown error'))}
    }else{
      status(loadError||'Preparing Emma\'s two-page worksheet. Tap Print Worksheet again when ready.');
      ready();
    }
    return true;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
