import prisma from "../config/prisma.js";

/* =====================================================
   CREATE LESSON
===================================================== */

export async function createLesson(
  courseId: number,
  title: string,
  content: string,
  order: number
) {
  return prisma.$transaction(async (tx) => {
    /* ---------------------------------------------
       Validate order
    --------------------------------------------- */

    if (
      !Number.isInteger(order) ||
      order < 1
    ) {
      throw new Error(
        "Lesson order must be a positive integer"
      );
    }

    /* ---------------------------------------------
       Check if order already exists
    --------------------------------------------- */

    const existingLesson =
      await tx.lesson.findFirst({
        where: {
          courseId,
          order,
        },
        select: {
          id: true,
        },
      });

    /* ---------------------------------------------
       Shift existing lessons
       Example:

       Existing:
       1
       2
       3

       New lesson = 2

       Result:
       1
       2 NEW
       3 -> 4
       --------------------------------------------- */

    if (existingLesson) {
      await tx.lesson.updateMany({
        where: {
          courseId,
          order: {
            gte: order,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      });
    }

    /* ---------------------------------------------
       Create lesson
    --------------------------------------------- */

    return tx.lesson.create({
      data: {
        courseId,
        title,
        content,
        order,
      },
    });
  });
}

/* =====================================================
   GET LESSONS BY COURSE
===================================================== */

export async function getLessonsByCourse(
  courseId: number
) {
  return prisma.lesson.findMany({
    where: {
      courseId,
    },

    orderBy: {
      order: "asc",
    },
  });
}

/* =====================================================
   GET LESSON BY ID
===================================================== */

export async function getLessonById(
  id: number
) {
  return prisma.lesson.findUnique({
    where: {
      id,
    },

    include: {
      course: true,
      quizzes: true,
    },
  });
}

/* =====================================================
   UPDATE LESSON
===================================================== */

export async function updateLesson(
  id: number,
  title: string,
  content: string,
  order: number
) {
  return prisma.$transaction(async (tx) => {
    /* ---------------------------------------------
       Find current lesson
    --------------------------------------------- */

    const currentLesson =
      await tx.lesson.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          courseId: true,
          order: true,
        },
      });

    if (!currentLesson) {
      throw new Error(
        "Lesson not found"
      );
    }

    /* ---------------------------------------------
       Validate order
    --------------------------------------------- */

    if (
      !Number.isInteger(order) ||
      order < 1
    ) {
      throw new Error(
        "Lesson order must be a positive integer"
      );
    }

    /* ---------------------------------------------
       Only reorder when order changed
    --------------------------------------------- */

    if (
      currentLesson.order !== order
    ) {
      const conflictingLesson =
        await tx.lesson.findFirst({
          where: {
            courseId:
              currentLesson.courseId,

            order,

            id: {
              not: id,
            },
          },

          select: {
            id: true,
          },
        });

      if (conflictingLesson) {
        /* -----------------------------------------
           Moving lesson UP
           Example:
           1
           2 <- current
           3

           Change 3 -> 1

           Result:
           1 <- current
           2
           3
           ----------------------------------------- */

        if (
          order <
          currentLesson.order
        ) {
          await tx.lesson.updateMany({
            where: {
              courseId:
                currentLesson.courseId,

              order: {
                gte: order,
                lt: currentLesson.order,
              },

              id: {
                not: id,
              },
            },

            data: {
              order: {
                increment: 1,
              },
            },
          });

        } else {
          /* ---------------------------------------
             Moving lesson DOWN
             --------------------------------------- */

          await tx.lesson.updateMany({
            where: {
              courseId:
                currentLesson.courseId,

              order: {
                gt: currentLesson.order,
                lte: order,
              },

              id: {
                not: id,
              },
            },

            data: {
              order: {
                decrement: 1,
              },
            },
          });
        }
      }
    }

    /* ---------------------------------------------
       Update lesson
    --------------------------------------------- */

    return tx.lesson.update({
      where: {
        id,
      },

      data: {
        title,
        content,
        order,
      },
    });
  });
}

/* =====================================================
   DELETE LESSON
===================================================== */

export async function deleteLesson(
  id: number
) {
  return prisma.$transaction(async (tx) => {
    /* ---------------------------------------------
       Get lesson before deleting
    --------------------------------------------- */

    const lesson =
      await tx.lesson.findUnique({
        where: {
          id,
        },

        select: {
          courseId: true,
          order: true,
        },
      });

    if (!lesson) {
      throw new Error(
        "Lesson not found"
      );
    }

    /* ---------------------------------------------
       Delete lesson
    --------------------------------------------- */

    const deleted =
      await tx.lesson.delete({
        where: {
          id,
        },
      });

    /* ---------------------------------------------
       Close the order gap

       Example:
       1
       2
       3 <- deleted
       4

       Result:
       1
       2
       3
       --------------------------------------------- */

    await tx.lesson.updateMany({
      where: {
        courseId:
          lesson.courseId,

        order: {
          gt: lesson.order,
        },
      },

      data: {
        order: {
          decrement: 1,
        },
      },
    });

    return deleted;
  });
}