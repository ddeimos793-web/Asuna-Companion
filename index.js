
const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

const ASUNA_API = "https://asuna-ai-m2o1.onrender.com";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/api/hello", (req, res) => {
    res.json({
        name: "Asuna",
        message: "Привет! Я Асуна. Я рада тебя видеть! 💜"
    });
});

app.post("/api/chat", async (req, res) => {
    try {
        const response = await fetch(`${ASUNA_API}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: req.body.message,
                userName: req.body.userName || "",
                history: req.body.history || []
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.json(data);

    } catch (error) {
        console.error("Ошибка связи с Асунoй:", error);

        return res.status(503).json({
            error: "Не удалось связаться с Асунoй. Попробуй ещё раз 💜"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Asuna запущена на порту ${PORT}`);
});
