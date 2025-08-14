import { useEffect, useState } from "react";
import api from "../../api"; // Adjust path if needed
import "./dashboard.css"; // Import the CSS above

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const parsedUser = userStr ? JSON.parse(userStr) : null;
        const role = parsedUser?.role?.toLowerCase();
        setUserRole(role);
        setUsername(parsedUser?.first_name + " " + parsedUser?.last_name);

        if (userStr) {
          const res = await api.get("api/statistics/");
          setStatistics(res.data);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
        alert("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const CircleChart = ({ percentage }) => {
    const radius = 50;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <svg height="120" width="120">
        <g transform="rotate(-90 60 60)">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#4f46e5"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </g>
        <text
          x="60"
          y="65"
          textAnchor="middle"
          fontSize="20"
          fill="#111827"
          fontWeight="bold"
        >
          {`${percentage}%`}
        </text>
      </svg>
    );
  };

  const renderByRole = () => {
    if (!statistics || !userRole) return null;

    switch (userRole) {
      case "admin":
      case "repititor":
        return (
          <div className="dashboard-grid">
            {statistics.statistics.map((item, idx) => (
              <div key={idx}>
                <div className="card card-primary">
                  <h2 className="card-title">{item.course.name}</h2>
                  <p className="card-subtitle">{item.course.description}</p>
                  <p className="card-detail">Fən sayı: {item.subject_count}</p>
                  <p className="card-detail">Sınaq sayı: {item.quiz_count}</p>
                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <span style={{ marginBottom: 10, fontWeight: 600, fontSize: 16 }}>
                      Ortalama nəticə
                    </span>
                    <CircleChart percentage={item.course_overall} />
                  </div>
                </div>
                <div className="card user-card">
                  <h2 className="card-title">İstifadəçi sayı</h2>
                  {item.users.map((u, i) => (
                    <p key={i} className="card-detail">
                      •{" "}
                      {
                        u.role === "admin"
                          ? "Admin"
                          : u.role === "repititor"
                          ? "Repetitor"
                          : u.role === "teacher"
                          ? "Müəllim"
                          : u.role === "student"
                          ? "Tələbə"
                          : u.role === "parent"
                          ? "Valideyn"
                          : u.role
                      }
                      : {u.count}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "teacher":
        return (
          <div className="dashboard-grid">
            <div className="card card-secondary">
              <h2 className="card-title">
                Groups Managed: {statistics.total_group_count}
              </h2>
              <p className="card-detail">Subjects: {statistics.total_subjects}</p>
              <p className="card-detail">Students: {statistics.total_students}</p>
              <p className="card-detail">
                Quiz Average Score: {statistics.quiz_average_score}%
              </p>
            </div>
          </div>
        );

      case "student":
        return (
          <div className="dashboard-grid">
            <div className="card card-tertiary">
              <h2 className="card-title">
                My Groups: {statistics.total_groups}
              </h2>
              <p className="card-detail">Subjects: {statistics.total_subjects}</p>
              <p className="card-detail">
                Overall Score: {statistics.overall_score}%
              </p>
              <p className="card-detail">Parents:</p>
              {statistics.parents.map((p, i) => (
                <p key={i} className="card-detail">
                  • {p.full_name}
                </p>
              ))}
            </div>
          </div>
        );

      case "parent":
        return (
          <div className="dashboard-grid">
            <div className="card card-amber">
              <h2 className="card-title">
                Children: {statistics.child_count}
              </h2>
              {statistics.children.map((c, i) => (
                <p key={i} className="card-detail">
                  • {c.full_name}
                </p>
              ))}
              <p className="card-detail">
                Children&#39; Average Score: {statistics.overall_score}%
              </p>
            </div>
          </div>
        );

      case "superadmin":
        return (
          <div className="dashboard-grid">
            <div className="card card-super">
              <h2 className="card-title">System Overview</h2>
              <p className="card-detail">
                Total Courses: {statistics.total_courses}
              </p>
              <p className="card-detail">
                Total Users: {statistics.total_users}
              </p>
            </div>
          </div>
        );

      default:
        return <p className="card-detail">Role not recognized.</p>;
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="welcome">Xoş gəldin, {username || "Yüklənir..."}</h1>
      {loading ? (
        <div className="loading">
          <span>Loading...</span>
        </div>
      ) : (
        renderByRole()
      )}
    </div>
  );
}