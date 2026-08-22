import { Request, Response } from "express";

import {
  askAITutor,
} from "../services/ai.service.js";

import {
  getStudentConversations,
  getStudentConversation,
} from "../services/aiConversation.service.js";

/* =====================================================
   AUTH REQUEST
===================================================== */

interface AuthRequest extends Request {
  user?: {
    userId: number;
    role:
      | "STUDENT"
      | "TEACHER"
      | "ADMIN";
  };
}

/* =====================================================
   ASK AI
===================================================== */

export const askAI = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const studentId =
      req.user?.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      question,
      courseId,
      lessonId,
      conversationId,
    } = req.body;

    if (
      !question ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question is required",
      });
    }

    const result =
      await askAITutor(
        studentId,
        question,
        courseId
          ? Number(courseId)
          : undefined,
        lessonId
          ? Number(lessonId)
          : undefined,
        conversationId
          ? Number(conversationId)
          : undefined
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error(
      "ASK AI ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to get AI response",
    });
  }
};

/* =====================================================
   GET CONVERSATIONS
===================================================== */

export const getConversations =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const studentId =
        req.user?.userId;

      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const conversations =
        await getStudentConversations(
          studentId
        );

      return res.status(200).json({
        success: true,
        data: conversations,
      });

    } catch (error: any) {
      console.error(
        "GET AI CONVERSATIONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load conversations",
      });
    }
  };

/* =====================================================
   GET CONVERSATION
===================================================== */

export const getConversation =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const studentId =
        req.user?.userId;

      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const conversationId =
        Number(req.params.id);

      if (
        Number.isNaN(conversationId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid conversation ID",
        });
      }

      const conversation =
        await getStudentConversation(
          studentId,
          conversationId
        );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: conversation,
      });

    } catch (error: any) {
      console.error(
        "GET AI CONVERSATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load conversation",
      });
    }
  };