import { Response } from "express";

import {
  createQuiz,
  deleteQuiz,
  getQuizById,
  getStudentQuizById,
  getQuizzes,
  updateQuiz,
  submitQuiz,
} from "../services/quiz.service.js";

import {
  AuthRequest,
} from "../middleware/auth.middleware.js";

/*
=====================================================
GET MY QUIZZES
=====================================================
*/

export const index = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /*
     * IMPORTANT:
     * Pass logged-in teacher ID.
     *
     * This prevents Teacher 1 quizzes
     * from appearing for Teacher 2.
     */
    const quizzes = await getQuizzes(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error: any) {
    console.error(
      "GET TEACHER QUIZZES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load quizzes.",
    });
  }
};

/*
=====================================================
GET QUIZ BY ID
=====================================================
*/

export const show = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    /*
     * IMPORTANT:
     * Get quiz only if it belongs
     * to the logged-in teacher.
     */
    const quiz = await getQuizById(
      id,
      req.user.userId
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error: any) {
    console.error(
      "GET QUIZ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load quiz.",
    });
  }
};

/*
=====================================================
CREATE QUIZ
=====================================================
*/

export const create = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      title,
      lessonId,
      questions,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required.",
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson is required.",
      });
    }

    if (
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one question is required.",
      });
    }

    /*
     * Pass teacher ID.
     *
     * The service will verify that the
     * selected lesson belongs to this teacher.
     */
    const quiz = await createQuiz(
      title.trim(),
      Number(lessonId),
      questions,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message:
        "Quiz created successfully.",
      quiz,
    });
  } catch (error: any) {
    console.error(
      "CREATE QUIZ ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create quiz.",
    });
  }
};

/*
=====================================================
UPDATE QUIZ
=====================================================
*/

export const update = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const {
      title,
      lessonId,
      questions,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Quiz title is required.",
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson is required.",
      });
    }

    if (
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one question is required.",
      });
    }

    /*
     * Service verifies:
     *
     * Quiz belongs to teacher
     * AND
     * New lesson belongs to teacher
     */
    const quiz = await updateQuiz(
      id,
      title.trim(),
      Number(lessonId),
      questions,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message:
        "Quiz updated successfully.",
      quiz,
    });
  } catch (error: any) {
    console.error(
      "UPDATE QUIZ ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update quiz.",
    });
  }
};

/*
=====================================================
DELETE QUIZ
=====================================================
*/

export const remove = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    /*
     * IMPORTANT:
     * Delete only if quiz belongs
     * to logged-in teacher.
     */
    await deleteQuiz(
      id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message:
        "Quiz deleted successfully.",
    });
  } catch (error: any) {
    console.error(
      "DELETE QUIZ ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to delete quiz.",
    });
  }
};

/*
=====================================================
SUBMIT QUIZ
=====================================================
*/

export const submit = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const quizId =
      Number(req.params.id);

    if (
      !Number.isInteger(quizId) ||
      quizId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid quiz ID.",
      });
    }

    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message:
          "Answers are required.",
      });
    }

    const result =
      await submitQuiz(
        quizId,
        req.user.userId,
        answers
      );

    return res.status(200).json({
      success: true,
      message:
        "Quiz submitted successfully.",
      result,
    });
  } catch (error: any) {
    console.error(
      "SUBMIT QUIZ ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to submit quiz.",
    });
  }
};
/* =====================================================
   GET QUIZ FOR STUDENT
===================================================== */

export const studentShow = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = Number(
      req.params.id
    );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const quiz =
      await getStudentQuizById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    return res.status(200).json({
      success: true,
      quiz,
    });

  } catch (error: any) {
    console.error(
      "GET STUDENT QUIZ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load quiz.",
    });
  }
};