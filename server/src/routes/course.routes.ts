import { Router } from "express";

import {
  create,
  index,
  show,
  update,
  browse,
} from "../controllers/course.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// =====================================================
// STUDENT BROWSE COURSES
// IMPORTANT: BEFORE /:id
// =====================================================

router.get(
  "/browse",
  authenticateToken,
  authorizeRoles("STUDENT"),
  browse
);

// =====================================================
// TEACHER MY COURSES
// =====================================================

router.get(
  "/",
  authenticateToken,
  authorizeRoles("TEACHER"),
  index
);

// =====================================================
// TEACHER GET COURSE BY ID
// =====================================================

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("TEACHER"),
  show
);

// =====================================================
// CREATE COURSE
// =====================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("TEACHER"),
  create
);

// =====================================================
// UPDATE COURSE
// =====================================================

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("TEACHER"),
  update
);

export default router;