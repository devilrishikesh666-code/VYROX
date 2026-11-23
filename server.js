require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    website: "VYROX STUDIO"
  });
});

app.get("/api/ai/status", (req, res) => {
  res.json({
    configured: Boolean(process.env.AI_API_KEY),
    model: process.env.AI_MODEL || "openai/gpt-4o-mini"
  });
});

app.post("/api/ai/assist", async (req, res) => {
  try {
    const { message } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Message is too long."
      });
    }

    const apiKey = process.env.AI_API_KEY;

    const baseUrl = (
      process.env.AI_API_BASE_URL ||
      "https://openrouter.ai/api/v1"
    ).replace(/\/+$/, "");

    const model =
      process.env.AI_MODEL || "openai/gpt-4o-mini";

    if (!apiKey) {
      return res.status(503).json({
        error: "AI API key is not configured."
      });
    }

    const response = await fetch(
      `${baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "VYROX STUDIO"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are VYROX STUDIO AI, a helpful creative editing assistant. Help users with photo editing, video editing, design ideas and creative projects."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("AI provider error:", data);

      return res.status(502).json({
        error: "The AI provider could not process the request."
      });
    }

    res.json({
      reply:
        data.choices?.[0]?.message?.content ||
        "No response received."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error."
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `VYROX STUDIO running on port ${PORT}`
  );
});
