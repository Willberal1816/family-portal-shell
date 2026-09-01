(function(){
  'use strict';
  var KEY='moranSchoolPortalReturnUrl';
  var ACTIVE_KEY='moranSchoolActiveClass';
  var FALLBACK='/family-portal-shell/';

  function savedPortal(){try{return localStorage.getItem(KEY)||''}catch(e){return ''}}
  function readActive(){try{return JSON.parse(localStorage.getItem(ACTIVE_KEY)||'null')||{}}catch(e){return{}}}
  function param(name){try{return new URLSearchParams(location.search).get(name)||''}catch(e){return''}}
  function inferStudent(id){id=String(id||'').toUpperCase();if(id.indexOf('NATALIE')!==-1)return'Natalie';if(id.indexOf('EMMA')!==-1)return'Emma';return''}
  function prettyDate(v){if(!v)return'';var m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return String(v);return Number(m[2])+'/'+Number(m[3])+'/'+m[1]}
  function pageContext(){
    var a=readActive(),id=param('assignmentId')||a.id||'',date=param('date')||a.date||'';
    return{
      id:String(id||''),
      row:Number(a.row||0),
      student:param('student')||a.student||inferStudent(id),
      date:String(date||''),
      subject:param('subject')||a.subject||'',
      assignment:param('assignment')||a.assignment||document.title||''
    };
  }
  function trackingId(c){if(c.id)return c.id;if(c.row&&c.date)return 'ROW-'+c.row+'-'+String(c.date).replace(/[^0-9]/g,'');return''}
  function isTeachingPage(){return /\/worksheets\/curriculum\/lessons\//i.test(location.pathname)}

  function backToClass(){
    try{
      if(window.opener&&!window.opener.closed){window.opener.focus();window.close();return;}
    }catch(e){}
    try{
      if(document.referrer&&document.referrer.indexOf('/family-portal-shell/')!==-1&&history.length>1){history.back();return;}
    }catch(e){}
    location.href=savedPortal()||FALLBACK;
  }
  function backToPortal(){location.href=savedPortal()||FALLBACK}

  function ensureStyles(){
    if(document.getElementById('school-page-controls-inline-style'))return;
    var style=document.createElement('style');
    style.id='school-page-controls-inline-style';
    style.textContent='#school-page-controls{position:sticky;top:0;z-index:10000;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 14px;padding:calc(8px + env(safe-area-inset-top,0px)) 0 8px;background:inherit}#school-page-controls .school-nav{appearance:none;-webkit-appearance:none;min-height:44px;padding:9px 13px;border:1px solid #c7cfda;border-radius:11px;background:#fff;color:#172033;font:700 15px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.08);cursor:pointer}#school-page-controls .school-nav:active{transform:scale(.98)}.school-work-identity{margin:0 0 16px;padding:10px 12px;border:1px solid #c7cfda;border-radius:10px;background:#f7f9fc;color:#172033;font:600 13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.school-work-identity .school-identity-grid{display:flex;gap:8px 18px;flex-wrap:wrap}.school-work-identity .school-track{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;word-break:break-all}.school-page-tracking{display:none}.school-manual-id{display:none!important}@media print{html,body{height:auto!important;min-height:0!important;overflow:visible!important}#school-page-controls{display:none!important}.school-work-identity{border:0;border-bottom:1px solid #888;border-radius:0;padding:0 0 7px;margin:0 0 10px;background:#fff}.school-page-tracking{display:block;position:fixed;top:2px;right:4px;z-index:2147483647;background:#fff;color:#222;font:8pt/1.2 Arial,sans-serif;padding:1px 3px}body>*,main,article,section,.q,.question,.card{break-before:auto!important;break-after:auto!important;page-break-before:auto!important;page-break-after:auto!important}.q,.question,.card{break-inside:auto!important;page-break-inside:auto!important}table,thead,tr,svg,.graph,.plane,.model,.workbox,.answer{break-inside:avoid!important;page-break-inside:avoid!important}body>:last-child,main>:last-child{margin-bottom:0!important;padding-bottom:0!important}}';
    document.head.appendChild(style);
  }

  function addControls(){
    if(document.getElementById('school-page-controls'))return;
    var bar=document.createElement('nav');
    bar.id='school-page-controls';
    bar.setAttribute('data-school-page-controls','');
    bar.setAttribute('aria-label','Lesson navigation');
    var back=document.createElement('button');
    back.type='button';back.className='school-nav school-back';back.textContent='← Back to This Class';back.addEventListener('click',backToClass);bar.appendChild(back);
    var portal=document.createElement('button');
    portal.type='button';portal.className='school-nav school-portal';portal.textContent='Back to School Portal';portal.addEventListener('click',backToPortal);bar.appendChild(portal);
    document.body.insertBefore(bar,document.body.firstChild);
  }

  function replaceManualNameDate(c){
    if(!c.student&&!c.date)return;
    document.querySelectorAll('.meta').forEach(function(el){
      var txt=String(el.textContent||'');
      if(/\bName\s*:/i.test(txt)&&/\bDate\s*:/i.test(txt)){
        el.classList.add('school-manual-id');
        el.setAttribute('aria-hidden','true');
      }
    });
  }

  function addWorksheetIdentity(){
    if(isTeachingPage())return;
    var c=pageContext(),track=trackingId(c);
    if(!c.student&&!c.date&&!track)return;
    replaceManualNameDate(c);
    if(!document.getElementById('school-work-identity')){
      var h=document.createElement('section');h.id='school-work-identity';h.className='school-work-identity';h.setAttribute('aria-label','Worksheet identification');
      var bits=[];
      if(c.student)bits.push('<span><b>Student:</b> '+escapeHtml(c.student)+'</span>');
      if(c.date)bits.push('<span><b>Date:</b> '+escapeHtml(prettyDate(c.date))+'</span>');
      if(c.subject)bits.push('<span><b>Subject:</b> '+escapeHtml(c.subject)+'</span>');
      if(c.assignment)bits.push('<span><b>Class:</b> '+escapeHtml(c.assignment)+'</span>');
      h.innerHTML='<div class="school-identity-grid">'+bits.join('')+'</div>'+(track?'<div class="school-track"><b>Tracking #:</b> '+escapeHtml(track)+'</div>':'');
      var controls=document.getElementById('school-page-controls');
      if(controls&&controls.nextSibling)document.body.insertBefore(h,controls.nextSibling);else document.body.insertBefore(h,document.body.firstChild);
    }
    if(track&&!document.getElementById('school-page-tracking')){
      var t=document.createElement('div');t.id='school-page-tracking';t.className='school-page-tracking';t.textContent='Tracking #: '+track;document.body.appendChild(t);
      document.body.setAttribute('data-assignment-id',track);
    }
  }
  function escapeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  function init(){ensureStyles();addControls();addWorksheetIdentity()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
