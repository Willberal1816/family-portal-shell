(function(){
  'use strict';
  var KEY='moranSchoolPortalReturnUrl';
  var FALLBACK='/family-portal-shell/';
  function savedPortal(){try{return localStorage.getItem(KEY)||''}catch(e){return ''}}
  function returnToPortal(){
    try{
      if(window.opener&&!window.opener.closed){
        window.opener.focus();
        window.close();
        return;
      }
    }catch(e){}
    try{
      if(document.referrer&&document.referrer.indexOf('/family-portal-shell/')!==-1&&history.length>1){
        history.back();
        return;
      }
    }catch(e){}
    var saved=savedPortal();
    location.href=saved||FALLBACK;
  }
  function addControls(){
    if(document.getElementById('school-page-controls'))return;
    if(!document.getElementById('school-page-controls-inline-style')){
      var style=document.createElement('style');
      style.id='school-page-controls-inline-style';
      style.textContent='#school-page-controls{position:sticky;top:0;z-index:10000;display:flex;align-items:center;gap:8px;margin:0 0 14px;padding:calc(8px + env(safe-area-inset-top,0px)) 0 8px;background:inherit}#school-page-controls .school-back{appearance:none;-webkit-appearance:none;min-height:44px;padding:9px 13px;border:1px solid #c7cfda;border-radius:11px;background:#fff;color:#172033;font:700 15px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.08);cursor:pointer}#school-page-controls .school-back:active{transform:scale(.98)}@media print{#school-page-controls{display:none!important}}';
      document.head.appendChild(style);
    }
    var bar=document.createElement('nav');
    bar.id='school-page-controls';
    bar.setAttribute('data-school-page-controls','');
    bar.setAttribute('aria-label','Lesson navigation');
    var back=document.createElement('button');
    back.type='button';
    back.className='school-back';
    back.textContent='← Back to This Class';
    back.addEventListener('click',returnToPortal);
    bar.appendChild(back);
    document.body.insertBefore(bar,document.body.firstChild);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addControls);else addControls();
})();
