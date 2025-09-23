// シンプル・堅牢なポモドーロ
const els = {
  clock:  document.getElementById("clock"),
  phase:  document.getElementById("phase"),
  start:  document.getElementById("start"),
  pause:  document.getElementById("pause"),
  reset:  document.getElementById("reset"),
  work:   document.getElementById("workMins"),
  short:  document.getElementById("shortMins"),
  long:   document.getElementById("longMins"),
  every:  document.getElementById("longEvery"),
  count:  document.getElementById("count"),
  cycle:  document.getElementById("cycle"),
  ding:   document.getElementById("ding"),
};

let state = {
  mode: "work",         // "work" | "short" | "long"
  remaining: 25*60,     // 秒
  running: false,
  intervalId: null,
  pomodoros: 0,
  shortBreaks: 0,
};

function secToMMSS(sec){
  const m = Math.floor(sec/60).toString().padStart(2,"0");
  const s = Math.floor(sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function currentTargetSeconds(){
  const {work, short, long} = els;
  return state.mode === "work"
    ? Number(work.value||25)*60
    : state.mode === "short"
      ? Number(short.value||5)*60
      : Number(long.value||15)*60;
}

function setMode(mode){
  state.mode = mode;
  state.remaining = currentTargetSeconds();
  document.body.classList.toggle("break", mode !== "work");
  document.body.classList.toggle("running", state.running);
  els.phase.textContent = mode === "work" ? "作業" : (mode === "short" ? "短い休憩" : "長い休憩");
  els.cycle.textContent = els.phase.textContent;
  render();
}

function tick(){
  if(!state.running) return;
  state.remaining -= 1;
  if(state.remaining <= 0){
    // フェーズ終了
    try{ els.ding && els.ding.play && els.ding.play(); }catch{}
    if(state.mode === "work"){
      state.pomodoros += 1;
      const every = Math.max(2, Number(els.every.value||4));
      // 規定回数ごとに長休憩
      setMode( (state.pomodoros % every === 0) ? "long" : "short" );
    }else{
      // 休憩の後は常に作業へ
      setMode("work");
    }
    saveProgress();
  }
  render();
}

function start(){
  if(state.running) return;
  state.running = true;
  document.body.classList.add("running");
  state.intervalId = setInterval(tick, 1000);
  render();
}
function pause(){
  state.running = false;
  document.body.classList.remove("running");
  clearInterval(state.intervalId);
  render();
}
function reset(){
  pause();
  state.remaining = currentTargetSeconds();
  render();
}

function render(){
  els.clock.textContent = secToMMSS(state.remaining);
  els.count.textContent = state.pomodoros;
}

function saveProgress(){
  localStorage.setItem("pomodoro-progress", JSON.stringify({
    pomodoros: state.pomodoros,
    last: Date.now(),
  }));
}
function loadProgress(){
  try{
    const data = JSON.parse(localStorage.getItem("pomodoro-progress"));
    if(data && typeof data.pomodoros === "number"){
      state.pomodoros = data.pomodoros;
    }
  }catch{}
}

// イベント
els.start.addEventListener("click", start);
els.pause.addEventListener("click", pause);
els.reset.addEventListener("click", reset);
[els.work, els.short, els.long].forEach(input=>{
  input.addEventListener("change", ()=>{
    if(!state.running){ state.remaining = currentTargetSeconds(); render(); }
  });
});

// 初期化
loadProgress();
setMode("work");
