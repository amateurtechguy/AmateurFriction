const timeline = document.getElementById("timeline");
const labels = { work: "Work", break: "Break", rest: "Rest", review: "Review" };

function showEmpty() {
  const msg = document.createElement("p");
  msg.className = "empty";
  msg.textContent = "No plan yet. Fill in the form to get one.";
  timeline.appendChild(msg);
  document.querySelector(".summary").style.display = "none";
}

function formatDeadline(value) {
  return new Date(value).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function render(data) {
  document.getElementById("task-name").textContent = data.task;
  document.getElementById("deadline").textContent = formatDeadline(
    data.deadline,
  );
  document.getElementById("tip").textContent = data.tip || "";

  data.plan.forEach((slot, i) => {
    const type = labels[slot.type] ? slot.type : "work";
    const row = document.createElement("div");
    row.className = `slot ${type}`;
    row.style.animationDelay = `${i * 80}ms`;

    const time = document.createElement("div");
    time.className = "slot-time";
    time.textContent = `${slot.start} - ${slot.end}`;

    const info = document.createElement("div");
    const tag = document.createElement("span");
    tag.className = "slot-tag";
    tag.textContent = labels[type];
    const activity = document.createElement("div");
    activity.className = "slot-activity";
    activity.textContent = slot.activity;

    info.append(tag, activity);
    row.append(time, info);
    timeline.appendChild(row);
  });
}

try {
  const data = JSON.parse(sessionStorage.getItem("plan"));
  if (data && Array.isArray(data.plan)) {
    render(data);
  } else {
    showEmpty();
  }
} catch {
  showEmpty();
}
