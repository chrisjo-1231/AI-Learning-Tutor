import { Router } from "express";

import {
  enroll,
  getMyCourses,
  getEnrolledStudents,
} from "../controllers/enrollment.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// ==========================================
// STUDENT ENROLLMENT
// ==========================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  enroll
);

// ==========================================
// STUDENT MY COURSES
// ==========================================

router.get(
  "/my-courses",
  authenticateToken,
  authorizeRoles("STUDENT"),
  getMyCourses
);

// ==========================================
// TEACHER ENROLLED STUDENTS
// ==========================================

router.get(
  "/course/:courseId/students",
  authenticateToken,
  authorizeRoles("TEACHER"),
  getEnrolledStudents
);

export default router;