(function(){
  'use strict';
  function p(n){try{return new URLSearchParams(location.search).get(n)||''}catch(e){return''}}
  function active(){try{return JSON.parse(localStorage.getItem('moranSchoolActiveClass')||'null')||{}}catch(e){return{}}}
  function infer(id){id=String(id||'').toUpperCase();if(id.indexOf('NATALIE')>=0)return'Natalie';if(id.indexOf('EMMA')>=0)return'Emma';return''}
  function fmt(v){var m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?(Number(m[2])+'/'+Number(m[3])+'/'+m[1]):String(v||'')}
  var a=active(),b=document.body.dataset||{};
  var id=p('assignmentId')||a.id||b.assignmentId||'';
  var student=p('student')||a.student||b.student||infer(id);
  var date=p('date')||a.date||b.date||'';
  var subject=p('subject')||a.subject||b.subject||'';
  document.querySelectorAll('.js-name').forEach(function(x){x.textContent=student});
  document.querySelectorAll('.js-date').forEach(function(x){x.textContent=fmt(date)});
  document.querySelectorAll('.js-subject').forEach(function(x){x.textContent=subject});
  document.querySelectorAll('.js-tracking').forEach(function(x){x.textContent=id});
})();
