import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| STUDENT DASHBOARD
|--------------------------------------------------------------------------
*/

export const getStudentDashboard = async (
  studentId: number
) => {
  const student =
    await prisma.user.findUnique({
      where: {
        id: studentId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

  if (!student) {
    throw new Error("Student not found");
  }

  const enrollments =
    await prisma.enrollment.findMany({
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

              include: {
                lessonProgress: {
                  where: {
                    studentId,
                  },
                },

                quizzes: {
                  include: {
                    attempts: {
                      where: {
                        studentId,
                      },

                      orderBy: {
                        completedAt: "desc",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      orderBy: {
        enrolledAt: "desc",
      },
    });

  const courses = enrollments.map(
    (enrollment) => {
      const course =
        enrollment.course;

      const totalLessons =
        course.lessons.length;

      const completedLessons =
        course.lessons.filter(
          (lesson) =>
            lesson.lessonProgress.some(
              (progress) =>
                Boolean(progress.completed)
            )
        ).length;

      const percentage =
        totalLessons === 0
          ? 0
          : Math.round(
              (completedLessons /
                totalLessons) *
                100
            );

      return {
        enrollmentId:
          enrollment.id,

        course: {
          id: course.id,
          title: course.title,
          description:
            course.description,
        },

        enrolledAt:
          enrollment.enrolledAt,

        progress: {
          totalLessons,
          completedLessons,
          percentage,
        },

        lessons:
          course.lessons.map(
            (lesson) => ({
              id: lesson.id,
              title: lesson.title,
              order: lesson.order,

              completed:
                lesson.lessonProgress.some(
                  (progress) =>
                    Boolean(
                      progress.completed
                    )
                ),

              quizzes:
                lesson.quizzes.map(
                  (quiz) => ({
                    id: quiz.id,
                    title: quiz.title,

                    attempts:
                      quiz.attempts.map(
                        (attempt) => ({
                          id: attempt.id,
                          score:
                            attempt.score,
                          totalItems:
                            attempt.totalItems,

                          percentage:
                            attempt.totalItems ===
                            0
                              ? 0
                              : Math.round(
                                  (attempt.score /
                                    attempt.totalItems) *
                                    100
                                ),

                          completedAt:
                            attempt.completedAt,
                        })
                      ),
                  })
                ),
            })
          ),
      };
    }
  );

  const totalCourses =
    courses.length;

  const completedCourses =
    courses.filter(
      (course) =>
        course.progress.percentage ===
        100
    ).length;

  const averageProgress =
    totalCourses === 0
      ? 0
      : Math.round(
          courses.reduce(
            (sum, course) =>
              sum +
              course.progress.percentage,
            0
          ) / totalCourses
        );

  return {
    student,

    statistics: {
      totalCourses,
      completedCourses,
      averageProgress,
    },

    courses,
  };
};

/*
|--------------------------------------------------------------------------
| STUDENT COURSE DETAILS
|--------------------------------------------------------------------------
*/

export const getStudentCourseDetails =
  async (
    studentId: number,
    courseId: number
  ) => {
    /*
     * IMPORTANT:
     * Check muna kung enrolled ang student.
     */

    const enrollment =
      await prisma.enrollment.findFirst({
        where: {
          studentId,
          courseId,
        },

        include: {
          course: {
            include: {
              lessons: {
                orderBy: {
                  order: "asc",
                },

                include: {
                  lessonProgress: {
                    where: {
                      studentId,
                    },
                  },

                  quizzes: {
                    include: {
                      attempts: {
                        where: {
                          studentId,
                        },

                        orderBy: {
                          completedAt:
                            "desc",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!enrollment) {
      throw new Error(
        "Course not found or student is not enrolled in this course."
      );
    }

    const course =
      enrollment.course;

    const totalLessons =
      course.lessons.length;

    const completedLessons =
      course.lessons.filter(
        (lesson) =>
          lesson.lessonProgress.some(
            (progress) =>
              Boolean(progress.completed)
          )
      ).length;

    const percentage =
      totalLessons === 0
        ? 0
        : Math.round(
            (completedLessons /
              totalLessons) *
              100
          );

    return {
      enrollmentId:
        enrollment.id,

      enrolledAt:
        enrollment.enrolledAt,

      course: {
        id: course.id,
        title: course.title,
        description:
          course.description,
      },

      progress: {
        totalLessons,
        completedLessons,
        percentage,
      },

      lessons:
        course.lessons.map(
          (lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.order,

            completed:
              lesson.lessonProgress.some(
                (progress) =>
                  Boolean(
                    progress.completed
                  )
              ),

            quizzes:
              lesson.quizzes.map(
                (quiz) => ({
                  id: quiz.id,
                  title: quiz.title,

                  attempts:
                    quiz.attempts.map(
                      (attempt) => ({
                        id: attempt.id,
                        score:
                          attempt.score,
                        totalItems:
                          attempt.totalItems,

                        percentage:
                          attempt.totalItems ===
                          0
                            ? 0
                            : Math.round(
                                (attempt.score /
                                  attempt.totalItems) *
                                  100
                              ),

                        completedAt:
                          attempt.completedAt,
                      })
                    ),
                })
              ),
          })
        ),
    };
  };
  export const getStudentCourses = async (
  studentId: number
) => {
  const enrollments =
    await prisma.enrollment.findMany({
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

              include: {
                lessonProgress: {
                  where: {
                    studentId,
                  },
                },

                quizzes: {
                  include: {
                    attempts: {
                      where: {
                        studentId,
                      },

                      orderBy: {
                        completedAt: "desc",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      orderBy: {
        enrolledAt: "desc",
      },
    });

  return enrollments.map(
    (enrollment) => {
      const course =
        enrollment.course;

      const totalLessons =
        course.lessons.length;

      const completedLessons =
        course.lessons.filter(
          (lesson) =>
            lesson.lessonProgress.some(
              (progress) =>
                Boolean(progress.completed)
            )
        ).length;

      const percentage =
        totalLessons === 0
          ? 0
          : Math.round(
              (completedLessons /
                totalLessons) *
                100
            );

      return {
        enrollmentId:
          enrollment.id,

        enrolledAt:
          enrollment.enrolledAt,

        course: {
          id: course.id,
          title: course.title,
          description:
            course.description,
        },

        progress: {
          totalLessons,
          completedLessons,
          percentage,
        },

        lessons:
          course.lessons.map(
            (lesson) => ({
              id: lesson.id,
              title: lesson.title,
              
              order: lesson.order,

              completed:
                lesson.lessonProgress.some(
                  (progress) =>
                    Boolean(
                      progress.completed
                    )
                ),

              quizzes:
                lesson.quizzes.map(
                  (quiz) => ({
                    id: quiz.id,
                    title: quiz.title,

                    attempts:
                      quiz.attempts.map(
                        (attempt) => ({
                          id: attempt.id,
                          score:
                            attempt.score,
                          totalItems:
                            attempt.totalItems,

                          percentage:
                            attempt.totalItems ===
                            0
                              ? 0
                              : Math.round(
                                  (attempt.score /
                                    attempt.totalItems) *
                                    100
                                ),

                          completedAt:
                            attempt.completedAt,
                        })
                      ),
                  })
                ),
            })
          ),
      };
    }
  );
};
export const getStudentLessonDetails = async (
  studentId: number,
  courseId: number,
  lessonId: number
) => {
  /*
  |--------------------------------------------------------------------------
  | CHECK ENROLLMENT
  |--------------------------------------------------------------------------
  */

  const enrollment =
    await prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
      },
    });

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this course."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | GET LESSON
  |--------------------------------------------------------------------------
  */

  const lesson =
    await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        courseId,
      },

      include: {
        lessonProgress: {
          where: {
            studentId,
          },
        },

        quizzes: {
          include: {
            attempts: {
              where: {
                studentId,
              },

              orderBy: {
                completedAt: "desc",
              },
            },
          },
        },
      },
    });

  if (!lesson) {
    throw new Error(
      "Lesson not found."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LESSON PROGRESS
  |--------------------------------------------------------------------------
  */

  const progress =
    lesson.lessonProgress[0];

  /*
  |--------------------------------------------------------------------------
  | RETURN LESSON
  |--------------------------------------------------------------------------
  */

  return {
    courseId,

    lesson: {
      id: lesson.id,
      title: lesson.title,

      // IMPORTANT: SEND LESSON CONTENT
      content: lesson.content,

      order: lesson.order,

      completed:
        Boolean(
          progress?.completed
        ),

      quizzes:
        lesson.quizzes.map(
          (quiz) => ({
            id: quiz.id,
            title: quiz.title,

            attempts:
              quiz.attempts.map(
                (attempt) => ({
                  id: attempt.id,

                  score:
                    attempt.score,

                  totalItems:
                    attempt.totalItems,

                  percentage:
                    attempt.totalItems ===
                    0
                      ? 0
                      : Math.round(
                          (attempt.score /
                            attempt.totalItems) *
                            100
                        ),

                  completedAt:
                    attempt.completedAt,
                })
              ),
          })
        ),
    },
  };
};
  export const markLessonComplete =
  async (
    studentId: number,
    courseId: number,
    lessonId: number
  ) => {

    /*
    |--------------------------------------------------------------------------
    | CHECK ENROLLMENT
    |--------------------------------------------------------------------------
    */

    const enrollment =
      await prisma.enrollment.findFirst({
        where: {
          studentId,
          courseId,
        },
      });

    if (!enrollment) {
      throw new Error(
        "You are not enrolled in this course."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK LESSON
    |--------------------------------------------------------------------------
    */

    const lesson =
      await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          courseId,
        },
      });

    if (!lesson) {
      throw new Error(
        "Lesson not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE PROGRESS
    |--------------------------------------------------------------------------
    */

    const progress =
      await prisma.lessonProgress.upsert({
        where: {
          studentId_lessonId: {
            studentId,
            lessonId,
          },
        },

        update: {
          completed: true,
          completedAt: new Date(),
        },

        create: {
          studentId,
          lessonId,
          courseId,
          completed: true,
          completedAt: new Date(),
        },
      });

    /*
    |--------------------------------------------------------------------------
    | RECALCULATE COURSE PROGRESS
    |--------------------------------------------------------------------------
    */

    const totalLessons =
      await prisma.lesson.count({
        where: {
          courseId,
        },
      });

    const completedLessons =
      await prisma.lessonProgress.count({
        where: {
          studentId,

          completed: true,

          lesson: {
            courseId,
          },
        },
      });

    const percentage =
      totalLessons === 0
        ? 0
        : Math.round(
            (completedLessons /
              totalLessons) *
              100
          );

    return {
      lessonProgress: progress,

      courseProgress: {
        totalLessons,
        completedLessons,
        percentage,
      },
    };
  };