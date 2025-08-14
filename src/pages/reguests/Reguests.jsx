import React, { useEffect, useState } from "react";
import api from "../../api";
import Swal from "sweetalert2";

const FILTER_OPTIONS = {
  all: "Hamısı",
  pending: "Gözləmədə",
  approved: "Təsdiqlənib",
  rejected: "Təsdiqlənməyib",
};

const roleLabels = {
  student: "Şagird",
  parent: "Valideyn",
  teacher: "Müəllim",
  admin: "Direktor",
  repititor: "Repititor",
};

export default function Requests() {
  const [enrolments, setEnrolments] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [filter, setFilter] = useState("all");
  const [allCourses, setAllCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  useEffect(() => {
    const init = async () => {
      try {
        const userStr = localStorage.getItem("user");
        let role
        if (userStr) {
          const parsed = JSON.parse(userStr);
          role = parsed.role
          setUserRole(role);
          console.log("User Role:", role);
          setUserName(parsed.first_name || parsed.username);
        }
        const [enrRes, courseRes] = await Promise.all([
          api.get(`${role == 'superadmin' ? 'enroll-request/all/' : "my-enrollments/"}`),
          api.get("course-list/"),
        ]);
        setEnrolments(((role== 'superadmin' ? enrRes.data : enrRes.data.data) || []).reverse());
        setAllCourses(courseRes.data.data || []);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Məlumatları yükləmək mümkün olmadı",
        });
      }
    };
    init();
  }, []);

  const handleAction = async (id, action) => {
    Swal.fire({
      icon: "question",
      title: action === "approve" ? "Təsdiqlə" : "İmtina et",
      text: "Əminsinizmi?",
      showCancelButton: true,
      confirmButtonText: "Bəli",
      cancelButtonText: "Xeyr",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const enr = enrolments.find((e) => e.id === id);
          if (userRole == 'superadmin'){
            await api.patch(`enroll-request-status/`, {
              id: id,
              action: action,
            });
          }else{
            await api.patch(`api/enroll-request/${id}/`, {
            status: action === "approve" ? "approved" : "rejected",
            requested_role: enr.requested_role,
            });
          }
          
          setEnrolments((prev) =>
            prev.map((e) =>
              e.id === id
                ? { ...e, status: action === "approve" ? "approved" : "rejected" }
                : e
            )
          );
          Swal.fire({
            icon: "success",
            title: "Uğurla!",
            text: action === "approve" ? "Sorğu təsdiqləndi" : "Sorğu rədd edildi",
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Xəta",
            text: "Sorğunu yeniləmək mümkün olmadı",
          });
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const filtered = enrolments.filter(
    (e) => filter === "all" || e.status === filter
  );

  const handleSubmitRequest = async () => {
    if (!selectedRole || !selectedCourse) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Zəhmət olmasa rolu və kursu seçin",
      });
      return;
    }
    try {
      await api.post("api/enroll-request/", {
        course: parseInt(selectedCourse),
        requested_role: selectedRole,
      });
      Swal.fire({
        icon: "success",
        title: "Uğurlu",
        text: "Sorğunuz göndərildi",
      });
      setSelectedRole("");
      setSelectedCourse("");
      setShowForm(false);
      // Refresh requests
      const enrRes = await api.get("my-enrollments/");
      setEnrolments((enrRes.data.data || []).reverse());
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Sorğunu göndərmək mümkün olmadı",
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <div className="w-full mx-auto mt-4 p-8 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 flex flex-col">
        {/* Request Form for guests */}
        {userRole && (
          <div className="mb-8">
            {!showForm ? (
              <button
                className="w-full bg-gradient-to-r from-[#1b7793] to-indigo-500 hover:from-[#1b7793] hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200"
                onClick={() => setShowForm(true)}
              >
                Sorğu göndər
              </button>
            ) : (
              <div>
                <label className="block font-semibold mb-2 mt-4">Rol seçin</label>
                <div className="flex gap-3 mb-4">
                  {["student", "parent", "teacher"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`flex-1 py-2 rounded-lg font-semibold border ${
                        selectedRole === role
                          ? "bg-[#1b7793] text-white border-[#1b7793]"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                      onClick={() => setSelectedRole(role)}
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
                <label className="block font-semibold mb-2">Kurs seçin</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {allCourses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      className={`py-2 rounded-lg font-medium border ${
                        selectedCourse === String(course.id)
                          ? "bg-[#1b7793] text-white border-[#1b7793]"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                      onClick={() => setSelectedCourse(String(course.id))}
                    >
                      {course.name}
                    </button>
                  ))}
                </div>
                <button
                  className="w-full bg-gradient-to-r from-[#1b7793] to-indigo-500 hover:from-[#1b7793] hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200"
                  onClick={handleSubmitRequest}
                >
                  Göndər
                </button>
              </div>
            )}
          </div>
        )}

        {/* Requests List */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-[#1b7793] mb-4">Sorğularım</h3>
          <div className="flex gap-2 mb-4 flex-wrap">
            {Object.entries(FILTER_OPTIONS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium border ${
                  filter === key
                    ? "bg-[#1b7793] text-white border-[#1b7793]"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                }`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
<div className="flex-1 overflow-y-auto">
  {filtered.length === 0 ? (
    <div className="text-gray-500 text-center mt-8">Heç bir sorğunuz yoxdur.</div>
  ) : (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((req) => (
        <li
          key={req.id}
          className="bg-white rounded-xl shadow p-4 border border-blue-100 flex flex-col justify-between h-full"
        >
          <div>
            <span className="font-semibold text-gray-800">A.S:</span> {userRole=='superadmin' ? req.first_name + ' ' + req.last_name : req.user_fullname} <br />
            <span className="font-semibold text-gray-800">Kurs:</span> {req.course_name}
            <br />
            {userRole === 'superadmin' && (
              <>
                <span className="font-semibold text-gray-800">Kurs təsviri:</span> {req.course_description.slice(0,30) || "Təsvir yoxdur"}<br />
                <span className="font-semibold text-gray-800">Əlaqə Nömrəsi:</span> {req.contactNumber || "Məlumat yoxdur"}<br />
              </>
            )}
            <span className="font-semibold text-gray-800">Rol:</span> {roleLabels[userRole == 'superadmin' ? req.role : req.requested_role]}
            <br />
            <span className="font-semibold text-gray-800">Tarix:</span>{" "}
            {req?.created_at
              ? req.created_at.split("T")[0] +
                " " +
                req.created_at.split("T")[1].split(".")[0]
              : ""}
          </div>
          <div
            className={`mt-4 px-4 py-2 rounded-lg font-bold text-center ${getStatusColor(
              req.status
            )}`}
          >
            {req.status === "pending"
              ? "Gözləmədə"
              : req.status === "approved"
              ? "Təsdiqlənib"
              : "Təsdiqlənməyib"}
          </div>
          {req.status === "pending" &&
            (userRole === "admin" || userRole === "repititor" || userRole === 'superadmin') && (
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  className="cursor-pointer bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition flex-1"
                  onClick={() => handleAction(req.id, "approve")}
                >
                  Təsdiqlə
                </button>
                <button
                  type="button"
                  className="cursor-pointer bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition flex-1"
                  onClick={() => handleAction(req.id, "reject")}
                >
                  İmtina et
                </button>
              </div>
            )}
        </li>
      ))}
    </ul>
  )}
</div>
        </div>
      </div>
    </div>
  );
}