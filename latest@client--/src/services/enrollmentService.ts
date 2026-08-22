import api from "./api";

export const enrollInCourse = async (courseId: number) => {
  const response = await api.post("/enrollments", {
    courseId,
  });

  return response.data;
};

export const getMyCourses = async () => {
  const response = await api.get("/enrollments/my-courses");

  return response.data;
};