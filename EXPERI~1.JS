/* experiments.js — 3 interactive demos: Acid-Base, Solubility, Acid+Metal. */
window.EXPERIMENTS = (function(){
  var $=window.APP.$, $$=window.APP.$$;

  /* =========== EXP 1: NaOH + phenolphthalein + HCl =========== */
  var AcidBase = (function(){
    var hasIndicator=false, hclDrops=0, totalMaxDrops=10;
    /* Initial: NaOH 0.1 M (10 mL) — pH ~13, clear.
       Add phenolphthalein → pink (pH > 8.3).
       Each HCl drop neutralizes some NaOH; after all drops, pH ~7-3, color back to clear. */
    function reset(){
      hasIndicator=false; hclDrops=0;
      $("#exp1-tube").classList.remove("pink");
      $("#exp1-tube").classList.remove("clear");
      $("#exp1-add-ind").disabled = false;
      $("#exp1-add-hcl").disabled = true;
      $("#exp1-msg").innerHTML = "Bắt đầu: ống nghiệm chứa <strong>10 mL dung dịch NaOH 0,1M</strong>.";
      updatePH();
    }
    function addIndicator(){
      hasIndicator=true;
      $("#exp1-tube").classList.add("pink");
      $("#exp1-add-ind").disabled = true;
      $("#exp1-add-hcl").disabled = false;
      $("#exp1-msg").innerHTML = "Thêm vài giọt <strong>phenolphtalein</strong> → dung dịch chuyển <span style=\"color:#d83a7c;font-weight:600\">màu hồng</span> (môi trường base).";
      updatePH();
    }
    function addHcl(){
      hclDrops++;
      if(hclDrops>=totalMaxDrops){
        $("#exp1-tube").classList.remove("pink");
        $("#exp1-tube").classList.add("clear");
        $("#exp1-add-hcl").disabled = true;
        $("#exp1-msg").innerHTML = "Đã thêm đủ HCl: dung dịch trở lại <strong>không màu</strong>. Phương trình: <em>NaOH + HCl → NaCl + H₂O</em>.";
      } else {
        $("#exp1-msg").innerHTML = "Thêm giọt HCl thứ <strong>"+hclDrops+"</strong>. Phản ứng đang trung hòa từ từ…";
      }
      /* Animate a drop */
      var drop = document.createElement("div");
      drop.className = "exp1-drop";
      $("#exp1-stage").appendChild(drop);
      setTimeout(function(){ drop.remove(); }, 800);
      updatePH();
    }
    function updatePH(){
      var ph;
      if(!hasIndicator) ph = 13;
      else if(hclDrops < totalMaxDrops/2) ph = 13 - hclDrops*0.7;
      else ph = Math.max(2, 9.5 - (hclDrops - totalMaxDrops/2)*1.2);
      ph = Math.round(ph*10)/10;
      $("#exp1-ph-val").textContent = ph.toFixed(1);
      var pct = (ph-1)/13 * 100;
      $("#exp1-ph-mark").style.left = Math.max(0, Math.min(100, pct)) + "%";
    }
    function init(){
      $("#exp1-add-ind").addEventListener("click", addIndicator);
      $("#exp1-add-hcl").addEventListener("click", addHcl);
      $("#exp1-reset").addEventListener("click", reset);
    }
    return {init:init, start:reset};
  })();

  /* =========== EXP 2: Solubility — drop salts into water =========== */
  var Solubility = (function(){
    var SALTS = [
      {f:"NaCl", soluble:true,  hint:"Tất cả muối Na đều tan."},
      {f:"KNO₃", soluble:true,  hint:"Tất cả muối nitrate (NO₃⁻) đều tan."},
      {f:"BaSO₄", soluble:false, color:"#ffffff", hint:"BaSO₄ — kết tủa trắng, không tan."},
      {f:"CaCO₃", soluble:false, color:"#f0f0f0", hint:"Đá vôi không tan trong nước thường."},
      {f:"AgCl",  soluble:false, color:"#ffffff", hint:"AgCl — kết tủa trắng đặc trưng."},
      {f:"CuSO₄", soluble:true,  hint:"CuSO₄ tan, dung dịch màu xanh lam."},
      {f:"PbI₂",  soluble:false, color:"#ffd54f", hint:"PbI₂ — kết tủa vàng tươi."},
      {f:"Fe(OH)₃", soluble:false, color:"#a85a2e", hint:"Fe(OH)₃ — kết tủa nâu đỏ."}
    ];
    var idx=0;
    function reset(){ idx=0; render(); }
    function render(){
      var grid = $("#exp2-grid");
      grid.innerHTML = "";
      SALTS.forEach(function(s, i){
        var btn = document.createElement("button");
        btn.className = "salt-btn";
        btn.textContent = s.f;
        btn.addEventListener("click", function(){ drop(i, btn); });
        grid.appendChild(btn);
      });
      $("#exp2-msg").innerHTML = "Bấm vào một muối để thử thả vào nước.";
      $("#exp2-water").innerHTML = '<div class="exp2-water-fill"></div>';
    }
    function drop(i, btn){
      var s = SALTS[i];
      btn.disabled = true;
      var water = $("#exp2-water");
      var grain = document.createElement("div");
      grain.className = "exp2-grain";
      grain.textContent = s.f;
      water.appendChild(grain);
      setTimeout(function(){
        if(s.soluble){
          grain.classList.add("dissolve");
          $("#exp2-msg").innerHTML = "<strong>"+s.f+"</strong> tan tốt trong nước. "+s.hint;
        } else {
          grain.classList.add("precipitate");
          if(s.color) grain.style.background = s.color;
          $("#exp2-msg").innerHTML = "<strong>"+s.f+"</strong> KHÔNG tan — tạo <strong>kết tủa</strong>. "+s.hint;
        }
      }, 400);
    }
    function init(){
      $("#exp2-reset").addEventListener("click", reset);
    }
    return {init:init, start:reset};
  })();

  /* =========== EXP 3: Acid + Metal (Zn + HCl) =========== */
  var AcidMetal = (function(){
    var bubbleTimer=null, bubbleCount=0;
    function reset(){
      stopBubbles();
      bubbleCount=0;
      $("#exp3-tube").classList.remove("started");
      $("#exp3-bubbles").innerHTML = "";
      $("#exp3-add-zn").disabled = false;
      $("#exp3-msg").innerHTML = "Bắt đầu: ống nghiệm chứa <strong>dung dịch HCl loãng</strong>.";
    }
    function addZinc(){
      $("#exp3-tube").classList.add("started");
      $("#exp3-add-zn").disabled = true;
      $("#exp3-msg").innerHTML = 'Thả <strong>viên kẽm (Zn)</strong> vào HCl. Phản ứng tạo bọt khí <strong>H₂</strong> không màu, không mùi. Phương trình: <em>Zn + 2HCl → ZnCl₂ + H₂↑</em>.';
      startBubbles();
    }
    function startBubbles(){
      bubbleTimer = setInterval(function(){
        var b = document.createElement("div");
        b.className = "exp3-bubble";
        b.style.left = (10 + Math.random()*80) + "%";
        b.style.width = (6 + Math.random()*10) + "px";
        b.style.height = b.style.width;
        b.style.animationDuration = (1.5 + Math.random()*1.5) + "s";
        $("#exp3-bubbles").appendChild(b);
        setTimeout(function(){ b.remove(); }, 3000);
        bubbleCount++;
        if(bubbleCount > 30) stopBubbles();
      }, 200);
    }
    function stopBubbles(){
      if(bubbleTimer){ clearInterval(bubbleTimer); bubbleTimer=null; }
    }
    function init(){
      $("#exp3-add-zn").addEventListener("click", addZinc);
      $("#exp3-reset").addEventListener("click", reset);
    }
    return {init:init, start:reset};
  })();

  return { exp1: AcidBase, exp2: Solubility, exp3: AcidMetal };
})();

/* Hook into the same routing system as games */
(function(){
  var origInit;
  /* Wait for app.js to set up window.APP, then add experiment screens to its routing */
  window.addEventListener("DOMContentLoaded", function(){
    /* Initialize each experiment's bindings */
    Object.keys(window.EXPERIMENTS).forEach(function(k){
      if(window.EXPERIMENTS[k].init) window.EXPERIMENTS[k].init();
    });
  });
})();
