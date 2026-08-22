import { Router } from "express";

import {
  create,
  index,
  show,
  update,
  remove,
} from "../controllers/lesson.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =====================================================
   GET LESSONS BY COURSE
===================================================== */

router.get(
  "/course/:courseId",
  authenticateToken,
  index
);

/* =====================================================
   GET SINGLE LESSON
===================================================== */

router.get(
  "/:id",
  authenticateToken,
  show
);

/* =====================================================
   CREATE LESSON
   TEACHER ONLY
===================================================== */

router.post(
  "/course/:courseId",
  authenticateToken,
  authorizeRoles("TEACHER"),
  create
);

/* =====================================================
   UPDATE LESSON
   TEACHER ONLY
===================================================== */

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("TEACHER"),
  update
);

/* =====================================================
   DELETE LESSON
   TEACHER ONLY
===================================================== */

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("TEACHER"),
  remove
);

export default router;