import prisma from "../config/prisma.js";

// ==========================================
// CREATE COURSE
// ==========================================

export async function createCourse(
  title: string,
  description: string,
  teacherId: number
) {
  return prisma.course.create({
    data: {
      title,
      description,
      teacherId,
    },
  });
}

// ==========================================
// GET ALL COURSES
// PUBLIC / STUDENT
// ==========================================
export async function getCourses(
  teacherId: number
) {
  return prisma.course.findMany({
    where: {
      teacherId,
    },

    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      _count: {
        select: {
          enrollments: true,
          lessons: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// ==========================================
// GET ALL AVAILABLE COURSES
// STUDENT BROWSE
// ==========================================

export async function getAllCourses() {
  return prisma.course.findMany({
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
        },
      },

      _count: {
        select: {
          enrollments: true,
          lessons: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// ==========================================
// GET TEACHER COURSES
// ==========================================

export async function getTeacherCourses(
  teacherId: number
) {
  return prisma.course.findMany({
    where: {
      teacherId,
    },

    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      lessons: {
        orderBy: {
          order: "asc",
        },
      },

      _count: {
        select: {
          enrollments: true,
          lessons: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// ==========================================
// GET COURSE BY ID
// ==========================================

export async function getCourseById(
  id: number
) {
  return prisma.course.findUnique({
    where: {
      id,
    },

    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      lessons: {
        orderBy: {
          order: "asc",
        },
      },

      _count: {
        select: {
          enrollments: true,
          lessons: true,
        },
      },
    },
  });
}

// ==========================================
// UPDATE COURSE
// ==========================================

export async function updateCourse(
  id: number,
  title: string,
  description: string | null
) {
  return prisma.course.update({
    where: {
      id,
    },

    data: {
      title,
      description,
    },
  });
}