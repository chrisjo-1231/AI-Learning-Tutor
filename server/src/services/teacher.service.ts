import prisma from "../config/prisma.js";

/* =====================================================
   TEACHER DASHBOARD
===================================================== */

export const getTeacherDashboard = async (
  teacherId: number
) => {
  const teacher = await prisma.user.findUnique({
    where: {
      id: teacherId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  if (teacher.role !== "TEACHER") {
    throw new Error("User is not a teacher");
  }

  const courses = await prisma.course.findMany({
    where: {
      teacherId,
    },

    include: {
      lessons: {
        orderBy: {
          order: "asc",
        },

        include: {
          quizzes: {
            include: {
              questions: true,
            },
          },
        },
      },

      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },

      progress: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCourses = courses.map(
    (course) => {
      const totalLessons =
        course.lessons.length;

      const totalStudents =
        course.enrollments.length;

      const students =
        course.enrollments.map(
          (enrollment) => {
            const progress =
              course.progress.find(
                (item) =>
                  item.studentId ===
                  enrollment.studentId
              );

            return {
              student: enrollment.student,

              enrolledAt:
                enrollment.enrolledAt,

              progress: {
                completion:
                  progress?.completion ?? 0,
              },
            };
          }
        );

      const averageProgress =
        students.length === 0
          ? 0
          : Math.round(
              students.reduce(
                (sum, student) =>
                  sum +
                  student.progress
                    .completion,
                0
              ) / students.length
            );

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        createdAt: course.createdAt,

        statistics: {
          totalLessons,
          totalStudents,
          averageProgress,
        },

        lessons:
          course.lessons.map(
            (lesson) => ({
              id: lesson.id,
              title: lesson.title,
              content: lesson.content,
              order: lesson.order,

              quizzes:
                lesson.quizzes.map(
                  (quiz) => ({
                    id: quiz.id,
                    title: quiz.title,
                    questionCount:
                      quiz.questions.length,
                  })
                ),
            })
          ),

        students,
      };
    }
  );

  const totalCourses =
    formattedCourses.length;

  const totalLessons =
    formattedCourses.reduce(
      (sum, course) =>
        sum +
        course.statistics.totalLessons,
      0
    );

  const totalStudents =
    new Set(
      courses.flatMap((course) =>
        course.enrollments.map(
          (enrollment) =>
            enrollment.studentId
        )
      )
    ).size;

  const averageProgress =
    totalCourses === 0
      ? 0
      : Math.round(
          formattedCourses.reduce(
            (sum, course) =>
              sum +
              course.statistics
                .averageProgress,
            0
          ) / totalCourses
        );

  return {
    teacher,

    statistics: {
      totalCourses,
      totalLessons,
      totalStudents,
      averageProgress,
    },

    courses: formattedCourses,
  };
};

/* =====================================================
   GET TEACHER STUDENTS
===================================================== */

export const getTeacherStudents = async (
  teacherId: number
) => {
  const teacher = await prisma.user.findUnique({
    where: {
      id: teacherId,
    },

    select: {
      id: true,
      role: true,
    },
  });

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  if (teacher.role !== "TEACHER") {
    throw new Error("User is not a teacher");
  }

  const courses = await prisma.course.findMany({
    where: {
      teacherId,
    },

    select: {
      id: true,
      title: true,

      enrollments: {
        orderBy: {
          enrolledAt: "desc",
        },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },

      progress: {
        select: {
          studentId: true,
          completion: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const students = courses.flatMap(
    (course) =>
      course.enrollments.map(
        (enrollment) => {
          const progress =
            course.progress.find(
              (item) =>
                item.studentId ===
                enrollment.studentId
            );

          return {
            id: enrollment.student.id,
            name: enrollment.student.name,
            email: enrollment.student.email,
            profileImage:
              enrollment.student.profileImage,

            course: {
              id: course.id,
              title: course.title,
            },

            enrolledAt:
              enrollment.enrolledAt,

            progress:
              progress?.completion ?? 0,
          };
        }
      )
  );

  return students;
};