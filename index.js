
const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

const ASUNA_API = "https://asuna-ai-m2o1.onrender.com";
const REQUEST_TIMEOUT = 180000; // 180 секунд

app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

app.get("/api/hello", (req, res) => {
    res.json({
        name: "Asuna",
        message: "Привет! Я Асуна. Я рада тебя видеть! 💜"
    });
});

app.post("/api/chat", async (req, res) => {
    const body = req.body || {};

    // Проверяем сообщение
    if (
        typeof body.message !== "string" ||
        !body.message.trim()
    ) {
        return res.status(400).json({
            error: "Напиши мне что-нибудь, и я обязательно отвечу 💜"
        });
    }

    // Проверяем историю диалога
    const history = Array.isArray(body.history)
        ? body.history.slice(-40)
        : [];

    const userName =
        typeof body.userName === "string"
            ? body.userName.slice(0, 100)
            : "";

    const image =
        typeof body.image === "string"
            ? body.image
            : null;

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${ASUNA_API}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: body.message,
                userName,
                history,
                studyMode: body.studyMode === true,
                image
            }),
            signal: controller.signal
        });

        const responseText = await response.text();

        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            console.error(
                "Render вернул ответ не в формате JSON:",
                response.status
            );

            return res.status(502).json({
                error: "Сервер Асуны вернул непонятный ответ. Попробуй немного позже 💜"
            });
        }

        if (!response.ok) {
            return res.status(response.status).json(
                data && typeof data === "object"
                    ? data
                    : { error: "Не удалось получить ответ Асуны." }
            );
        }

        return res.json(data);

    } catch (error) {
        console.error("Ошибка связи с Асуной:", error);

        if (error.name === "AbortError") {
            return res.status(504).json({
                error: "Асуна слишком долго готовила ответ. Попробуй отправить сообщение ещё раз 💜"
            });
        }

        return res.status(503).json({
            error: "Не удалось связаться с Асуной. Возможно, сервер временно недоступен. Попробуй ещё раз 💜"
        });

    } finally {
        clearTimeout(timeout);
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Asuna запущена на порту ${PORT}`);
});
