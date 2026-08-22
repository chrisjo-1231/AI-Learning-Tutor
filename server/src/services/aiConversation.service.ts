import prisma from "../config/prisma.js";

/* =====================================================
   GET STUDENT CONVERSATIONS
===================================================== */

export const getStudentConversations =
  async (
    studentId: number
  ) => {
    return prisma.aIConversation.findMany({
      where: {
        studentId,
      },

      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },

        lesson: {
          select: {
            id: true,
            title: true,
          },
        },

        messages: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    });
  };

/* =====================================================
   GET SINGLE CONVERSATION
===================================================== */

export const getStudentConversation =
  async (
    studentId: number,
    conversationId: number
  ) => {
    return prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        studentId,
      },

      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },

        lesson: {
          select: {
            id: true,
            title: true,
          },
        },

        messages: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
  };