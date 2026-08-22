import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getStudentDashboard,
  getStudentCourses,
  getStudentCourseDetails,
  getStudentLessonDetails,
  markLessonComplete,
} from "../services/student.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import prisma from "../config/prisma.js";


/*
|--------------------------------------------------------------------------
| STUDENT DASHBOARD
|--------------------------------------------------------------------------
*/

export const dashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId = Number(
      user.id ??
      user.userId ??
      user.studentId
    );

    if (!studentId || Number.isNaN(studentId)) {
      return res.status(401).json({
        success: false,
        message:
          "Student ID was not found in authentication token.",
      });
    }

    const data =
      await getStudentDashboard(studentId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| STUDENT COURSES
|--------------------------------------------------------------------------
*/

export const courses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId = Number(
      user.id ??
      user.userId ??
      user.studentId
    );

    if (!studentId || Number.isNaN(studentId)) {
      return res.status(401).json({
        success: false,
        message:
          "Student ID was not found in authentication token.",
      });
    }

    const data =
      await getStudentCourses(studentId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| STUDENT COURSE DETAILS
|--------------------------------------------------------------------------
*/

export const courseDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId = Number(
      user.id ??
      user.userId ??
      user.studentId
    );

    if (!studentId || Number.isNaN(studentId)) {
      return res.status(401).json({
        success: false,
        message:
          "Student ID was not found in authentication token.",
      });
    }

    const courseId = Number(
      req.params.courseId
    );

    if (!courseId || Number.isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID.",
      });
    }

    const data =
      await getStudentCourseDetails(
        studentId,
        courseId
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
export const lessonDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId = Number(
      user.id ??
      user.userId ??
      user.studentId
    );

    if (!studentId || Number.isNaN(studentId)) {
      return res.status(401).json({
        success: false,
        message:
          "Student ID was not found in authentication token.",
      });
    }

    const courseId = Number(
      req.params.courseId
    );

    const lessonId = Number(
      req.params.lessonId
    );

    if (
      !courseId ||
      Number.isNaN(courseId) ||
      !lessonId ||
      Number.isNaN(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course or lesson ID.",
      });
    }

    const data =
      await getStudentLessonDetails(
        studentId,
        courseId,
        lessonId
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| COMPLETE LESSON
|--------------------------------------------------------------------------
*/

export const completeLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId = Number(
      user.id ??
      user.userId ??
      user.studentId
    );

    if (!studentId || Number.isNaN(studentId)) {
      return res.status(401).json({
        success: false,
        message:
          "Student ID was not found in authentication token.",
      });
    }

    const courseId = Number(
      req.params.courseId
    );

    const lessonId = Number(
      req.params.lessonId
    );

    if (
      !courseId ||
      Number.isNaN(courseId) ||
      !lessonId ||
      Number.isNaN(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course or lesson ID.",
      });
    }

    const data =
      await markLessonComplete(
        studentId,
        courseId,
        lessonId
      );

    return res.status(200).json({
      success: true,
      message: "Lesson marked as completed.",
      data,
    });
  } catch (error) {
    next(error);
  }
};


export async function getStudentLesson(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const courseId = Number(req.params.courseId);
    const lessonId = Number(req.params.lessonId);

    if (
      Number.isNaN(courseId) ||
      Number.isNaN(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID or lesson ID",
      });
    }

    // Check enrollment
    const enrollment =
      await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: Number(req.user.userId),
            courseId,
          },
        },
      });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this course",
      });
    }

    // Get lesson
    const lesson =
      await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          courseId,
        },
        include: {
          quizzes: {
            include: {
              attempts: {
                where: {
                  studentId: Number(
                    req.user.userId
                  ),
                },
                orderBy: {
                  completedAt: "desc",
                },
              },
            },
          },
        },
      });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Get lesson progress
    const progress =
      await prisma.lessonProgress.findFirst({
        where: {
          studentId: Number(req.user.userId),
          lessonId,
        },
      });

    return res.json({
      success: true,
      data: {
        courseId,
        lesson: {
          id: lesson.id,
          title: lesson.title,

          // IMPORTANT
          description: lesson.content,

          order: lesson.order,

          completed: !!progress?.completed,

          quizzes: lesson.quizzes.map(
            (quiz) => ({
              id: quiz.id,
              title: quiz.title,

              attempts:
                quiz.attempts.map(
                  (attempt) => ({
                    id: attempt.id,
                    score: attempt.score,
                    totalItems:
                      attempt.totalItems,

                    percentage:
                      attempt.totalItems > 0
                        ? Math.round(
                            (attempt.score /
                              attempt.totalItems) *
                              100
                          )
                        : 0,

                    completedAt:
                      attempt.completedAt,
                  })
                ),
            })
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get student lesson error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load student lesson",
    });
  }
}