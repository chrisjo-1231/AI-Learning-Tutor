import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

// ==========================================
// ADMIN DASHBOARD
// ==========================================

export const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalAdmins,
    totalCourses,
    totalEnrollments,
    totalLessons,
    totalQuizzes,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        role: "STUDENT",
      },
    }),

    prisma.user.count({
      where: {
        role: "TEACHER",
      },
    }),

    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),

    prisma.course.count(),

    prisma.enrollment.count(),

    prisma.lesson.count(),

    prisma.quiz.count(),
  ]);

  return {
    statistics: {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalCourses,
      totalEnrollments,
      totalLessons,
      totalQuizzes,
    },
  };
};

// ==========================================
// GET ALL USERS
// ==========================================

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET USER BY ID
// ==========================================

export const getUserById = async (
  userId: number
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,

      courses: {
        select: {
          id: true,
          title: true,
        },
      },

      enrollments: {
        select: {
          id: true,
          enrolledAt: true,

          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ==========================================
// CREATE USER
// ==========================================

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role:
    | "STUDENT"
    | "TEACHER"
    | "ADMIN"
) => {
  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingUser) {
    throw new Error(
      "Email is already registered"
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

// ==========================================
// UPDATE USER ROLE
// ==========================================

export const updateUserRole = async (
  userId: number,
  role:
    | "STUDENT"
    | "TEACHER"
    | "ADMIN"
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      role,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });
};

// ==========================================
// DELETE USER
// ==========================================

export const deleteUser = async (
  userId: number
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    id: userId,
    message: "User deleted successfully",
  };
};