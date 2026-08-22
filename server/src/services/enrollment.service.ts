import prisma from "../config/prisma.js";

// ==========================================
// STUDENT ENROLL
// ==========================================

export const createEnrollment = async (
  studentId: number,
  courseId: number
) => {
  const course =
    await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

  if (!course) {
    throw new Error(
      "Course not found"
    );
  }

  const existingEnrollment =
    await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

  if (existingEnrollment) {
    throw new Error(
      "Student is already enrolled in this course"
    );
  }

  return prisma.enrollment.create({
    data: {
      studentId,
      courseId,
    },

    include: {
      course: true,
    },
  });
};

// ==========================================
// STUDENT MY COURSES
// ==========================================

export const getMyEnrollments = async (
  studentId: number
) => {
  return prisma.enrollment.findMany({
    where: {
      studentId,
    },

    include: {
      course: {
        include: {
          lessons: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },

    orderBy: {
      enrolledAt: "desc",
    },
  });
};

// ==========================================
// TEACHER ENROLLED STUDENTS
// ==========================================

export const getEnrolledStudentsByCourse =
  async (
    courseId: number,
    teacherId: number
  ) => {

    // --------------------------------------
    // CHECK COURSE
    // --------------------------------------

    const course =
      await prisma.course.findUnique({
        where: {
          id: courseId,
        },

        select: {
          id: true,
          teacherId: true,
        },
      });

    if (!course) {
      throw new Error(
        "Course not found"
      );
    }

    // --------------------------------------
    // CHECK COURSE OWNER
    // --------------------------------------

    if (
      course.teacherId !== teacherId
    ) {
      throw new Error(
        "You can only view students enrolled in your own course"
      );
    }

    // --------------------------------------
    // GET ENROLLED STUDENTS
    // --------------------------------------

    const enrollments =
      await prisma.enrollment.findMany({
        where: {
          courseId,
        },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },

        orderBy: {
          enrolledAt: "desc",
        },
      });

    // --------------------------------------
    // RETURN STUDENTS ONLY
    // --------------------------------------

    return enrollments.map(
      (enrollment) =>
        enrollment.student
    );
  };