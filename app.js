const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");

addBtn.addEventListener("click", () => {
  if (input.value.trim() === "") return;
  const li = document.createElement("li");
  li.textContent = input.value;
  const delBtn = document.createElement("button");
  delBtn.textContent = "削除";
  delBtn.className = "delete";
  delBtn.onclick = () => li.remove();
  li.appendChild(delBtn);
  list.appendChild(li);
  input.value = "";
});
