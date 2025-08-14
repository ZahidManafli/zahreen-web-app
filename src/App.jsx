// App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import AuthCard from "./pages/login/login";
import Dashboard from "./pages/dashboard";
import MainLayout from "./layout/common/mainlayout";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import CoursesPage from "./pages/courses";
import '@fortawesome/fontawesome-free/css/all.min.css';
import TestsPage from "./pages/tests";
import CreateQuiz from "./pages/create-quiz";
import AddQuestionsAnswersToQuiz from "./pages/add-questions-answers-to-quiz";
import QuizDetails from "./pages/test-detail";
import Results from "./pages/quiz-results";
import Requests from "./pages/reguests/Reguests";
import Schedule from "./pages/schedule";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Groups from "./pages/groups";
import CreateGroup from "./pages/create-group";
import SubjectsPage from "./pages/subjects";
import UsersPage from "./pages/users";
import Leaderboard from "./pages/leaders";
import Profile from "./pages/profil";
import QuizResultStudent from "./pages/quiz-result-student";
import ParentList from "./pages/parents";
import Childs from "./pages/childs";

function AppWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const isAuthPage = location.pathname === "/login";

    if (!token && !isAuthPage) {
      navigate("/login");
    } else if (token && location.pathname === "/login") {
      navigate("/");
    }
  }, [navigate, location]);

  return (
    <>
    <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/login" element={<AuthCard />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path='courses' element={<CoursesPage />} />
          <Route path='tests' element={<TestsPage />} />
          <Route path='my-requests' element={<Requests />} />
          <Route path='create-quiz' element={<CreateQuiz />} />
          <Route path='add-questions-answers-to-quiz' element={<AddQuestionsAnswersToQuiz />} />
          <Route path='quiz/:id' element={<QuizDetails />} />
          <Route path="quiz/:id/results" element={<Results />} />
          <Route path='quiz/:quizId/:studentId/view' element={<QuizResultStudent />} />
          <Route path='schedule' element={<Schedule />} />
          <Route path="groups" element={<Groups />} />
          <Route path="CreateGroup" element={<CreateGroup />} />
          <Route path='subjects' element={<SubjectsPage />} />
          <Route path='users' element={<UsersPage />} />
          <Route path='leaders-table' element={<Leaderboard />} />
          <Route path='profile' element={<Profile />} />
          <Route path='parents' element={<ParentList />} />
          <Route path='children' element={<Childs />} />
        </Route>
        <Route path="send-request" element={<Requests />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;

 