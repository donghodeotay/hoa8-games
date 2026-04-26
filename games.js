/* games.js — Quiz, Classify, Match, Balance, pH games */
window.GAMES = (function(){
  var $=window.APP.$, $$=window.APP.$$, richText=window.APP.richText, wrap=window.APP.wrap, escapeHtml=window.APP.escapeHtml;

  /* ============================ 1. QUIZ ============================ */
  var Quiz = (function(){
    var qs=[], answers=[], locked=[], correctCount=0, currentIdx=0;
    function shuffle(arr){
      for(var i=arr.length-1;i>0;i--){
        var j=Math.floor(Math.random()*(i+1));
        var t=arr[i]; arr[i]=arr[j]; arr[j]=t;
      }
      return arr;
    }
    function start(){
      qs = shuffle((window.QUIZ_QUESTIONS||[]).slice());
      answers = qs.map(function(){ return -1; });
      locked  = qs.map(function(){ return false; });
      correctCount = 0;
      render();
      updateStat();
    }
    function render(){
      var box = $("#quiz-box");
      box.innerHTML = "";
      qs.forEach(function(q, qi){
        var qEl = document.createElement("div");
        qEl.className = "question";
        qEl.setAttribute("data-qi", qi);
        var letters=["A","B","C","D"];
        var optsHtml = q.options.map(function(op, oi){
          return '<div class="option" data-oi="'+oi+'"><span class="option-letter">'+letters[oi]+'</span><span class="option-text"></span></div>';
        }).join("");
        qEl.innerHTML =
          '<div class="q-header"><span class="q-num">'+(qi+1)+'</span><span class="q-text"></span></div>'+
          '<div class="options">'+optsHtml+'</div>'+
          '<div class="feedback"><div class="feedback-title"></div><div class="feedback-body"></div></div>';
        richText($(".q-text", qEl), q.q);
        $$(".option", qEl).forEach(function(optEl, oi){
          richText($(".option-text", optEl), q.options[oi]);
          optEl.addEventListener("click", function(e){
            if(e.target.closest(".term, .term-common")) return;
            answer(qi, oi);
          });
        });
        box.appendChild(qEl);
      });
    }
    function answer(qi, oi){
      if(locked[qi]) return;
      answers[qi]=oi; locked[qi]=true;
      var q=qs[qi];
      var qEl=$('.question[data-qi="'+qi+'"]', $("#quiz-box"));
      $$(".option", qEl).forEach(function(optEl, k){
        optEl.classList.add("locked");
        if(k===q.correct) optEl.classList.add("correct");
        else if(k===oi)   optEl.classList.add("wrong");
      });
      var fb=$(".feedback", qEl);
      var ok=oi===q.correct;
      fb.classList.add("show");
      fb.classList.toggle("correct", ok);
      fb.classList.toggle("wrong", !ok);
      var head=ok?"✓ Chính xác!":"✗ Chưa đúng. Đáp án đúng: "+["A","B","C","D"][q.correct]+".";
      $(".feedback-title", qEl).textContent=head;
      richText($(".feedback-body", qEl), q.explanation);
      if(ok) correctCount++;
      updateStat();
    }
    function updateStat(){
      var answered = locked.filter(Boolean).length;
      $("#quiz-progress").textContent=answered+"/"+qs.length;
      $("#quiz-score").textContent=correctCount;
    }
    function init(){
      $("#quiz-restart").addEventListener("click", function(){ start(); });
    }
    return {init:init, start:start};
  })();

  /* ============================ 2. CLASSIFY (drag-drop) ============================ */
  var Classify = (function(){
    var items=[], placed={}, score=0;
    function shuffle(arr){
      for(var i=arr.length-1;i>0;i--){
        var j=Math.floor(Math.random()*(i+1));
        var t=arr[i]; arr[i]=arr[j]; arr[j]=t;
      }
      return arr;
    }
    function start(){
      items = shuffle((window.CLASSIFY_ITEMS||[]).slice());
      placed = {}; score = 0;
      render();
      updateScore();
    }
    function render(){
      var pool = $("#classify-pool");
      pool.innerHTML = "";
      items.forEach(function(it, i){
        var card = document.createElement("div");
        card.className = "drag-card";
        card.setAttribute("draggable","true");
        card.setAttribute("data-i", i);
        card.setAttribute("data-cat", it.category);
        card.textContent = it.formula;
        card.addEventListener("dragstart", function(e){
          e.dataTransfer.setData("text/plain", i);
          card.classList.add("dragging");
        });
        card.addEventListener("dragend", function(){ card.classList.remove("dragging"); });
        /* Touch support: tap to "pick" */
        card.addEventListener("click", function(){
          $$(".drag-card.picked").forEach(function(c){ if(c!==card) c.classList.remove("picked"); });
          card.classList.toggle("picked");
        });
        pool.appendChild(card);
      });
      var bins = $("#classify-bins");
      bins.innerHTML = "";
      (window.CLASSIFY_CATEGORIES||[]).forEach(function(cat){
        var bin = document.createElement("div");
        bin.className = "drop-bin";
        bin.setAttribute("data-cat", cat.id);
        bin.style.borderColor = cat.color;
        bin.innerHTML =
          '<div class="bin-head" style="color:'+cat.color+'"><strong>'+cat.label+'</strong><span class="bin-desc">'+cat.desc+'</span></div>'+
          '<div class="bin-items"></div>';
        bin.addEventListener("dragover", function(e){ e.preventDefault(); bin.classList.add("hovering"); });
        bin.addEventListener("dragleave", function(){ bin.classList.remove("hovering"); });
        bin.addEventListener("drop", function(e){
          e.preventDefault(); bin.classList.remove("hovering");
          var i = e.dataTransfer.getData("text/plain");
          dropItem(parseInt(i, 10), cat.id, bin);
        });
        bin.addEventListener("click", function(){
          var picked = $(".drag-card.picked", $("#classify-pool"));
          if(!picked) return;
          dropItem(parseInt(picked.getAttribute("data-i"), 10), cat.id, bin);
          picked.classList.remove("picked");
        });
        bins.appendChild(bin);
      });
    }
    function dropItem(i, catId, bin){
      var it = items[i];
      if(!it || placed[i]) return;
      var ok = it.category === catId;
      placed[i] = ok;
      var card = $('.drag-card[data-i="'+i+'"]', $("#classify-pool"));
      var binItems = $(".bin-items", bin);
      var dropped = document.createElement("div");
      dropped.className = "drop-item " + (ok?"correct":"wrong");
      dropped.textContent = it.formula + (ok?" ✓":" ✗");
      binItems.appendChild(dropped);
      if(card){
        if(ok){
          card.remove();
        } else {
          /* Wrong: show in bin briefly then return to pool */
          setTimeout(function(){
            dropped.remove();
            placed[i] = undefined;
            card.classList.add("flash-wrong");
            setTimeout(function(){ card.classList.remove("flash-wrong"); }, 600);
          }, 1200);
        }
      }
      if(ok) score++;
      updateScore();
      checkDone();
    }
    function updateScore(){
      $("#classify-score").textContent = score + "/" + items.length;
    }
    function checkDone(){
      if(score===items.length){
        $("#classify-done").classList.add("show");
      }
    }
    function init(){
      $("#classify-restart").addEventListener("click", function(){
        $("#classify-done").classList.remove("show");
        start();
      });
    }
    return {init:init, start:start};
  })();

  /* ============================ 3. MEMORY MATCH ============================ */
  var Match = (function(){
    var cards=[], flipped=[], matched=[], moves=0, startedAt=0;
    function shuffle(arr){
      for(var i=arr.length-1;i>0;i--){
        var j=Math.floor(Math.random()*(i+1));
        var t=arr[i]; arr[i]=arr[j]; arr[j]=t;
      }
      return arr;
    }
    function start(){
      var pairs = (window.MATCH_PAIRS||[]).slice();
      cards = [];
      pairs.forEach(function(p, i){
        cards.push({face:p.a, group:i});
        cards.push({face:p.b, group:i});
      });
      shuffle(cards);
      flipped = []; matched = []; moves = 0; startedAt = Date.now();
      render();
      updateStat();
    }
    function render(){
      var grid = $("#match-grid");
      grid.innerHTML = "";
      cards.forEach(function(c, i){
        var card = document.createElement("div");
        card.className = "memo-card";
        card.setAttribute("data-i", i);
        card.innerHTML = '<div class="memo-front">?</div><div class="memo-back">'+escapeHtml(c.face)+'</div>';
        card.addEventListener("click", function(){ flip(i); });
        grid.appendChild(card);
      });
    }
    function flip(i){
      if(matched.indexOf(i)>=0) return;
      if(flipped.indexOf(i)>=0) return;
      if(flipped.length>=2) return;
      var card = $('.memo-card[data-i="'+i+'"]', $("#match-grid"));
      card.classList.add("flipped");
      flipped.push(i);
      if(flipped.length===2){
        moves++;
        updateStat();
        var a=flipped[0], b=flipped[1];
        if(cards[a].group===cards[b].group){
          matched.push(a); matched.push(b);
          setTimeout(function(){
            $('.memo-card[data-i="'+a+'"]', $("#match-grid")).classList.add("matched");
            $('.memo-card[data-i="'+b+'"]', $("#match-grid")).classList.add("matched");
            flipped = [];
            if(matched.length===cards.length) finish();
          }, 400);
        } else {
          setTimeout(function(){
            $('.memo-card[data-i="'+a+'"]', $("#match-grid")).classList.remove("flipped");
            $('.memo-card[data-i="'+b+'"]', $("#match-grid")).classList.remove("flipped");
            flipped = [];
          }, 1000);
        }
      }
    }
    function updateStat(){
      $("#match-moves").textContent = moves;
      var sec = Math.floor((Date.now()-startedAt)/1000);
      $("#match-time").textContent = Math.floor(sec/60).toString().padStart(2,"0")+":"+(sec%60).toString().padStart(2,"0");
    }
    function finish(){
      var sec = Math.floor((Date.now()-startedAt)/1000);
      $("#match-done").classList.add("show");
      $("#match-summary").textContent = "Hoàn thành! "+moves+" lượt lật, "+sec+" giây.";
    }
    var timer=null;
    function startTimer(){
      stopTimer();
      timer = setInterval(updateStat, 500);
    }
    function stopTimer(){ if(timer){ clearInterval(timer); timer=null; } }
    function init(){
      $("#match-restart").addEventListener("click", function(){
        $("#match-done").classList.remove("show");
        start(); startTimer();
      });
      var origStart = start;
      start = function(){ origStart(); startTimer(); };
    }
    return {init:init, start:function(){ start(); startTimer(); }};
  })();

  /* ============================ 4. BALANCE EQUATIONS ============================ */
  var Balance = (function(){
    var idx=0, equations=[], correctTotal=0;
    function start(){
      equations = (window.BALANCE_EQUATIONS||[]).slice();
      idx = 0; correctTotal = 0;
      render();
    }
    function render(){
      var eq = equations[idx];
      var box = $("#balance-eq");
      box.innerHTML = "";
      if(!eq){
        $("#balance-feedback").innerHTML = '<strong>Hoàn thành!</strong> Bạn cân bằng đúng '+correctTotal+'/'+equations.length+' phương trình.';
        $("#balance-feedback").className = "feedback show correct";
        $("#balance-check").style.display = "none";
        $("#balance-next").style.display = "none";
        return;
      }
      $("#balance-check").style.display = "";
      $("#balance-next").style.display = "none";
      eq.terms.forEach(function(term, i){
        if(i>0){
          var sep = document.createElement("span");
          sep.className = "eq-sep";
          /* Heuristic: assume reactants come before product. The split point is len(coeffs reactant side); we infer from equation note that products appear after some reactant count. Instead, use a flag by structure: we'll let user input on every term, and place the arrow between halves at the data-defined boundary. */
          /* Simple approach: place arrow before first product. We mark that as `eq.arrowAt` if present. Default = ceil(terms/2). Better: derive arrowAt from data. */
          if(eq.arrowAt && i===eq.arrowAt) sep.textContent = " → ";
          else sep.textContent = " + ";
          box.appendChild(sep);
        }
        var slot = document.createElement("span");
        slot.className = "eq-term";
        var inp = document.createElement("input");
        inp.type = "number";
        inp.min = "1"; inp.max = "20"; inp.step = "1";
        inp.value = "";
        inp.placeholder = "?";
        inp.className = "coeff-input";
        inp.setAttribute("data-i", i);
        slot.appendChild(inp);
        var f = document.createElement("span");
        f.className = "eq-formula";
        f.innerHTML = escapeHtml(term.f);
        slot.appendChild(f);
        box.appendChild(slot);
      });
      $("#balance-feedback").className = "feedback";
      $("#balance-feedback").innerHTML = "";
      $("#balance-progress").textContent = "Câu "+(idx+1)+"/"+equations.length;
      $("#balance-note").textContent = eq.note || "";
    }
    function check(){
      var eq = equations[idx];
      var inputs = $$(".coeff-input", $("#balance-eq"));
      var vals = inputs.map(function(inp){ return parseInt(inp.value || "0", 10); });
      var ok = true;
      for(var i=0;i<eq.coeffs.length;i++){
        if(vals[i] !== eq.coeffs[i]){ ok = false; break; }
      }
      var fb = $("#balance-feedback");
      fb.classList.add("show");
      if(ok){
        fb.classList.add("correct"); fb.classList.remove("wrong");
        fb.innerHTML = "<strong>✓ Chính xác!</strong> "+(eq.note||"");
        correctTotal++;
        $("#balance-check").style.display = "none";
        $("#balance-next").style.display = "";
      } else {
        fb.classList.add("wrong"); fb.classList.remove("correct");
        fb.innerHTML = "<strong>✗ Chưa đúng.</strong> Hệ số đúng: "+eq.coeffs.join(", ");
        $("#balance-check").style.display = "none";
        $("#balance-next").style.display = "";
      }
    }
    function next(){
      idx++; render();
    }
    function init(){
      $("#balance-check").addEventListener("click", check);
      $("#balance-next").addEventListener("click", next);
      $("#balance-restart").addEventListener("click", function(){
        start();
      });
    }
    return {init:init, start:start};
  })();

  /* ============================ 5. pH SCALE ============================ */
  var PH = (function(){
    var items=[], placed={}, score=0;
    function shuffle(arr){
      for(var i=arr.length-1;i>0;i--){
        var j=Math.floor(Math.random()*(i+1));
        var t=arr[i]; arr[i]=arr[j]; arr[j]=t;
      }
      return arr;
    }
    function start(){
      items = shuffle((window.PH_ITEMS||[]).slice());
      placed = {}; score = 0;
      render();
      updateScore();
    }
    function render(){
      var pool = $("#ph-pool");
      pool.innerHTML = "";
      items.forEach(function(it, i){
        var card = document.createElement("div");
        card.className = "drag-card ph-card";
        card.setAttribute("draggable","true");
        card.setAttribute("data-i", i);
        card.textContent = it.name;
        card.addEventListener("dragstart", function(e){ e.dataTransfer.setData("text/plain", i); card.classList.add("dragging"); });
        card.addEventListener("dragend", function(){ card.classList.remove("dragging"); });
        card.addEventListener("click", function(){
          $$(".drag-card.picked").forEach(function(c){ if(c!==card) c.classList.remove("picked"); });
          card.classList.toggle("picked");
        });
        pool.appendChild(card);
      });
      var scale = $("#ph-scale");
      scale.innerHTML = "";
      for(var p=1; p<=14; p++){
        (function(ph){
          var slot = document.createElement("div");
          slot.className = "ph-slot";
          slot.setAttribute("data-ph", ph);
          slot.innerHTML = '<div class="ph-num">'+ph+'</div><div class="ph-drop"></div>';
          slot.style.background = phColor(ph);
          slot.addEventListener("dragover", function(e){ e.preventDefault(); slot.classList.add("hovering"); });
          slot.addEventListener("dragleave", function(){ slot.classList.remove("hovering"); });
          slot.addEventListener("drop", function(e){
            e.preventDefault(); slot.classList.remove("hovering");
            var i = e.dataTransfer.getData("text/plain");
            dropAt(parseInt(i, 10), ph, slot);
          });
          slot.addEventListener("click", function(){
            var picked = $(".drag-card.picked", $("#ph-pool"));
            if(!picked) return;
            dropAt(parseInt(picked.getAttribute("data-i"), 10), ph, slot);
            picked.classList.remove("picked");
          });
          scale.appendChild(slot);
        })(p);
      }
    }
    function phColor(ph){
      /* red (acid) -> green (neutral) -> blue (base) */
      if(ph<=7){
        var t=(ph-1)/6;
        var r=Math.round(220-(220-22)*t), g=Math.round(80+(190-80)*t), b=Math.round(80+(120-80)*t);
        return "rgb("+r+","+g+","+b+")";
      } else {
        var t=(ph-7)/7;
        var r=Math.round(22+(60-22)*t), g=Math.round(190-(190-90)*t), b=Math.round(120+(220-120)*t);
        return "rgb("+r+","+g+","+b+")";
      }
    }
    function dropAt(i, ph, slot){
      var it = items[i]; if(!it || placed[i]) return;
      var ok = it.ph === ph;
      placed[i] = ok;
      var card = $('.drag-card[data-i="'+i+'"]', $("#ph-pool"));
      var dropZone = $(".ph-drop", slot);
      var chip = document.createElement("div");
      chip.className = "ph-chip "+(ok?"correct":"wrong");
      chip.textContent = it.name + (ok?" ✓":" ✗ ("+it.ph+")");
      dropZone.appendChild(chip);
      if(card){
        if(ok){ card.remove(); }
        else {
          setTimeout(function(){
            chip.remove(); placed[i]=undefined;
            card.classList.add("flash-wrong");
            setTimeout(function(){ card.classList.remove("flash-wrong"); }, 600);
          }, 1500);
        }
      }
      if(ok) score++;
      updateScore();
    }
    function updateScore(){ $("#ph-score").textContent = score+"/"+items.length; }
    function init(){
      $("#ph-restart").addEventListener("click", start);
    }
    return {init:init, start:start};
  })();

  return {
    quiz: Quiz, classify: Classify, match: Match, balance: Balance, ph: PH
  };
})();
