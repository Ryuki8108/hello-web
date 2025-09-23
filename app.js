// ====== 永続化 ======
const STORAGE_KEY = "todo-items-v1";

function loadItems(){
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch(e){
    console.warn("storage parse error", e);
    return [];
  }
}
function saveItems(items){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ====== データとDOM ======
let items = loadItems(); // { id, title, due(YYYY-MM-DD|null), done }

const form = document.getElementById("addForm");
const input = document.getElementById("taskInput");
const dueInput = document.getElementById("dueInput");
const list = document.getElementById("taskList");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if(!title) return;
  const due = dueInput.value || null;
  items.push({ id: crypto.randomUUID(), title, due, done:false });
  saveItems(items);
  input.value = "";
  dueInput.value = "";
  render();
});

// ====== ユーティリティ ======
function classifyDue(dueStr){
  // return: "overdue" | "today" | "soon" | "ok" | null
  if(!dueStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dueStr); due.setHours(0,0,0,0);

  const diffDays = Math.round( (due - today) / (1000*60*60*24) );

  if(diffDays < 0) return "overdue";
  if(diffDays === 0) return "today";
  if(diffDays <= 3) return "soon";
  return "ok";
}

function formatDate(dueStr){
  if(!dueStr) return "";
  const d = new Date(dueStr);
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// ====== 描画 ======
function render(){
  list.innerHTML = "";
  // 期限→完了フラグで軽くソート
  const sorted = [...items].sort((a,b)=>{
    const aDue = a.due ? new Date(a.due).getTime() : Infinity;
    const bDue = b.due ? new Date(b.due).getTime() : Infinity;
    if(a.done !== b.done) return a.done - b.done; // 未完了を上に
    return aDue - bDue;
  });

  for(const it of sorted){
    const li = document.createElement("li");
    li.className = "item" + (it.done ? " completed" : "");

    // info
    const info = document.createElement("div");
    info.className = "info";

    // 完了チェック
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = it.done;
    checkbox.onchange = () => {
      it.done = checkbox.checked;
      saveItems(items);
      render();
    };

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = it.title;

    const meta = document.createElement("span");
    meta.className = "date";
    meta.textContent = it.due ? `期限: ${formatDate(it.due)}` : "期限なし";

    const badgeType = it.done ? "ok" : classifyDue(it.due);
    if(badgeType){
      const badge = document.createElement("span");
      badge.className = `badge ${badgeType}`;
      badge.textContent =
        badgeType === "overdue" ? "期限切れ" :
        badgeType === "today" ? "今日" :
        badgeType === "soon" ? "3日以内" : "OK";
      info.append(badge);
    }

    info.append(checkbox, title, meta);

    // actions
    const actions = document.createElement("div");
    actions.className = "actions";

    const del = document.createElement("button");
    del.className = "small";
    del.textContent = "削除";
    del.onclick = () => {
      items = items.filter(x => x.id !== it.id);
      saveItems(items);
      render();
    };

    actions.append(del);

    li.append(info, actions);
    list.append(li);
  }
}

// 初期描画
render();
