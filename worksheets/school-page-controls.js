(function(){
  'use strict';
  var KEY='moranSchoolPortalReturnUrl';
  var ACTIVE_KEY='moranSchoolActiveClass';
  var FALLBACK='/family-portal-shell/';
  var PRINT_TABLE_ID='school-print-document';

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
  function hasPrintableWork(){return !!document.getElementById('printable')}

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

  function preparePrintDocument(){
    if(isTeachingPage()||document.getElementById(PRINT_TABLE_ID))return;
    var c=pageContext(),track=trackingId(c);if(!track)return;
    var table=document.createElement('table');table.id=PRINT_TABLE_ID;table.className='school-print-document';table.setAttribute('aria-label','Printable worksheet with repeated Tracking header');
    var thead=document.createElement('thead'),hr=document.createElement('tr'),th=document.createElement('th');th.className='school-print-header-cell';
    var t=document.createElement('div');t.id='school-page-tracking';t.className='school-page-tracking';t.setAttribute('aria-label','Repeated worksheet Tracking number');t.textContent='Tracking #: '+track;th.appendChild(t);hr.appendChild(th);thead.appendChild(hr);
    var tbody=document.createElement('tbody'),br=document.createElement('tr'),td=document.createElement('td');td.className='school-print-body';
    while(document.body.firstChild)td.appendChild(document.body.firstChild);
    br.appendChild(td);tbody.appendChild(br);table.appendChild(thead);table.appendChild(tbody);document.body.appendChild(table);
    document.body.setAttribute('data-assignment-id',track);
  }
  function restorePrintDocument(){
    var table=document.getElementById(PRINT_TABLE_ID);if(!table)return;
    var td=table.querySelector('tbody>tr>td');if(!td){table.remove();return;}
    while(td.firstChild)document.body.insertBefore(td.firstChild,table);
    table.remove();
  }
  function isIOSPrintDevice(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
  function printLink(){try{var u=new URL(location.href);u.searchParams.delete('print');return u.href}catch(e){return location.href}}
  function showPrintRecovery(){
    if(document.getElementById('school-print-recovery'))return;
    var bar=document.getElementById('school-page-controls');
    if(!bar)return;
    var help=document.createElement('aside');help.id='school-print-recovery';help.setAttribute('role','status');
    help.style.cssText='margin:8px 0 14px;padding:12px;border:2px solid #607d96;border-radius:10px;background:#f5f9ff;color:#172033;font:15px/1.45 -apple-system,BlinkMacSystemFont,Arial,sans-serif';
    var title=document.createElement('strong');title.textContent='No print window?';help.appendChild(title);
    var description=document.createElement('p');description.textContent='Some iPad home-screen apps do not open the print dialog. Open this worksheet in Safari and tap Print Worksheet there. Your class and Tracking number will be preserved.';help.appendChild(description);
    var link=document.createElement('a');link.href=printLink();link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open worksheet in browser';
    link.style.cssText='display:inline-block;margin:3px 12px 6px 0;padding:9px 11px;background:#fff;color:#124a72;border:1px solid #789;border-radius:8px;font-weight:700';
    help.appendChild(link);
    var copy=document.createElement('button');copy.type='button';copy.textContent='Copy worksheet link';
    copy.style.cssText='padding:10px;border:1px solid #789;border-radius:8px;background:#fff;color:#124a72;font-weight:700';
    var note=document.createElement('p');note.style.cssText='margin:7px 0 0;font-size:13px';note.textContent='If the link remains inside the school app, copy the link, open Safari, paste it into the address bar, then tap Print Worksheet.';
    copy.addEventListener('click',function(){var url=printLink();if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(function(){note.textContent='Copied. Open Safari, paste the link, and tap Print Worksheet.'}).catch(function(){note.textContent='Copy this address into Safari: '+url})}else{note.textContent='Copy this address into Safari: '+url}});
    help.appendChild(copy);help.appendChild(note);
    bar.parentNode.insertBefore(help,bar.nextSibling);
  }
  function printWorksheetNow(){
    var printStarted=false;
    var started=function(){printStarted=true};
    if(isIOSPrintDevice()){
      window.addEventListener('beforeprint',started,{once:true});
      window.addEventListener('afterprint',started,{once:true});
      setTimeout(function(){if(!printStarted)showPrintRecovery()},1300);
    }
    try{window.__schoolAutoPrintHandled=true;window.focus();window.print()}
    catch(e){window.__schoolAutoPrintHandled=false;showPrintRecovery()}
  }
  window.schoolPrintWorksheet=printWorksheetNow;
  function autoPrintIfRequested(){if((isTeachingPage()&&!hasPrintableWork())||param('print')!=='1')return;var run=function(){setTimeout(printWorksheetNow,200)};if(document.readyState==='complete')run();else window.addEventListener('load',run,{once:true})}

  function ensureStyles(){
    if(document.getElementById('school-page-controls-inline-style'))return;
    var style=document.createElement('style');
    style.id='school-page-controls-inline-style';
    style.textContent='#school-page-controls{position:sticky;top:0;z-index:10000;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 14px;padding:calc(8px + env(safe-area-inset-top,0px)) 0 8px;background:inherit}#school-page-controls .school-nav{appearance:none;-webkit-appearance:none;min-height:44px;padding:9px 13px;border:1px solid #c7cfda;border-radius:11px;background:#fff;color:#172033;font:700 15px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.08);cursor:pointer}#school-page-controls .school-nav:active{transform:scale(.98)}.school-work-identity{margin:0 0 16px;padding:10px 12px;border:1px solid #c7cfda;border-radius:10px;background:#f7f9fc;color:#172033;font:600 13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.school-work-identity .school-identity-grid{display:flex;gap:8px 18px;flex-wrap:wrap}.school-work-identity .school-track{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;word-break:break-all}.school-page-tracking{display:none}.school-print-document,.school-print-document>tbody,.school-print-document>tbody>tr,.school-print-document>tbody>tr>td{display:contents}.school-print-document>thead{display:none}.school-manual-id{display:none!important}@media print{html,body{height:auto!important;min-height:0!important;overflow:visible!important}#school-page-controls{display:none!important}.school-work-identity{border:0;border-bottom:1px solid #888;border-radius:0;padding:0 0 7px;margin:0 0 10px;background:#fff}.school-print-document{display:table!important;width:100%!important;border-collapse:collapse!important;border-spacing:0!important;table-layout:fixed!important}.school-print-document>thead{display:table-header-group!important}.school-print-document>tbody{display:table-row-group!important}.school-print-document>thead>tr,.school-print-document>tbody>tr{display:table-row!important}.school-print-document>thead>tr>th,.school-print-document>tbody>tr>td{display:table-cell!important}.school-print-document>thead>tr>th{padding:0 0 7pt!important;border:0!important;vertical-align:top!important}.school-print-document>tbody>tr>td{padding:0!important;border:0!important;vertical-align:top!important}.school-page-tracking{display:block!important;position:static!important;width:100%!important;margin:0!important;padding:0 0 4pt!important;border:0!important;border-bottom:.75pt solid #777!important;border-radius:0!important;background:#fff!important;color:#222!important;text-align:left!important;font:700 8.5pt/1.2 Arial,sans-serif!important;letter-spacing:.01em!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}body>*,main,article,section,.q,.question,.card{break-before:auto!important;break-after:auto!important;page-break-before:auto!important;page-break-after:auto!important}.q,.question,.card{break-inside:auto!important;page-break-inside:auto!important}svg,.graph,.plane,.model,.workbox,.answer{break-inside:avoid!important;page-break-inside:avoid!important}.school-print-document,.school-print-document>tbody,.school-print-document>tbody>tr,.school-print-document>tbody>tr>td{break-inside:auto!important;page-break-inside:auto!important}.school-print-document>thead,.school-print-document>thead>tr,.school-print-document>thead>tr>th{break-inside:avoid!important;page-break-inside:avoid!important}body>:last-child,main>:last-child{margin-bottom:0!important;padding-bottom:0!important}}/* tracking-print-header:table-repeat-v4 */';
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
    if(!isTeachingPage()||hasPrintableWork()){var print=document.createElement('button');print.type='button';print.className='school-nav school-print';print.textContent='Print Worksheet';print.addEventListener('click',printWorksheetNow);bar.appendChild(print)}
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
    if(track)document.body.setAttribute('data-assignment-id',track);
  }
  function escapeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  function init(){
    ensureStyles();addControls();addWorksheetIdentity();preparePrintDocument();
    autoPrintIfRequested();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* tracking-print-header:table-repeat-v3 compatibility */
