import prisma from "../config/prisma.js";

const prismaWithLessonProgress = prisma as typeof prisma & {
  lessonProgress: {
    upsert: (...args: any[]) => any;
    count: (...args: any[]) => any;
    findMany: (...args: any[]) => any;
  };
};

export const markLessonProgress = async (
  studentId: number,
  lessonId: number,
  completed: boolean
) => {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId: lesson.courseId,
      },
    },
  });

  if (!enrollment) {
    throw new Error("Student is not enrolled in this course");
  }

  const lessonProgress = await prismaWithLessonProgress.lessonProgress.upsert({
    where: {
      studentId_lessonId: {
        studentId,
        lessonId,
      },
    },

    update: {
      completed,
      completedAt: completed ? new Date() : null,
    },

    create: {
      studentId,
      courseId: lesson.courseId,
      lessonId,
      completed,
      completedAt: completed ? new Date() : null,
    },

    include: {
      lesson: true,
    },
  });

  await updateCourseProgress(
    studentId,
    lesson.courseId
  );

  return lessonProgress;
};


export const updateCourseProgress = async (
  studentId: number,
  courseId: number
) => {
  const totalLessons = await prisma.lesson.count({
    where: {
      courseId,
    },
  });

  const completedLessons =
    await prismaWithLessonProgress.lessonProgress.count({
      where: {
        studentId,
        courseId,
        completed: true,
      },
    });

  const completion =
    totalLessons === 0
      ? 0
      : Math.round(
          (completedLessons / totalLessons) * 100
        );

  return await prisma.progress.upsert({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },

    update: {
      completion,
    },

    create: {
      studentId,
      courseId,
      completion,
    },
  });
};


export const getCourseProgress = async (
  studentId: number,
  courseId: number
) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },

    include: {
      lessons: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const enrollment =
    await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

  if (!enrollment) {
    throw new Error(
      "Student is not enrolled in this course"
    );
  }

  const progress =
    await prismaWithLessonProgress.lessonProgress.findMany({
      where: {
        studentId,
        courseId,
      },

      include: {
        lesson: true,
      },

      orderBy: {
        lesson: {
          order: "asc",
        },
      },
    });

  const totalLessons = course.lessons.length;

  const completedLessons = progress.filter(
    (item: { completed: any; }) => item.completed
  ).length;

  const percentage =
    totalLessons === 0
      ? 0
      : Math.round(
          (completedLessons / totalLessons) * 100
        );

  return {
    courseId,
    courseTitle: course.title,
    totalLessons,
    completedLessons,
    percentage,
    lessons: course.lessons.map((lesson) => {
      const lessonProgress = progress.find(
        (item: { lessonId: number; }) => item.lessonId === lesson.id
      );

      return {
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        completed:
          lessonProgress?.completed ?? false,
        completedAt:
          lessonProgress?.completedAt ?? null,
      };
    }),
  };
};


export const getMyProgress = async (
  studentId: number
) => {
  return await prisma.progress.findMany({
    where: {
      studentId,
    },

    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });
};