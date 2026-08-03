import axios from "axios";
import { env } from "./config/env.js";

async function test() {
    try {
        console.log("Testing AI with model: llama-3.3-70b-versatile");
        const response = await axios.post(
            `${env.ai.baseUrl.replace(/\/$/, "")}/chat/completions`,
            {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: "Hello" }]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${env.ai.apiKey}`,
                },
            }
        );
        console.log("Success:", response.data.choices[0].message.content);
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) {
            console.error("Data:", e.response.data);
        }
    }
}

test();
