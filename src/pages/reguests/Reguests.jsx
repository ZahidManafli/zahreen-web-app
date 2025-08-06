// pages/Requests.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Requests() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [myRequests, setMyRequests] = useState([]);

  const roleOptions = [
    { label: "Müəllim", value: "teacher" },
    { label: "Şagird", value: "student" },
    { label: "Valideyn", value: "parent" },
  ];

  // Kursları yüklə
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("course-list/");
        setCourses(res.data);
      } catch (error) {
        console.error("Kurslar yüklənmədi", error);
      }
    };

    fetchCourses();
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await api.get("my-enrollments/");
      setMyRequests(res.data);
    } catch (err) {
      console.error("Sorğular yüklənmədi", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !selectedRole) {
      alert("Zəhmət olmasa kurs və rol seçin.");
      return;
    }

    try {
      await api.post("api/enroll-request/", {
        course: selectedCourse,
        requested_role: selectedRole,
      });
      alert("Sorğunuz göndərildi");
      fetchMyRequests();
    } catch (error) {
      console.error("Sorğu göndərilmədi", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 shadow-md rounded bg-white">
      <h2 className="text-xl font-semibold mb-4">Rol və Kurs Seç</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Rol:</label>
          <select
            className="w-full border rounded p-2"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Rol seçin --</option>
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Kurs:</label>
          <select
            className="w-full border rounded p-2"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Kurs seçin --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sorğu Göndər
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Sorğularım:</h3>
        {myRequests.length === 0 ? (
          <p>Heç bir sorğunuz yoxdur.</p>
        ) : (
          <ul className="space-y-2">
            {myRequests.map((req) => (
              <li key={req.id} className="border rounded p-2">
                <p><strong>Kurs:</strong> {req.course_name}</p>
                <p><strong>Rol:</strong> {req.requested_role}</p>
                <p><strong>Status:</strong> {req.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
