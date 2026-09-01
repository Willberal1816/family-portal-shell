(function(){
  'use strict';
  var KEY='moranSchoolPortalReturnUrl';
  var FALLBACK='/family-portal-shell/';
  function savedPortal(){try{return localStorage.getItem(KEY)||''}catch(e){return ''}}
  function returnToPortal(){
    var saved=savedPortal();
    try{
      if(window.opener&&!window.opener.closed){
        setTimeout(function(){try{location.href=saved||FALLBACK}catch(e){}},300);
        window.close();
        return;
      }
    }catch(e){}
    if(saved){location.href=saved;return}
    try{
      if(document.referrer&&document.referrer.indexOf('/family-portal-shell/')!==-1&&history.length>1){history.back();return}
    }catch(e){}
    location.href=FALLBACK;
  }
  function addControls(){
    if(document.getElementById('school-page-controls'))return;
    var bar=document.createElement('nav');
    bar.id='school-page-controls';
    bar.setAttribute('data-school-page-controls','');
    bar.setAttribute('aria-label','Lesson navigation');
    var back=document.createElement('button');
    back.type='button';
    back.className='school-back';
    back.textContent='← Back to School Portal';
    back.addEventListener('click',returnToPortal);
    bar.appendChild(back);
    document.body.insertBefore(bar,document.body.firstChild);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addControls);else addControls();
})();\n