import { Router } from "express";

import {
  askAI,
  getConversations,
  getConversation,
} from "../controllers/ai.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =====================================================
   ASK AI TUTOR
===================================================== */

router.post(
  "/ask",
  authenticateToken,
  authorizeRoles("STUDENT"),
  askAI
);

/* =====================================================
   GET ALL CONVERSATIONS
===================================================== */

router.get(
  "/conversations",
  authenticateToken,
  authorizeRoles("STUDENT"),
  getConversations
);

/* =====================================================
   GET ONE CONVERSATION
===================================================== */

router.get(
  "/conversations/:id",
  authenticateToken,
  authorizeRoles("STUDENT"),
  getConversation
);

export default router;