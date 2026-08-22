import {
  Response,
} from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  getAllCourses,
} from "../services/course.service.js";

import {
  AuthRequest,
} from "../middleware/auth.middleware.js";

/* =====================================================
   CREATE COURSE
===================================================== */

export async function create(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      title,
      description,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Course title is required",
      });
    }

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course description is required",
      });
    }

    const course =
      await createCourse(
        title.trim(),
        description.trim(),
        req.user.userId
      );

    return res.status(201).json({
      success: true,
      message:
        "Course created successfully",
      course,
    });

  } catch (error) {
    console.error(
      "CREATE COURSE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create course",
    });
  }
}

/* =====================================================
   GET MY COURSES
   Teacher sees ONLY courses that belong to them.
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

    const courses =
      await getCourses(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      courses,
    });

  } catch (error) {
    console.error(
      "GET TEACHER COURSES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve courses",
    });
  }
}

/* =====================================================
   GET COURSE BY ID
   Teacher can ONLY access their own course.
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

    const courseId =
      Number(req.params.id);

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

    const course =
      await getCourseById(
        courseId
      );

    if (!course) {
      return res.status(404).json({
        success: false,
        message:
          "Course not found",
      });
    }

    /*
     * SECURITY CHECK
     *
     * The course must belong to
     * the currently authenticated teacher.
     */

    if (
      course.teacherId !==
      req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only access your own courses",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });

  } catch (error) {
    console.error(
      "GET COURSE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve course",
    });
  }
}

/* =====================================================
   UPDATE COURSE
   Teacher can ONLY update their own course.
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

    const courseId =
      Number(req.params.id);

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

    const course =
      await getCourseById(
        courseId
      );

    if (!course) {
      return res.status(404).json({
        success: false,
        message:
          "Course not found",
      });
    }

    /*
     * SECURITY CHECK
     */

    if (
      course.teacherId !==
      req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only update your own courses",
      });
    }

    const {
      title,
      description,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course title is required",
      });
    }

    let cleanDescription:
      string | null = null;

    if (
      typeof description ===
        "string" &&
      description.trim()
    ) {
      cleanDescription =
        description.trim();
    }

    const updatedCourse =
      await updateCourse(
        courseId,
        title.trim(),
        cleanDescription
      );

    return res.status(200).json({
      success: true,
      message:
        "Course updated successfully",
      course: updatedCourse,
    });

  } catch (error) {
    console.error(
      "UPDATE COURSE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update course",
    });
  }
}
/* =====================================================
   BROWSE COURSES
   Student can see all available courses.
===================================================== */

export async function browse(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const courses = await getAllCourses();

    return res.status(200).json({
      success: true,
      courses,
    });

  } catch (error) {
    console.error(
      "BROWSE COURSES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve courses",
    });
  }
}