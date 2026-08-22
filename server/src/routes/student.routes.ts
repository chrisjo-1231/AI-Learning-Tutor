import { Router } from "express";

import {
  dashboard,
  courses,
  courseDetails,
  lessonDetails,
  completeLesson,
} from "../controllers/student.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| STUDENT DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("STUDENT"),
  dashboard
);

/*
|--------------------------------------------------------------------------
| STUDENT COURSES
|--------------------------------------------------------------------------
*/

router.get(
  "/courses",
  authenticateToken,
  authorizeRoles("STUDENT"),
  courses
);

/*
|--------------------------------------------------------------------------
| STUDENT COURSE DETAILS
|--------------------------------------------------------------------------
*/

router.get(
  "/courses/:courseId",
  authenticateToken,
  authorizeRoles("STUDENT"),
  courseDetails
);

/*
|--------------------------------------------------------------------------
| STUDENT LESSON DETAILS
|--------------------------------------------------------------------------
*/

router.get(
  "/courses/:courseId/lessons/:lessonId",
  authenticateToken,
  authorizeRoles("STUDENT"),
  lessonDetails
);

/*
|--------------------------------------------------------------------------
| COMPLETE LESSON
|--------------------------------------------------------------------------
*/

router.post(
  "/courses/:courseId/lessons/:lessonId/complete",
  authenticateToken,
  authorizeRoles("STUDENT"),
  completeLesson
);

export default router;