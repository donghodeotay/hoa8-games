/* app.js — shell, router, tooltip system. */
(function () {
  "use strict";
  function $(s, r){ return (r||document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
  function escapeRegex(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  /* ----- Glossary tooltip ----- */
  var TERM_REGEX=null, TERM_MAP=null;
  function buildMatcher(){
    if (!window.GLOSSARY || !window.GLOSSARY.length) return;
    var seen={}, unique=[];
    window.GLOSSARY.forEach(function(e){
      var k=e[0].toLowerCase();
      if(!seen[k]){ seen[k]=true; unique.push(e); }
    });
    var entries=unique.sort(function(a,b){ return b[0].length-a[0].length; });
    TERM_MAP={}; var parts=[];
    entries.forEach(function(e){
      TERM_MAP[e[0].toLowerCase()]={en:e[1], type:e[2]||"term"};
      parts.push(escapeRegex(e[0]));
    });
    try { TERM_REGEX=new RegExp("(?<![\\p{L}\\p{N}])("+parts.join("|")+")(?![\\p{L}\\p{N}])","giu"); }
    catch(e){ TERM_REGEX=new RegExp("(^|[^\\w])("+parts.join("|")+")(?![\\w])","gi"); }
  }
  function wrap(text){
    if(!text) return "";
    if(!TERM_REGEX) return escapeHtml(text);
    TERM_REGEX.lastIndex=0;
    var out="", lastIdx=0, m;
    while((m=TERM_REGEX.exec(text))!==null){
      var matched=m[1]!==undefined && TERM_MAP[m[1].toLowerCase()]?m[1]:(m[2]!==undefined?m[2]:m[0]);
      var prefix=m[1]&&!TERM_MAP[m[1].toLowerCase()]?m[1]:"";
      var matchStart=m.index+(prefix?prefix.length:0);
      var entry=TERM_MAP[matched.toLowerCase()];
      if(!entry) continue;
      out+=escapeHtml(text.slice(lastIdx, matchStart));
      if(prefix) out+=escapeHtml(prefix);
      var cls="term"+(entry.type==="common"?" term-common":"");
      out+='<span class="'+cls+'" tabindex="0" data-en="'+escapeHtml(entry.en)+'" data-vi="'+escapeHtml(matched)+'">'+escapeHtml(matched)+'</span>';
      lastIdx=matchStart+matched.length;
      if(m.index===TERM_REGEX.lastIndex) TERM_REGEX.lastIndex++;
    }
    out+=escapeHtml(text.slice(lastIdx));
    return out;
  }
  /* ----- Tooltip ----- */
  var tipEl=null, hideTimer=null;
  function getTip(){ if(!tipEl) tipEl=document.getElementById("term-tooltip"); return tipEl; }
  function position(target){
    var tip=getTip(); var r=target.getBoundingClientRect(); var tipR=tip.getBoundingClientRect(); var pad=8;
    var top=r.bottom+8, below=false;
    if(top+tipR.height+pad>window.innerHeight){ top=r.top-tipR.height-8; below=true; }
    var left=r.left+r.width/2-tipR.width/2;
    left=Math.max(pad, Math.min(left, window.innerWidth-tipR.width-pad));
    tip.style.left=left+"px"; tip.style.top=top+"px"; tip.classList.toggle("below", below);
  }
  function show(target){
    var tip=getTip(); if(!tip) return;
    tip.innerHTML='<div class="term-tooltip-en">'+escapeHtml(target.getAttribute("data-en"))+'</div>'+
                  '<div class="term-tooltip-vi">'+escapeHtml(target.getAttribute("data-vi"))+'</div>';
    tip.classList.add("show"); tip.setAttribute("aria-hidden","false");
    position(target); target.classList.add("active");
    if(hideTimer){ clearTimeout(hideTimer); hideTimer=null; }
  }
  function hide(target){
    var tip=getTip(); if(!tip) return;
    tip.classList.remove("show"); tip.setAttribute("aria-hidden","true");
    document.querySelectorAll(".term.active, .term-common.active").forEach(function(el){ el.classList.remove("active"); });
  }
  function bindTips(root){
    $$(".term, .term-common", root).forEach(function(el){
      el.addEventListener("mouseenter", function(){ show(el); });
      el.addEventListener("mouseleave", function(){ hideTimer=setTimeout(function(){ hide(el); }, 100); });
      el.addEventListener("focus", function(){ show(el); });
      el.addEventListener("blur",  function(){ hide(el); });
      el.addEventListener("click", function(ev){
        ev.stopPropagation();
        if(el.classList.contains("active")) hide(el); else show(el);
      });
    });
  }
  document.addEventListener("click", function(e){
    if(!e.target.closest||!e.target.closest(".term, .term-common")) hide();
  });
  ["scroll","resize"].forEach(function(ev){
    window.addEventListener(ev, function(){
      var a=document.querySelector(".term.active, .term-common.active");
      if(a) position(a);
    }, {passive:true});
  });
  function richText(el, text){ el.innerHTML=wrap(text); bindTips(el); }

  /* Expose globals for games.js */
  window.APP = { $:$, $$:$$, escapeHtml:escapeHtml, richText:richText, bindTips:bindTips, wrap:wrap };

  /* ----- Router ----- */
  function showScreen(id){
    $$(".screen").forEach(function(el){ el.classList.remove("active"); });
    var t=$("#"+id); if(t) t.classList.add("active");
    window.scrollTo({top:0, behavior:"smooth"});
  }
  window.APP.showScreen = showScreen;

  function gotoGame(name){
    showScreen("screen-"+name);
    if(window.GAMES && window.GAMES[name]) window.GAMES[name].start();
    else if(window.EXPERIMENTS && window.EXPERIMENTS[name]) window.EXPERIMENTS[name].start();
  }

  function init(){
    buildMatcher();
    bindTips(document);
    /* Tile clicks */
    $$(".tile").forEach(function(tile){
      tile.addEventListener("click", function(){
        var target=tile.getAttribute("data-target");
        if(!target) return;
        gotoGame(target);
      });
    });
    /* Back buttons */
    $$(".btn-back-home").forEach(function(b){
      b.addEventListener("click", function(){ showScreen("screen-home"); });
    });
    /* Initialize games */
    if(window.GAMES) Object.keys(window.GAMES).forEach(function(k){
      if(window.GAMES[k].init) window.GAMES[k].init();
    });
    if(window.EXPERIMENTS) Object.keys(window.EXPERIMENTS).forEach(function(k){
      if(window.EXPERIMENTS[k].init) window.EXPERIMENTS[k].init();
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
