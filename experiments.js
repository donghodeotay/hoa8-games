/* experiments.js — 3 interactive demos: Acid-Base, Solubility, Acid+Metal.
   Self-healing: start() calls init() once on first invocation. */
window.EXPERIMENTS = (function(){
  var $ = (window.APP && window.APP.$)  || function(s){ return document.querySelector(s); };
  var $$ = (window.APP && window.APP.$$) || function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* =========== EXP 1: NaOH + phenolphthalein + HCl =========== */
  var AcidBase = (function(){
    var hasIndicator=false, hclDrops=0, totalMaxDrops=10, initialized=false;
    function reset(){
      hasIndicator=false; hclDrops=0;
      var tube=$("#exp1-tube");
      if(tube){ tube.classList.remove("pink"); tube.classList.remove("clear"); }
      var ai=$("#exp1-add-ind");  if(ai) ai.disabled = false;
      var ah=$("#exp1-add-hcl");  if(ah) ah.disabled = true;
      var msg=$("#exp1-msg");     if(msg) msg.innerHTML = "Bắt đầu: ống nghiệm chứa <strong>10 mL dung dịch NaOH 0,1M</strong>. Bấm <em>Thêm phenolphtalein</em> để bắt đầu.";
      updatePH();
    }
    function addIndicator(){
      hasIndicator=true;
      var t=$("#exp1-tube"); if(t) t.classList.add("pink");
      var ai=$("#exp1-add-ind"); if(ai) ai.disabled = true;
      var ah=$("#exp1-add-hcl"); if(ah) ah.disabled = false;
      var msg=$("#exp1-msg"); if(msg) msg.innerHTML = "Thêm phenolphtalein → dung dịch chuyển <span style=\"color:#d83a7c;font-weight:600\">màu hồng</span> (môi trường base, pH > 8,3).";
      updatePH();
    }
    function addHcl(){
      hclDrops++;
      var t=$("#exp1-tube"), msg=$("#exp1-msg"), ah=$("#exp1-add-hcl");
      if(hclDrops>=totalMaxDrops){
        if(t){ t.classList.remove("pink"); t.classList.add("clear"); }
        if(ah) ah.disabled = true;
        if(msg) msg.innerHTML = "Đã thêm đủ HCl: dung dịch trở lại <strong>không màu</strong>. Phương trình trung hòa: <em>NaOH + HCl → NaCl + H₂O</em>.";
      } else {
        if(msg) msg.innerHTML = "Thêm giọt HCl thứ <strong>"+hclDrops+"</strong>/"+totalMaxDrops+". Phản ứng đang trung hòa từ từ…";
      }
      var stage = $("#exp1-stage");
      if(stage){
        var drop = document.createElement("div");
        drop.className = "exp1-drop";
        stage.appendChild(drop);
        setTimeout(function(){ drop.remove(); }, 800);
      }
      updatePH();
    }
    function updatePH(){
      var ph;
      if(!hasIndicator) ph = 13;
      else if(hclDrops < totalMaxDrops/2) ph = 13 - hclDrops*0.7;
      else ph = Math.max(2, 9.5 - (hclDrops - totalMaxDrops/2)*1.2);
      ph = Math.round(ph*10)/10;
      var v=$("#exp1-ph-val"), m=$("#exp1-ph-mark");
      if(v) v.textContent = ph.toFixed(1);
      if(m){ var pct = (ph-1)/13 * 100; m.style.left = Math.max(0, Math.min(100, pct)) + "%"; }
    }
    function init(){
      if(initialized) return;
      var ai=$("#exp1-add-ind"), ah=$("#exp1-add-hcl"), rs=$("#exp1-reset");
      if(ai) ai.addEventListener("click", addIndicator);
      if(ah) ah.addEventListener("click", addHcl);
      if(rs) rs.addEventListener("click", reset);
      initialized = true;
    }
    function start(){ init(); reset(); }
    return {init:init, start:start};
  })();

  /* =========== EXP 2: Solubility =========== */
  var Solubility = (function(){
    var SALTS = [
      {f:"NaCl", soluble:true,  hint:"Tất cả muối Na đều tan."},
      {f:"KNO₃", soluble:true,  hint:"Tất cả muối nitrate (NO₃⁻) đều tan."},
      {f:"BaSO₄", soluble:false, color:"#ffffff", hint:"BaSO₄ — kết tủa trắng."},
      {f:"CaCO₃", soluble:false, color:"#f0f0f0", hint:"Đá vôi — không tan."},
      {f:"AgCl",  soluble:false, color:"#ffffff", hint:"AgCl — kết tủa trắng đặc trưng."},
      {f:"CuSO₄", soluble:true,  hint:"CuSO₄ tan, dung dịch màu xanh lam."},
      {f:"PbI₂",  soluble:false, color:"#ffd54f", hint:"PbI₂ — kết tủa vàng tươi."},
      {f:"Fe(OH)₃", soluble:false, color:"#a85a2e", hint:"Fe(OH)₃ — kết tủa nâu đỏ."}
    ];
    var initialized=false;
    function reset(){ render(); }
    function render(){
      var grid = $("#exp2-grid"); if(!grid) return;
      grid.innerHTML = "";
      SALTS.forEach(function(s, i){
        var btn = document.createElement("button");
        btn.className = "salt-btn";
        btn.textContent = s.f;
        btn.addEventListener("click", function(){ drop(i, btn); });
        grid.appendChild(btn);
      });
      var msg=$("#exp2-msg"); if(msg) msg.innerHTML = "Bấm vào một muối để thử thả vào nước.";
      var water=$("#exp2-water"); if(water) water.innerHTML = "";
    }
    function drop(i, btn){
      var s = SALTS[i];
      btn.disabled = true;
      var water = $("#exp2-water"); if(!water) return;
      var grain = document.createElement("div");
      grain.className = "exp2-grain";
      grain.textContent = s.f;
      water.appendChild(grain);
      setTimeout(function(){
        var msg=$("#exp2-msg");
        if(s.soluble){
          grain.classList.add("dissolve");
          if(msg) msg.innerHTML = "<strong>"+s.f+"</strong> tan tốt trong nước. "+s.hint;
        } else {
          grain.classList.add("precipitate");
          if(s.color) grain.style.background = s.color;
          if(msg) msg.innerHTML = "<strong>"+s.f+"</strong> KHÔNG tan — tạo <strong>kết tủa</strong>. "+s.hint;
        }
      }, 400);
    }
    function init(){
      if(initialized) return;
      var rs=$("#exp2-reset");
      if(rs) rs.addEventListener("click", reset);
      initialized = true;
    }
    function start(){ init(); reset(); }
    return {init:init, start:start};
  })();

  /* =========== EXP 3: Acid + Metal (Zn + HCl) =========== */
  var AcidMetal = (function(){
    var bubbleTimer=null, bubbleCount=0, initialized=false;
    function reset(){
      stopBubbles(); bubbleCount=0;
      var t=$("#exp3-tube"); if(t) t.classList.remove("started");
      var b=$("#exp3-bubbles"); if(b) b.innerHTML = "";
      var az=$("#exp3-add-zn"); if(az) az.disabled = false;
      var msg=$("#exp3-msg"); if(msg) msg.innerHTML = "Bắt đầu: ống nghiệm chứa <strong>dung dịch HCl loãng</strong>. Bấm <em>Thả viên Zn</em> để bắt đầu phản ứng.";
    }
    function addZinc(){
      var t=$("#exp3-tube"); if(t) t.classList.add("started");
      var az=$("#exp3-add-zn"); if(az) az.disabled = true;
      var msg=$("#exp3-msg"); if(msg) msg.innerHTML = 'Thả <strong>viên kẽm (Zn)</strong> vào HCl. Phản ứng tạo bọt khí <strong>H₂</strong> không màu, không mùi. Phương trình: <em>Zn + 2HCl → ZnCl₂ + H₂↑</em>.';
      startBubbles();
    }
    function startBubbles(){
      bubbleTimer = setInterval(function(){
        var layer = $("#exp3-bubbles"); if(!layer) return;
        var b = document.createElement("div");
        b.className = "exp3-bubble";
        b.style.left = (10 + Math.random()*80) + "%";
        b.style.width = (6 + Math.random()*10) + "px";
        b.style.height = b.style.width;
        b.style.animationDuration = (1.5 + Math.random()*1.5) + "s";
        layer.appendChild(b);
        setTimeout(function(){ b.remove(); }, 3000);
        bubbleCount++;
        if(bubbleCount > 30) stopBubbles();
      }, 200);
    }
    function stopBubbles(){ if(bubbleTimer){ clearInterval(bubbleTimer); bubbleTimer=null; } }
    function init(){
      if(initialized) return;
      var az=$("#exp3-add-zn"), rs=$("#exp3-reset");
      if(az) az.addEventListener("click", addZinc);
      if(rs) rs.addEventListener("click", reset);
      initialized = true;
    }
    function start(){ init(); reset(); }
    return {init:init, start:start};
  })();

  return { exp1: AcidBase, exp2: Solubility, exp3: AcidMetal };
})();


/* ============= DEFENSIVE SELF-BIND =============
 * This runs regardless of app.js. When the user clicks an experiment tile,
 * we call start() ourselves (after a short delay to let the screen change).
 * Idempotent: each experiment's init() guards itself, so duplicate calls
 * are safe. This makes the site resilient even if app.js wasn't updated.
 */
(function(){
  function bindTiles(){
    var tiles = document.querySelectorAll('.tile[data-target^="exp"]');
    Array.prototype.forEach.call(tiles, function(tile){
      tile.addEventListener("click", function(){
        var name = tile.getAttribute("data-target");
        if (window.EXPERIMENTS && window.EXPERIMENTS[name] && window.EXPERIMENTS[name].start) {
          setTimeout(function(){ window.EXPERIMENTS[name].start(); }, 60);
        }
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindTiles);
  } else {
    bindTiles();
  }
})();
