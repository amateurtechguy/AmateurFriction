import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(
  cors({
    origin: ["https://amateurtechguy.github.io", "http://127.0.0.1:5500"],
  }),
);
app.use(express.json({ limit: "10kb" }));

const SYSTEM_PROMPT = `You are AmateurFriction, a last-minute planner.
Given the current time, a deadline, a task and optional extra info, build an hourly plan that finishes the task just before the deadline.
Rules:
- Start at the next quarter hour after the current time.
- Work blocks last 25 to 50 minutes, followed by a 5 to 15 minute break.
- Add a longer rest or meal break if the plan is longer than 3 hours.
- Leave a 10 to 15 minute buffer before the deadline for review.
- If there is very little time, skip rests and prioritise the essentials.
- Use 24h HH:MM times.
Reply with JSON only: {"plan":[{"start":"HH:MM","end":"HH:MM","type":"work|break|rest|review","activity":"short description"}],"tip":"one short motivating sentence"}`;

app.post("/api/plan", async (req, res) => {
  const { task, deadline, now, extra } = req.body || {};
  if (!task || !deadline || !now) {
    return res
      .status(400)
      .json({ error: "task, deadline and now are required" });
  }
  const minutesLeft = Math.round((new Date(deadline) - new Date(now)) / 60000);
  if (!(minutesLeft > 0)) {
    return res
      .status(400)
      .json({ error: "The deadline must be in the future" });
  }

  const userMessage = `Current time: ${now}
Deadline: ${deadline} (${minutesLeft} minutes from now)
Task: ${String(task).slice(0, 500)}
Extra info: ${String(extra || "none").slice(0, 1000)}`;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });
    if (!r.ok) {
      return res
        .status(502)
        .json({ error: "AI provider error", status: r.status });
    }
    const data = await r.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    if (!Array.isArray(parsed.plan)) throw new Error("Bad plan shape");
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: "Could not generate a plan" });
  }
});

app.listen(process.env.PORT || 3000);
