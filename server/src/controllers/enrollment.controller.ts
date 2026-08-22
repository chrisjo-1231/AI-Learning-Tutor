import { Request, Response } from "express";

import {
  createEnrollment,
  getMyEnrollments,
  getEnrolledStudentsByCourse,
} from "../services/enrollment.service.js";

type AuthRequest = Request & {
  user?: {
    userId: string | number;
    role?: string;
  };
};

// ==========================================
// STUDENT ENROLL
// ==========================================

export const enroll = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const studentId = req.user?.userId;
    const { courseId } = req.body;

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

    const enrollment = await createEnrollment(
      Number(studentId),
      Number(courseId)
    );

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (error: any) {
    console.error(
      "Enrollment error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to enroll",
    });
  }
};

// ==========================================
// STUDENT MY COURSES
// ==========================================

export const getMyCourses = async (
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

    const enrollments =
      await getMyEnrollments(
        Number(studentId)
      );

    return res.status(200).json({
      success: true,
      courses: enrollments,
    });
  } catch (error: any) {
    console.error(
      "Get my courses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load courses",
    });
  }
};

// ==========================================
// TEACHER ENROLLED STUDENTS
// ==========================================

export const getEnrolledStudents =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const teacherId =
        req.user?.userId;

      const courseId = Number(
        req.params.courseId
      );

      // ------------------------------
      // AUTH CHECK
      // ------------------------------

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // ------------------------------
      // COURSE ID CHECK
      // ------------------------------

      if (Number.isNaN(courseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      // ------------------------------
      // GET STUDENTS
      // ------------------------------

      const students =
        await getEnrolledStudentsByCourse(
          courseId,
          Number(teacherId)
        );

      return res.status(200).json({
        success: true,
        students,
      });

    } catch (error: any) {
      console.error(
        "Get enrolled students error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load enrolled students",
      });
    }
  };