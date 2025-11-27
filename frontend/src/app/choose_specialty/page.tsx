"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ChooseSpecialty() {
  const [specialty, setSpecialty] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/UserLogin");
      return;
    }

    if (role !== "student") {
      setMessage("⚠️ Only students can choose a specialty!");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("http://127.0.0.1:8000/choose_speciality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ speciality: specialty }), // ✅ send JSON
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "✅ Specialty updated successfully!");
      } else {
        setMessage(data.detail || "❌ Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setMessage("🚨 Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Choose Your Specialty
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm"
      >
        <select
          name="speciality"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        >
          <option value="">-- Select your specialty --</option>
          <option value="AI">Artificial Intelligence</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="WebDev">Web Development</option>
          <option value="Cloud">Cloud Computing</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white p-2 rounded transition hover:bg-blue-700 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "Confirm"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-gray-700 font-medium">{message}</p>
      )}
    </div>
  );
}
