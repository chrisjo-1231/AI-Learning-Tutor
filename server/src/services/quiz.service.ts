import prisma from "../config/prisma.js";

/* =====================================================
   GET ALL QUIZZES FOR TEACHER
===================================================== */
export async function getQuizzes(
  teacherId: number
) {
  return prisma.quiz.findMany({
    where: {
      lesson: {
        course: {
          teacherId,
        },
      },
    },

    include: {
      lesson: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              teacherId: true,
            },
          },
        },
      },

      questions: {
        select: {
          id: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}
/* =====================================================
   GET QUIZ BY ID
===================================================== */
export async function getQuizById(
  quizId: number,
  teacherId: number
) {
  return prisma.quiz.findFirst({
    where: {
      id: quizId,

      lesson: {
        course: {
          teacherId,
        },
      },
    },

    include: {
      lesson: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              teacherId: true,
            },
          },
        },
      },

      questions: true,
    },
  });
}
/* =====================================================
   GET QUIZ FOR STUDENT
===================================================== */

export async function getStudentQuizById(
  quizId: number
) {
  return prisma.quiz.findUnique({
    where: {
      id: quizId,
    },

    include: {
      lesson: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },

      questions: {
        select: {
          id: true,
          questionText: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
        },
      },
    },
  });
}
/* =====================================================
   CREATE QUIZ
===================================================== */

export async function createQuiz(
title: string, lessonId: number, questions: any[], userId: number) {
  return await prisma.$transaction(
    async (tx) => {
      const quiz =
        await tx.quiz.create({
          data: {
            title,
            lessonId,
          },
        });

      await tx.question.createMany({
        data: questions.map(
          (question) => ({
            quizId: quiz.id,

            questionText:
              question.questionText,

            optionA:
              question.optionA,

            optionB:
              question.optionB,

            optionC:
              question.optionC,

            optionD:
              question.optionD,

            correctAnswer:
              question.correctAnswer,
          })
        ),
      });

      return await tx.quiz.findUnique({
        where: {
          id: quiz.id,
        },

        include: {
          lesson: {
            include: {
              course: true,
            },
          },

          questions: true,
        },
      });
    }
  );
}

/* =====================================================
   UPDATE QUIZ
===================================================== */

export async function updateQuiz(
id: number, title: string, lessonId: number, questions: any[], userId: number) {
  return await prisma.$transaction(
    async (tx) => {
      await tx.quiz.update({
        where: {
          id,
        },

        data: {
          title,
          lessonId,
        },
      });

      await tx.question.deleteMany({
        where: {
          quizId: id,
        },
      });

      await tx.question.createMany({
        data: questions.map(
          (question) => ({
            quizId: id,

            questionText:
              question.questionText,

            optionA:
              question.optionA,

            optionB:
              question.optionB,

            optionC:
              question.optionC,

            optionD:
              question.optionD,

            correctAnswer:
              question.correctAnswer,
          })
        ),
      });

      return await tx.quiz.findUnique({
        where: {
          id,
        },

        include: {
          lesson: {
            include: {
              course: true,
            },
          },

          questions: true,
        },
      });
    }
  );
}

/* =====================================================
   DELETE QUIZ
===================================================== */

export async function deleteQuiz(
  quizId: number,
  teacherId: number
) {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,

      lesson: {
        course: {
          teacherId,
        },
      },
    },
  });

  if (!quiz) {
    throw new Error(
      "Quiz not found or you do not have permission to delete it."
    );
  }

  return prisma.quiz.delete({
    where: {
      id: quizId,
    },
  });
}
/* =====================================================
   SUBMIT QUIZ
===================================================== */
/* =====================================================
   SUBMIT QUIZ
   Student submits quiz and creates a quiz attempt.
===================================================== */

/* =====================================================
   SUBMIT QUIZ
   Student submits quiz and creates a quiz attempt.
===================================================== */

export async function submitQuiz(
  quizId: number,
  studentId: number,
  answers: any[]
) {
  const quiz =
    await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },

      include: {
        questions: true,

        lesson: {
          include: {
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

  if (!quiz) {
    throw new Error(
      "Quiz not found."
    );
  }

  /* ---------------------------------------------
     CALCULATE SCORE
  --------------------------------------------- */

  let score = 0;

  for (const answer of answers) {
    const question =
      quiz.questions.find(
        (q) =>
          q.id ===
          Number(answer.questionId)
      );

    if (!question) {
      continue;
    }

    if (
      question.correctAnswer ===
      answer.answer
    ) {
      score++;
    }
  }

  const totalItems =
    quiz.questions.length;

  const percentage =
    totalItems > 0
      ? Math.round(
          (score / totalItems) * 100
        )
      : 0;

  /* ---------------------------------------------
     SAVE ATTEMPT
  --------------------------------------------- */

  const attempt =
    await prisma.quizAttempt.create({
      data: {
        studentId,
        quizId,
        score,
        totalItems,
      },
    });

  /* ---------------------------------------------
     RETURN RESULT
  --------------------------------------------- */

  return {
    attempt,
    quizId,
    score,
    totalItems,
    percentage,
  };
}