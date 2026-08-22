import prisma from "../config/prisma.js";
import openai from "../config/openai.js";

/* =====================================================
   ASK AI TUTOR
===================================================== */

export const askAITutor = async (
  studentId: number,
  question: string,
  courseId?: number,
  lessonId?: number,
  conversationId?: number
) => {
  /* ===================================================
     VALIDATE STUDENT
  =================================================== */

  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  if (student.role !== "STUDENT") {
    throw new Error(
      "Only students can use the AI Tutor"
    );
  }

  /* ===================================================
     VALIDATE QUESTION
  =================================================== */

  if (!question || !question.trim()) {
    throw new Error(
      "Question is required"
    );
  }

  /* ===================================================
     GET COURSE
  =================================================== */

  let course = null;

  if (courseId) {
    course =
      await prisma.course.findUnique({
        where: {
          id: courseId,
        },
        select: {
          id: true,
          title: true,
          description: true,
        },
      });

    if (!course) {
      throw new Error(
        "Course not found"
      );
    }
  }

  /* ===================================================
     GET LESSON
  =================================================== */

  let lesson = null;

  if (lessonId) {
    lesson =
      await prisma.lesson.findUnique({
        where: {
          id: lessonId,
        },
        select: {
          id: true,
          title: true,
          content: true,
          courseId: true,
        },
      });

    if (!lesson) {
      throw new Error(
        "Lesson not found"
      );
    }

    if (
      courseId &&
      lesson.courseId !== courseId
    ) {
      throw new Error(
        "Lesson does not belong to this course"
      );
    }
  }

  /* ===================================================
     GET OR CREATE CONVERSATION
  =================================================== */

  let conversation;

  if (conversationId) {
    conversation =
      await prisma.aIConversation.findFirst({
        where: {
          id: conversationId,
          studentId,
        },
      });

    if (!conversation) {
      throw new Error(
        "Conversation not found"
      );
    }
  } else {
    conversation =
      await prisma.aIConversation.create({
        data: {
          studentId,
          courseId:
            courseId ?? null,
          lessonId:
            lessonId ?? null,
          title:
            question
              .trim()
              .substring(0, 100),
        },
      });
  }

  /* ===================================================
     GET PREVIOUS MESSAGES
  =================================================== */

  const previousMessages =
    await prisma.aIMessage.findMany({
      where: {
        conversationId:
          conversation.id,
      },

      orderBy: {
        createdAt: "asc",
      },

      select: {
        role: true,
        content: true,
      },
    });

  /* ===================================================
     SAVE USER MESSAGE
  =================================================== */

  await prisma.aIMessage.create({
    data: {
      conversationId:
        conversation.id,
      role: "USER",
      content: question.trim(),
    },
  });

  /* ===================================================
     BUILD COURSE CONTEXT
  =================================================== */

  let context = "";

  if (course) {
    context += `
Course:
${course.title}

Course Description:
${course.description || "No description available."}
`;
  }

  if (lesson) {
    context += `
Current Lesson:
${lesson.title}

Lesson Content:
${lesson.content}
`;
  }

  /* ===================================================
     BUILD AI INSTRUCTIONS
  =================================================== */

  const instructions = `
You are an AI Learning Tutor inside an online learning system.

Your job is to help students understand their lessons.

Rules:

1. Explain concepts clearly and simply.
2. Do not simply give answers when the student is learning.
3. Guide the student step-by-step when appropriate.
4. Use examples when they help understanding.
5. If the question is related to the current lesson, prioritize the lesson content.
6. If the answer is not found in the lesson, you may use your general knowledge.
7. Never pretend that information is in the lesson when it is not.
8. Encourage learning and understanding.
9. Keep answers organized and readable.
10. Use Markdown when useful.
11. If the student asks for code, explain the code clearly.
12. If the student appears confused, explain the concept in a simpler way.

${context}
`;

  /* ===================================================
     BUILD MESSAGE HISTORY
  =================================================== */

  const history = previousMessages.map(
    (message) => ({
      role:
        message.role === "USER"
          ? ("user" as const)
          : ("assistant" as const),

      content: message.content,
    })
  );

  /* ===================================================
     CALL OPENAI
  =================================================== */

  const response =
    await openai.responses.create({
      model: "gpt-5.5",

      instructions,

      input: [
        ...history,

        {
          role: "user",
          content: question.trim(),
        },
      ],
    });

  const answer =
    response.output_text?.trim();

  if (!answer) {
    throw new Error(
      "AI did not return a response"
    );
  }

  /* ===================================================
     SAVE AI MESSAGE
  =================================================== */

  const aiMessage =
    await prisma.aIMessage.create({
      data: {
        conversationId:
          conversation.id,
        role: "ASSISTANT",
        content: answer,
      },
    });

  /* ===================================================
     UPDATE CONVERSATION
  =================================================== */

  await prisma.aIConversation.update({
    where: {
      id: conversation.id,
    },

    data: {
      updatedAt: new Date(),
    },
  });

  /* ===================================================
     RETURN
  =================================================== */

  return {
    conversationId:
      conversation.id,

    message: {
      id: aiMessage.id,
      role: aiMessage.role,
      content: aiMessage.content,
      createdAt:
        aiMessage.createdAt,
    },

    course,

    lesson,
  };
};