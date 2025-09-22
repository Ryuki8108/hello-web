document.getElementById("btn").addEventListener("click", () => {
  const t = new Date().toLocaleString();
  document.getElementById("msg").textContent = `ボタンが押されました（${t}）`;
  console.log("clicked at", t);
});
