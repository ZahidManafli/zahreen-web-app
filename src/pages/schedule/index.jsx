import React, { useEffect, useState } from "react";
import { format, startOfWeek, getDay } from "date-fns";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import api from "../../api";
import Swal from "sweetalert2";

function getDayIndexForApi(jsDay) {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function Schedule() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await api.get("groups/");
        setGroups(res.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Cədvəli yükləmək mümkün olmadı.",
        });
      }
      setLoading(false);
    };
    fetchGroups();
  }, []);

  // Get day index for API (0=Monday, 6=Sunday)
  const selectedDayIndex = getDayIndexForApi(selectedDate.getDay());

  // Find all groups scheduled for selected day
  const groupsForDay = groups
    .map((group) => {
      const daySchedules = group.schedules.filter(
        (sch) => sch.day_of_week === selectedDayIndex
      );
      return daySchedules.length
        ? daySchedules.map((sch) => ({
            ...group,
            schedule: sch,
          }))
        : [];
    })
    .flat();

  // For calendar tile: count groups for each day
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dayIdx = getDayIndexForApi(date.getDay());
    const count = groups.reduce(
      (acc, group) =>
        acc +
        group.schedules.filter((sch) => sch.day_of_week === dayIdx).length,
      0
    );
    return count > 0 ? (
      <div className="absolute top-1 right-1">
        <span className="bg-[#1b7793] text-white text-xs rounded-full px-2 py-0.5">{count}</span>
      </div>
    ) : null;
  };

  return (
    <div className="w-full flex flex-col items-center pt-0">
      <div className="w-full bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-6 flex flex-col lg:flex-row gap-8">
        {/* Left: Calendar */}
        <div className="lg:w-1/2 w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold text-[#1b7793] mb-4 text-center">Cədvəl</h2>
          <Calendar
  value={selectedDate}
  onChange={setSelectedDate}
  locale="az"
  // tileContent={tileContent}
  className="rounded-xl shadow border border-gray-200 w-full"
 formatMonthYear={(locale, date) => {
  const str = date.toLocaleString("az", { month: "long", year: "numeric" });
  return str.charAt(0).toUpperCase() + str.slice(1);
}}
/>
        </div>
        {/* Right: Groups for selected day */}
        <div className="lg:w-1/2 w-full flex flex-col">
          <h3 className="text-lg font-bold text-[#1b7793] mb-4 text-center flex items-center justify-center gap-2">
    {format(selectedDate, "yyyy-MM-dd")} üçün qruplar
    <span className="bg-[#1b7793] text-white text-xs rounded-full px-2 py-0.5">
      {groupsForDay.length}
    </span>
  </h3>
          <div className="flex-1 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="text-[#1b7793] text-lg font-medium animate-pulse">Yüklənir...</span>
              </div>
            ) : groupsForDay.length === 0 ? (
              <div className="text-gray-500 text-center mt-8">Bu gün üçün heç bir dərs yoxdur.</div>
            ) : (
              <ul className="flex flex-col gap-4">
                {groupsForDay.map((item, idx) => (
                  <li
                    key={item.group_id + "-" + item.schedule.id + "-" + idx}
                    className="bg-white rounded-xl shadow p-4 border border-blue-100"
                  >
                    <div className="font-semibold text-[#1b7793] text-lg mb-2">
                      {item.group_name} - {item.subject?.name}
                    </div>
                    <div className="text-gray-700 mb-1">
                      Müəllim: {item.teacher ? `${item.teacher.first_name} ${item.teacher.last_name}` : item.subject?.teacher}
                    </div>
                    <div className="text-gray-700 mb-1">
                      Saat: {item.schedule.start_time.slice(0,5)} - {item.schedule.end_time.slice(0,5)}
                    </div>
                    <div className="text-gray-700 mb-1">
                      Şagird sayı: {item.students?.length || 0}
                    </div>
                    <div className="text-gray-500 text-sm">
                      Kurs: {item.subject?.course_name}
                    </div>
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