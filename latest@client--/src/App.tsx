import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";

import StudentDashboard from "./pages/student/Dashboard";
import AITutor from "./pages/student/AITutor";
import StudentCourses from "./pages/student/Courses";
import CourseDetails from "./pages/student/CourseDetails";
import LessonDetails from "./pages/student/LessonDetails";
import Profile from "./pages/student/Profile";
import BrowseCourses from "./pages/student/BrowseCourses";
import QuizDetails from "./pages/student/QuizDetails";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import CreateCourse from "./pages/teacher/CreateCourse";
import ManageCourse from "./pages/teacher/ManageCourse";
import CreateLesson from "./pages/teacher/CreateLesson";
import AdminDashboard from "./pages/admin/Dashboard";
import EditLesson from "./pages/teacher/EditLesson";
import EditCourse from "./pages/teacher/EditCourse";
import TeacherQuizzes from "./pages/teacher/TeacherQuizzes";
import CreateQuiz from "./pages/teacher/CreateQuiz";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import ManageQuiz from "./pages/teacher/ManageQuiz";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>

          {/* =================================================
              AUTH
          ================================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =================================================
              STUDENT
          ================================================= */}

          <Route
            element={
              <ProtectedRoute roles={["STUDENT"]} />
            }
          >
            <Route
              element={<StudentLayout />}
            >

              <Route
                path="/student"
                element={<StudentDashboard />}
              />
              <Route
  path="/student/ai-tutor"
  element={<AITutor />}
/>
              <Route
                path="/student/browse-courses"
                element={<BrowseCourses />}
              />

              <Route
                path="/student/courses"
                element={<StudentCourses />}
              />

              <Route
                path="/student/courses/:courseId"
                element={<CourseDetails />}
              />

              <Route
                path="/student/courses/:courseId/lessons/:lessonId"
                element={<LessonDetails />}
              />
              <Route
  path="/student/courses/:courseId/lessons/:lessonId/quiz/:quizId"
  element={<QuizDetails />}
/>
              <Route
                path="/student/profile"
                element={<Profile />}
              />

            </Route>
          </Route>

          {/* =================================================
              TEACHER
          ================================================= */}

          <Route
            element={
              <ProtectedRoute roles={["TEACHER"]} />
            }
          >

            <Route
              element={<TeacherLayout />}
            >

              {/* TEACHER DASHBOARD */}

              <Route
                path="/teacher"
                element={<TeacherDashboard />}
              />
              <Route
  path="/teacher/students"
  element={
   
      <TeacherStudents />
    }
/>
                <Route
  path="/teacher/quizzes/:quizId"
  element={<ManageQuiz />}
/>
              {/* TEACHER COURSES */}

              <Route
                path="/teacher/courses"
                element={<TeacherCourses />}
              />
              <Route
                 path="/teacher/courses/create"
                element={<CreateCourse />}
              />
              <Route
               path="/teacher/courses/:courseId"
              element={<ManageCourse />}
               />
               <Route
  path="/teacher/courses/:courseId/lessons/create"
  element={<CreateLesson />}
/>
<Route
  path="/teacher/courses/:courseId/lessons/:lessonId/edit"
  element={
    
      <EditLesson />
  }
/>
<Route
  path="/teacher/courses/:courseId/edit"
  element={
      <EditCourse />
   
  }
/>
<Route
  path="/teacher/quizzes"
  element={
   
      <TeacherQuizzes />
      
   
  }
/>
<Route
  path="/teacher/quizzes/create"
  element={
    
      <CreateQuiz />
    
  }
/>

<Route
  path="/teacher/profile"
  element={<TeacherProfile />}
/>
            </Route>

          </Route>

          {/* =================================================
              ADMIN
          ================================================= */}

          <Route
            element={
              <ProtectedRoute roles={["ADMIN"]} />
            }
          >

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

          </Route>

          {/* =================================================
              DEFAULT
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;