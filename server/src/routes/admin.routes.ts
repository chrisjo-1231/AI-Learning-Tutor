import { Router } from "express";

import {
  dashboard,
  users,
  user,
  create,
  updateRole,
  remove,
} from "../controllers/admin.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("ADMIN"),
  dashboard
);

// ==========================================
// USERS
// ==========================================

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  users
);

// ==========================================
// SINGLE USER
// ==========================================

router.get(
  "/users/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  user
);

// ==========================================
// CREATE USER
// ==========================================

router.post(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  create
);

// ==========================================
// UPDATE ROLE
// ==========================================

router.patch(
  "/users/:id/role",
  authenticateToken,
  authorizeRoles("ADMIN"),
  updateRole
);

// ==========================================
// DELETE USER
// ==========================================

router.delete(
  "/users/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  remove
);

export default router;