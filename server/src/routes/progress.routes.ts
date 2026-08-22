import { Router } from "express";

import {
  completeLesson,
  courseProgress,
  myProgress,
} from "../controllers/progress.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";


const router = Router();


router.post(
  "/lesson/:lessonId",
  authenticateToken,
  authorizeRoles("STUDENT"),
  completeLesson
);


router.get(
  "/course/:courseId",
  authenticateToken,
  authorizeRoles("STUDENT"),
  courseProgress
);


router.get(
  "/my-progress",
  authenticateToken,
  authorizeRoles("STUDENT"),
  myProgress
);


export default router;