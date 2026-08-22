import OpenAI from "openai";

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const generateAIResponse = async (
  messages: AIChatMessage[]
) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured"
    );
  }

  const openai = new OpenAI({
    apiKey,
  });

  const response =
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.4,
    });

  const content =
    response.choices[0]?.message?.content;

  if (!content) {
    throw new Error(
      "AI returned an empty response"
    );
  }

  return content;
};