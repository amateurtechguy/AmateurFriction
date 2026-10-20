const API_URL = "http://localhost:3000/api/plan";

const pad = (n) => String(n).padStart(2, "0");

function localNow() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const dateInput = document.getElementById("date");
const form = document.getElementById("plan-form");
const button = form.querySelector('input[type="submit"]');

dateInput.min = localNow().slice(0, 10);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const task = document.getElementById("task").value.trim();
  const date = dateInput.value;
  const time = document.getElementById("time").value;
  const deadline = `${date}T${time}`;

  if (!task || !date || !time) {
    alert("Please fill in all required fields.");
    return;
  }

  if (deadline <= localNow()) {
    alert("The deadline must be in the future.");
    return;
  }

  button.value = "Building your plan...";
  button.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task,
        deadline,
        extra: document.getElementById("extra").value,
        now: localNow(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    sessionStorage.setItem("plan", JSON.stringify({ task, deadline, ...data }));

    window.location.href = "plan.html";
  } catch (err) {
    alert(
      err.message === "Failed to fetch"
        ? "Server unreachable. Try again."
        : err.message,
    );

    button.value = "Submit";
    button.disabled = false;
  }
});
