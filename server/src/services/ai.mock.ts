export const generateMockAIResponse = async (
  message: string
) => {
  const text = message.toLowerCase();

  if (text.includes("python")) {
    return `Python is a beginner-friendly programming language used for web development, automation, data science, and artificial intelligence.

Example:

print("Hello World")

This tells Python to display Hello World.`;
  }

  if (
    text.includes("javascript") ||
    text.includes("js")
  ) {
    return `JavaScript is a programming language commonly used to make websites interactive.

For example:

console.log("Hello World");

This prints Hello World in the console.`;
  }

  if (
    text.includes("html")
  ) {
    return `HTML stands for HyperText Markup Language. It is used to structure the content of web pages.

For example:

<h1>Hello World</h1>

creates a heading on a webpage.`;
  }

  if (
    text.includes("css")
  ) {
    return `CSS stands for Cascading Style Sheets. It controls how HTML elements look, including colors, spacing, fonts, and layouts.`;
  }

  if (
    text.includes("ai") ||
    text.includes("artificial intelligence")
  ) {
    return `Artificial Intelligence, or AI, refers to computer systems that can perform tasks that normally require human intelligence, such as understanding language, recognizing patterns, and making predictions.`;
  }

  return `I'm your AI Learning Tutor.

You asked:

"${message}"

This is currently a MOCK AI response. Once your OpenAI API credits are available, we can replace this response with the real AI provider.

For now, I can help you test the complete conversation, message, authentication, and database flow.`;
};