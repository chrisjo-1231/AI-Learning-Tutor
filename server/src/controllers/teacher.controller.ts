import { Request, Response } from "express";

import {
  getTeacherDashboard,
  getTeacherStudents,
} from "../services/teacher.service.js";

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
   TEACHER DASHBOARD
===================================================== */

export const dashboard = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const teacherId =
      req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data =
      await getTeacherDashboard(
        teacherId
      );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error(
      "Teacher dashboard error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to load teacher dashboard",
    });
  }
};

/* =====================================================
   TEACHER STUDENTS
===================================================== */

export const students = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const teacherId =
      req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data =
      await getTeacherStudents(
        teacherId
      );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error(
      "Teacher students error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to load students",
    });
  }
};