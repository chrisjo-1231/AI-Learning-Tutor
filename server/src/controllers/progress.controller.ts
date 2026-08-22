import { Request, Response } from "express";

import {
  markLessonProgress,
  getCourseProgress,
  getMyProgress,
} from "../services/progress.service.js";


type AuthRequest = Request;


export const completeLesson = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const studentId = req.user?.userId;

    const lessonId = Number(
      req.params.lessonId
    );

    const { completed } = req.body;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "lessonId is required",
      });
    }

    const progress =
      await markLessonProgress(
        studentId,
        lessonId,
        completed === true
      );

    return res.status(200).json({
      success: true,

      message:
        completed === true
          ? "Lesson marked as completed"
          : "Lesson marked as incomplete",

      progress,
    });

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


export const courseProgress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const studentId = req.user?.userId;

    const courseId = Number(
      req.params.courseId
    );

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const progress =
      await getCourseProgress(
        studentId,
        courseId
      );

    return res.status(200).json({
      success: true,
      progress,
    });

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


export const myProgress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const studentId = req.user?.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const progress =
      await getMyProgress(studentId);

    return res.status(200).json({
      success: true,
      progress,
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};