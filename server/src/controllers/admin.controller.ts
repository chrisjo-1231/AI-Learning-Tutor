import { Request, Response } from "express";

import {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  deleteUser,
} from "../services/admin.service.js";

// ==========================================
// DASHBOARD
// ==========================================

export const dashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getAdminDashboard();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET USERS
// ==========================================

export const users = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getAllUsers();

    return res.status(200).json({
      success: true,
      users: data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET USER BY ID
// ==========================================

export const user = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const data = await getUserById(userId);

    return res.status(200).json({
      success: true,
      user: data,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CREATE USER
// ==========================================

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, email, password and role are required",
      });
    }

    const validRoles = [
      "STUDENT",
      "TEACHER",
      "ADMIN",
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const data = await createUser(
      name,
      email,
      password,
      role
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE USER ROLE
// ==========================================

export const updateRole = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.params.id);

    const { role } = req.body;

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const validRoles = [
      "STUDENT",
      "TEACHER",
      "ADMIN",
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const data = await updateUserRole(
      userId,
      role
    );

    return res.status(200).json({
      success: true,
      message:
        "User role updated successfully",
      user: data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE USER
// ==========================================

export const remove = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // --------------------------------------
    // Get authenticated user
    // --------------------------------------

    const authUser = (req as any).user;

    // --------------------------------------
    // Prevent admin from deleting himself
    // --------------------------------------

    if (
      authUser?.userId === userId ||
      authUser?.id === userId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account",
      });
    }

    const data = await deleteUser(userId);

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};