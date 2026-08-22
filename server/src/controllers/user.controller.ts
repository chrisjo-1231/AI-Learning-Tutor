import { Request, Response } from "express";
import prisma from "../config/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: "STUDENT" | "TEACHER" | "ADMIN";
  };
}

// =====================================================
// GET PROFILE
// =====================================================

export const getProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profileImage: true,
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load profile",
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser =
      await prisma.user.findFirst({
        where: {
          email: email.trim(),
          NOT: {
            id: userId,
          },
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Email is already being used",
      });
    }

    const user =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          name: name.trim(),
          email: email.trim(),
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profileImage: true,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update profile",
    });
  }
};

// =====================================================
// UPLOAD PROFILE IMAGE
// =====================================================
export const uploadProfileImage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    console.log("========== PROFILE UPLOAD ==========");
    console.log("USER:", req.user);
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    console.log("====================================");

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    const imageUrl =
      `/uploads/profiles/${req.file.filename}`;

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profileImage: imageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
      },
    });

    console.log(
      "UPDATED USER:",
      user
    );

    return res.status(200).json({
      success: true,
      message:
        "Profile picture updated successfully",
      data: user,
    });
  } catch (error: any) {
    console.error(
      "PROFILE UPLOAD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to upload profile picture",
    });
  }
};