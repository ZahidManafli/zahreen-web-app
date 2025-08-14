import React, { useEffect, useState } from "react";
import api from "../../api";

export default function ParentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/students-of-parent/");
      setStudents(response.data.students);
    } catch (err) {
      setError("Övladlar yüklənərkən xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50">
        <div className="animate-spin h-10 w-10 text-[#1b7793] mb-4 border-4 border-blue-300 border-t-transparent rounded-full"></div>
        <div className="text-[#1b7793] text-lg font-medium">Yüklənir...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50">
        <div className="text-red-600 text-lg font-medium">{error}</div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50">
        <div className="text-gray-600 text-lg font-medium">Sizə təyin olunan övlad tapılmadı.</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mx-auto bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#1b7793] mb-8 text-center">Övladlarım</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow p-6 border border-blue-100 flex flex-col justify-between">
              <div className="text-lg font-semibold text-[#1b7793] mb-2">
                {item.first_name} {item.last_name}
              </div>
              <div className="text-gray-700 text-base">{item.email}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}