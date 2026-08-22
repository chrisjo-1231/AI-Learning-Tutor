import { Router } from "express";

import {
  index,
  show,
  studentShow,
  create,
  update,
  remove,
  submit,
} from "../controllers/quiz.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =====================================================
   STUDENT GET QUIZ
===================================================== */

router.get(
  "/student/:id",
  authenticateToken,
  authorizeRoles("STUDENT"),
  studentShow
);

/* =====================================================
   TEACHER QUIZZES
===================================================== */

router.get(
  "/",
  authenticateToken,
  authorizeRoles("TEACHER"),
  index
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("TEACHER"),
  show
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("TEACHER"),
  create
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("TEACHER"),
  update
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("TEACHER"),
  remove
);

/* =====================================================
   STUDENT SUBMIT
===================================================== */

router.post(
  "/:id/submit",
  authenticateToken,
  authorizeRoles("STUDENT"),
  submit
);

export default router;