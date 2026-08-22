import { Router } from "express";

import {
  getProfile,
  updateProfile,
  uploadProfileImage,
} from "../controllers/user.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import upload from "../middleware/upload.middleware.js";

const router = Router();

// =====================================================
// GET PROFILE
// =====================================================

router.get(
  "/profile",
  authenticateToken,
  getProfile
);

// =====================================================
// UPDATE PROFILE
// =====================================================

router.put(
  "/profile",
  authenticateToken,
  updateProfile
);

// =====================================================
// UPLOAD PROFILE IMAGE
// =====================================================

router.post(
  "/profile/avatar",
  authenticateToken,
  upload.single("profileImage"),
  uploadProfileImage
);

export default router;