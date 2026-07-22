(function () {
    'use strict';
 var BEST_KEY = 'reactAlarm.bestMs';
  var IGNORED_KEYS = ['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape'];
  var COUNT_STEP_MS = 800;
 
  var body = document.body;
  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
 
  var startBtn = document.getElementById('startBtn');
  var retryBtn = document.getElementById('retryBtn');
 
  var countDigitEl = document.getElementById('countDigit');
  var liveTimerEl = document.getElementById('liveTimer');
  var resultValEl = document.getElementById('resultVal');
  var resultTagEl = document.getElementById('resultTag');
  var verdictTextEl = document.getElementById('verdictText');
  var bestValEl = document.getElementById('bestVal');
  var bestValResultEl = document.getElementById('bestValResult');
 
  var state = 'start';
  var countdownTimer = null;
  var rafId = null;
  var startTime = 0;
  var bestMs = loadBest();
function loadBest() {
    try {
      var raw = localStorage.getItem(BEST_KEY);
      return raw ? Number(raw) : null;
    } catch (e) {
      return null;
    }
  }
 
  function saveBest(ms) {
    try {
      localStorage.setItem(BEST_KEY, String(ms));
    } catch (e) {
      /* localStorage unavailable — best time just won't persist */
    }
  }
 
    
function updateBestDisplay() {
    var text = bestMs === null ? 'no record yet' : bestMs + ' ms';
    bestValEl.textContent = text;
    bestValResultEl.textContent = text;
  }
 
  function popAnimate(el) {
    el.classList.remove('pop');
    void el.offsetWidth; /* force reflow so the animation restarts */
    el.classList.add('pop');
  }
 
  function formatMs(ms) {
    return String(Math.max(0, Math.round(ms))).padStart(4, '0');
  }
 
  function setState(next) {
    state = next;
    body.dataset.state = next;
    views.forEach(function (view) {
      view.hidden = view.dataset.view !== next;
    });
  }
 
  function verdictFor(ms) {
    if (ms < 180) return 'Inhuman. Are you even blinking?';
    if (ms < 250) return 'Sharp. Real sharp.';
    if (ms < 330) return 'Solid. Respectable reflexes.';
    if (ms < 450) return 'Average. Coffee might help.';
    return '\u2026did you fall asleep?';
  }
 
  function beginRun() {
    clearTimeout(countdownTimer);
    cancelAnimationFrame(rafId);
    setState('countdown');
    runCountdown(3);
  }
 
  function runCountdown(n) {
    countDigitEl.textContent = String(n);
    popAnimate(countDigitEl);
    if (n > 1) {
      countdownTimer = setTimeout(function () { runCountdown(n - 1); }, COUNT_STEP_MS);
    } else {
      countdownTimer = setTimeout(startReacting, COUNT_STEP_MS);
    }
  }
function startReacting() {
    setState('reacting');
    startTime = performance.now();
    liveTimerEl.textContent = '0000';
    tickTimer();
  }
 
  function tickTimer() {
    var elapsed = performance.now() - startTime;
    liveTimerEl.textContent = formatMs(elapsed);
    rafId = requestAnimationFrame(tickTimer);
  }
 
  function stopReacting() {
    if (state !== 'reacting') return;
    cancelAnimationFrame(rafId);
    var elapsed = performance.now() - startTime;
    showResult(elapsed);
  }
 
  function showResult(ms) {
    setState('result');
    var rounded = Math.round(ms);
    resultValEl.textContent = String(rounded);
    verdictTextEl.textContent = verdictFor(rounded);
 
    var isRecord = bestMs === null || rounded < bestMs;
    if (isRecord) {
      bestMs = rounded;
      saveBest(rounded);
      resultTagEl.hidden = false;
      popAnimate(resultTagEl);
    } else {
      resultTagEl.hidden = true;
    }
    updateBestDisplay();
  }
 
  startBtn.addEventListener('click', beginRun);
  retryBtn.addEventListener('click', beginRun);
 
  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest && e.target.closest('button')) return;
    if (state === 'reacting') stopReacting();
  });
document.addEventListener('keydown', function (e) {
    if (IGNORED_KEYS.indexOf(e.key) !== -1) return;
    if (e.target.closest && e.target.closest('button')) return;
    if (state === 'reacting') { e.preventDefault(); stopReacting(); }
    else if (state === 'start' || state === 'result') { e.preventDefault(); beginRun(); }
  });



   updateBestDisplay();
  setState('start');
})();

   
  
  




