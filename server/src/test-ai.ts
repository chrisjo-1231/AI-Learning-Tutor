import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

import {
  generateAIResponse,
} from "./services/ai.provider.js";

async function testAI() {
  try {
    console.log(
      "OPENAI_API_KEY loaded:",
      !!process.env.OPENAI_API_KEY
    );

    const response =
      await generateAIResponse([
        {
          role: "system",
          content:
            "You are a helpful educational AI tutor.",
        },
        {
          role: "user",
          content:
            "Explain what Python is in simple terms.",
        },
      ]);

    console.log("\nAI RESPONSE:\n");
    console.log(response);
  } catch (error) {
    console.error("\nAI TEST FAILED:");
    console.error(error);
  }
}

testAI();