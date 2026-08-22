import {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

/* =====================================================
   USER ROLE
===================================================== */

export type UserRole =
  | "STUDENT"
  | "TEACHER"
  | "ADMIN";

/* =====================================================
   AUTH REQUEST
===================================================== */

export interface AuthRequest
  extends Request {
  user?: {
    userId: number;
    role: UserRole;
  };
}

/* =====================================================
   AUTHENTICATE TOKEN
===================================================== */

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    /* ---------------------------------------------
       GET AUTHORIZATION HEADER
    --------------------------------------------- */

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization header is required",
      });
    }

    /* ---------------------------------------------
       GET TOKEN
    --------------------------------------------- */

    const token =
      authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required",
      });
    }

    /* ---------------------------------------------
       JWT SECRET
    --------------------------------------------- */

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      console.error(
        "JWT_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message:
          "JWT_SECRET is not configured",
      });
    }

    /* ---------------------------------------------
       VERIFY TOKEN
    --------------------------------------------- */

    const decoded = jwt.verify(
      token,
      secret
    ) as {
      userId?: number | string;
      role?: UserRole;
    };

    /* ---------------------------------------------
       VALIDATE PAYLOAD
    --------------------------------------------- */

    if (
      decoded.userId === undefined ||
      decoded.userId === null ||
      !decoded.role
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid token payload",
      });
    }

    const userId =
      Number(decoded.userId);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid user ID in token",
      });
    }

    /* ---------------------------------------------
       VALIDATE ROLE
    --------------------------------------------- */

    if (
      decoded.role !== "STUDENT" &&
      decoded.role !== "TEACHER" &&
      decoded.role !== "ADMIN"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid role in token",
      });
    }

    /* ---------------------------------------------
       ATTACH USER TO REQUEST
    --------------------------------------------- */

    req.user = {
      userId,
      role: decoded.role,
    };

    console.log(
      "AUTHENTICATED USER:",
      req.user
    );

    /* ---------------------------------------------
       CONTINUE
    --------------------------------------------- */

    next();

  } catch (error) {
    console.error(
      "AUTHENTICATION ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};

/* =====================================================
   AUTHORIZE ROLES
===================================================== */

export const authorizeRoles = (
  ...allowedRoles: UserRole[]
) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {

    /* ---------------------------------------------
       USER MUST BE AUTHENTICATED
    --------------------------------------------- */

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    /* ---------------------------------------------
       CHECK ROLE
    --------------------------------------------- */

    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    console.log(
      "AUTHORIZED ROLE:",
      req.user.role
    );

    next();
  };
};