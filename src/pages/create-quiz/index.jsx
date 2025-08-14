import { useEffect, useState } from "react";
import api from "../../api"; // Adjust path if needed
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectRes, courseRes] = await Promise.all([
          api.get("subject-list/"),
          api.get("course-list/"),
        ]);
        setSubjects(subjectRes.data.data);
        setCourses(courseRes.data.data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Fənn və kurs məlumatları alınarkən xəta baş verdi",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !subject || !course) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Bütün sahələri doldurun",
      });
      return;
    }

    try {
      const res = await api.post("quiz-create/", {
        title,
        description,
        subject: parseInt(subject),
        course: parseInt(course),
      });

      const quizId = res.data.quiz.id;
      Swal.fire({
        icon: "success",
        title: "Uğurla yaradıldı",
        text: "Sual əlavə et səhifəsinə yönləndirilirsiz",
      });
      navigate(`/add-questions-answers-to-quiz?quizId=${quizId}`);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Quiz yaradılarkən xəta baş verdi",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  // ...existing code...
return (
  <div className="w-full mx-auto mt-12 p-8 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200">
    <h2 className="text-3xl font-bold text-[#1b7793] mb-8 text-center">Quiz Yarat</h2>
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-1">
        <label className="block font-semibold mb-2">Başlıq</label>
        <input
          type="text"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Quiz başlığı"
        />
      </div>
      <div className="col-span-1">
        <label className="block font-semibold mb-2">Təsvir</label>
        <input
          type="text"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Quiz təsviri"
        />
      </div>
      <div className="col-span-1">
        <label className="block font-semibold mb-2">Fənn</label>
        <select
          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        >
          <option value="">Fənn seçin</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="col-span-1">
        <label className="block font-semibold mb-2">Kurs</label>
        <select
          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={course}
          onChange={e => setCourse(e.target.value)}
        >
          <option value="">Kurs seçin</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="col-span-1 md:col-span-2 flex justify-center mt-2">
        <button
          type="submit"
          className="cursor-pointer w-full md:w-1/2 bg-gradient-to-r from-[#1b7793] to-indigo-500 hover:from-[#1b7793] hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200"
        >
          Quiz Yarat
        </button>
      </div>
    </form>
  </div>
);
// ...existing code...
}