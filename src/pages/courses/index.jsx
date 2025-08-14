import { useEffect, useState } from "react";
import api from "../../api"; // Adjust path if needed
import Swal from "sweetalert2";

export default function CoursesPage() {
  const [role, setRole] = useState("");
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadUserAndCourses = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setRole(parsed.role || "guest");
      }
      await fetchCourses();
      setLoading(false);
    };

    loadUserAndCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("course-list/");
      setCourses(res.data.data);
    } catch (err) {
      // Optionally show error
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Zəhmət olmasa bütün xanaları doldurun.",
        confirmButtonText: "Bağla",
      });
      return;
    }

    try {
      await api.post("create-course/", {
        name: title,
        description: description,
      });

      Swal.fire({
        icon: "success",
        title: "Uğurlu!",
        text: "Kurs yaradıldı.",
        confirmButtonText: "Bağla",
      });
      setTitle("");
      setDescription("");
      setShowModal(false);
      setLoading(true);
      await fetchCourses();
      setLoading(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Kurs yaradılmadı.",
        confirmButtonText: "Bağla",
      });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Silmək istədiyinizə əminsiniz?",
      text: "Bu kursu silmək geri qaytarıla bilməz.",
      showCancelButton: true,
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "Ləğv et",
    });
    if (confirm.isConfirmed) {
      try {
        await api.delete(`delete-course/${courseId}/`);
        Swal.fire({
          icon: "success",
          title: "Silindi!",
          text: "Kurs uğurla silindi.",
          confirmButtonText: "Bağla",
        });
        setLoading(true);
        await fetchCourses();
        setLoading(false);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Kurs silinmədi.",
          confirmButtonText: "Bağla",
        });
      }
    }
  };

  return (
    <div className="w-full flex items-center justify-center pt-0">
      <div className="w-full h-full mx-auto p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg border border-gray-200">
        <h2 className="text-4xl font-extrabold text-[#1b7793] mb-10 text-center drop-shadow-lg tracking-tight">
          {(role === "admin" || role === "repititor") ? "Kursum" : "Kurslar"}
        </h2>

        {(role === "admin" || role === "repititor") && (
          <button
            className="bg-gradient-to-r from-[#1b7793] to-indigo-500 hover:from-[#1b7793] hover:to-indigo-600 text-white font-bold py-2 px-6 rounded-xl mb-8 shadow-lg transition-all duration-200"
            onClick={() => setShowModal(true)}
          >
            <span className="mr-2">➕</span> Kurs Yarat
          </button>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black opacity-20 rounded-2xl z-40 flex items-center justify-center"></div>
        )}

        {showModal && (
          <div className="fixed inset-0 w-[100%] h-[100%] z-41 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100 relative animate-fade-in">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-[#1b7793] text-2xl font-bold"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold text-[#1b7793] mb-6 text-center">Kurs Yarat</h3>
              <form onSubmit={handleCreateCourse}>
                <input
                  type="text"
                  placeholder="Kurs başlığı"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                />
                <textarea
                  placeholder="Açıqlama"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                  rows={4}
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#1b7793] to-indigo-500 hover:from-[#1b7793] hover:to-indigo-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all duration-200"
                  >
                    Yarat
                  </button>
                  <button
                    type="button"
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-xl transition"
                    onClick={() => setShowModal(false)}
                  >
                    Ləğv et
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

{loading ? (
  <div className="flex flex-col gap-4 mt-8">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-xl h-20 w-full"
      >
        <div className="h-4 bg-blue-200 rounded w-2/3 mt-4 mx-6"></div>
        <div className="h-3 bg-indigo-200 rounded w-1/2 mt-2 mx-6"></div>
      </div>
    ))}
    <div className="flex justify-center mt-4">
      <svg className="animate-spin h-8 w-8 text-[#1b7793]" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  </div>
) : (
  courses.length === 0 ? (
    <div className="text-center text-gray-500 mt-8 text-lg font-medium">Kurs tapılmadı.</div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(item => (
        <div key={item.id} className="cursor-pointer bg-white/90 rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-200 group flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition">
                {item.name.charAt(0)}
              </div>
              <div className="text-xl font-semibold text-gray-800">{item.name}</div>
            </div>
            <div className="text-gray-600 text-base">{item.description}</div>
          </div>
          {(role === "admin" || role === "repititor") && (
            <button
              className="cursor-pointer mt-4 text-red-500 hover:text-red-700 p-2 rounded-full transition self-end"
              title="Kursu sil"
              onClick={() => handleDeleteCourse(item.id)}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
        </div>
      ))}
    </div>
  )
)}
      </div>
    </div>
  );
}