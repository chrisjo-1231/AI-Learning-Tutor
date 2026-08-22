import { Router } from "express";

import {
  dashboard,
  students,
} from "../controllers/teacher.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =====================================================
   TEACHER DASHBOARD
===================================================== */

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("TEACHER"),
  dashboard
);

/* =====================================================
   TEACHER STUDENTS
===================================================== */

router.get(
  "/students",
  authenticateToken,
  authorizeRoles("TEACHER"),
  students
);

export default router;