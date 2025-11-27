"use client";

import React, { useEffect } from "react";
import Adminstrativenavbar from "../components/adminstrativenavbar";

export default function ScheduleTable() {
  let role: string | null = null;

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      role = localStorage.getItem("role");
      console.log(token, role);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }, []);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const generateTimes = () => {
    const times = [];
    let startMinutes = 8 * 60 + 30; // 8:30
    const endMinutes = 17 * 60; // 17:00
    for (let m = startMinutes; m < endMinutes; m += 90) { 
      const h = Math.floor(m / 60);
      const mm = m % 60;
      const hh = String(h).padStart(2, "0");
      const mms = String(mm).padStart(2, "0");
      const end = m + 90;
      const eh = Math.floor(end / 60);
      const emm = end % 60;
      const ehh = String(eh).padStart(2, "0");
      const emms = String(emm).padStart(2, "0");
      times.push(`${hh}:${mms} - ${ehh}:${emms}`);
    }
    return times;
  };

  const times = generateTimes();

  

  return (
    <>
      {role === "administrative" && <Adminstrativenavbar />}
      <div className="p-4 max-w-full overflow-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Weekly Schedule (Mon - Sat)
        </h2>
        <div className="overflow-auto border rounded-lg shadow">
          <table className="min-w-full table-fixed border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-sm">Time</th>
                {days.map((day) => (
                  <th key={day} className="border px-3 py-2 text-sm text-left">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((time) => (
                <tr key={time} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-sm font-medium bg-gray-50">
                    {time}
                  </td>
                  {days.map((day) => (
                    <td
                      key={`${day}-${time}`}
                      className="border px-3 py-4 text-center text-gray-400"
                    >
                      —
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
