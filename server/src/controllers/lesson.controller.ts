import {
  Response,
} from "express";

import prisma from "../config/prisma.js";

import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../services/lesson.service.js";

import {
  AuthRequest,
} from "../middleware/auth.middleware.js";

/* =====================================================
   CREATE LESSON
   Teacher can ONLY create lessons in their own course.
===================================================== */

export async function create(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const courseId =
      Number(req.params.courseId);

    if (
      !Number.isInteger(courseId) ||
      courseId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid course ID",
      });
    }

    const {
      title,
      content,
      order,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lesson title is required",
      });
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lesson content is required",
      });
    }

    if (
      order === undefined ||
      order === null ||
      Number.isNaN(Number(order))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lesson order is required",
      });
    }

    /* ---------------------------------------------
       Find course
    --------------------------------------------- */

    const course =
      await prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message:
          "Course not found",
      });
    }

    /* ---------------------------------------------
       OWNERSHIP CHECK
    --------------------------------------------- */

    if (
      course.teacherId !==
      req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only manage lessons in your own courses",
      });
    }

    /* ---------------------------------------------
       Create lesson
    --------------------------------------------- */

    const lesson =
      await createLesson(
        courseId,
        title.trim(),
        content.trim(),
        Number(order)
      );

    return res.status(201).json({
      success: true,
      message:
        "Lesson created successfully",
      lesson,
    });

  } catch (error) {
    console.error(
      "CREATE LESSON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create lesson",
    });
  }
}

/* =====================================================
   GET LESSONS BY COURSE

   IMPORTANT:
   Teacher can ONLY view lessons from their own course.

   Students can still view lessons because this endpoint
   is also used by the student side.
===================================================== */

export async function index(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const courseId =
      Number(req.params.courseId);

    if (
      !Number.isInteger(courseId) ||
      courseId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid course ID",
      });
    }

    /* ---------------------------------------------
       Find course
    --------------------------------------------- */

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
      return res.status(404).json({
        success: false,
        message:
          "Course not found",
      });
    }

    /*
     * If authenticated user is the teacher,
     * make sure this is their course.
     *
     * We intentionally do not block students here.
     */

    if (
      req.user.role === "TEACHER" &&
      course.teacherId !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only access lessons from your own courses",
      });
    }

    /* ---------------------------------------------
       Get lessons
    --------------------------------------------- */

    const lessons =
      await getLessonsByCourse(
        courseId
      );

    return res.status(200).json({
      success: true,
      lessons,
    });

  } catch (error) {
    console.error(
      "GET LESSONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve lessons",
    });
  }
}

/* =====================================================
   GET LESSON BY ID

   Teacher:
   ONLY own course lessons.

   Student:
   Can view lesson.
===================================================== */

export async function show(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid lesson ID",
      });
    }

    const lesson =
      await getLessonById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message:
          "Lesson not found",
      });
    }

    /* ---------------------------------------------
       Teacher ownership check
    --------------------------------------------- */

    if (
      req.user.role === "TEACHER" &&
      lesson.course.teacherId !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only access your own lessons",
      });
    }

    return res.status(200).json({
      success: true,
      lesson,
    });

  } catch (error) {
    console.error(
      "GET LESSON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve lesson",
    });
  }
}

/* =====================================================
   UPDATE LESSON

   Teacher can ONLY update lessons
   belonging to their own course.
===================================================== */

export async function update(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid lesson ID",
      });
    }

    const lesson =
      await getLessonById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message:
          "Lesson not found",
      });
    }

    /* ---------------------------------------------
       OWNERSHIP CHECK
    --------------------------------------------- */

    if (
      lesson.course.teacherId !==
      req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only update your own lessons",
      });
    }

    const {
      title,
      content,
      order,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lesson title is required",
      });
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lesson content is required",
      });
    }

    if (
      order === undefined ||
      order === null ||
      Number.isNaN(Number(order))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lesson order is required",
      });
    }

    const updatedLesson =
      await updateLesson(
        id,
        title.trim(),
        content.trim(),
        Number(order)
      );

    return res.status(200).json({
      success: true,
      message:
        "Lesson updated successfully",
      lesson: updatedLesson,
    });

  } catch (error) {
    console.error(
      "UPDATE LESSON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update lesson",
    });
  }
}

/* =====================================================
   DELETE LESSON

   Teacher can ONLY delete lessons
   belonging to their own course.
===================================================== */

export async function remove(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid lesson ID",
      });
    }

    const lesson =
      await getLessonById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message:
          "Lesson not found",
      });
    }

    /* ---------------------------------------------
       OWNERSHIP CHECK
    --------------------------------------------- */

    if (
      lesson.course.teacherId !==
      req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own lessons",
      });
    }

    await deleteLesson(id);

    return res.status(200).json({
      success: true,
      message:
        "Lesson deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE LESSON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete lesson",
    });
  }
}