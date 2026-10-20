const API_URL = "http://localhost:3000/api/plan";
const pad = (n) => String(n).padStart(2, "0");

function localNow() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

document.getElementById("plan-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = document.getElementById("result");
  out.textContent = "Building your plan...";

  const body = {
    task: document.getElementById("task").value,
    deadline: `${document.getElementById("date").value}T${document.getElementById("time").value}`,
    extra: document.getElementById("extra").value,
    now: localNow(),
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      out.textContent = data.error;
      return;
    }
    out.innerHTML = "";
    data.plan.forEach((s) => {
      const row = document.createElement("div");
      row.className = `slot ${s.type}`;
      row.textContent = `${s.start} - ${s.end}  ${s.activity}`;
      out.appendChild(row);
    });
    if (data.tip) {
      const tip = document.createElement("p");
      tip.textContent = data.tip;
      out.appendChild(tip);
    }
  } catch {
    out.textContent = "Server unreachable, try again.";
  }
});
