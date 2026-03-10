import { useEffect, useState } from "react";
import { getSessions, createSession, deleteSession } from "../../api/academicsApi";

export default function AcademicSessions() {

  const [sessions, setSessions] = useState([]);
  const [name, setName] = useState("");

  const loadSessions = async () => {
    const res = await getSessions();
    setSessions(res.data);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createSession({ name });

    setName("");
    loadSessions();
  };

  const handleDelete = async (id) => {
    await deleteSession(id);
    loadSessions();
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Academic Sessions</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">

        <input
          placeholder="Session Name (2025-2026)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2"
        />

        <button className="bg-blue-600 text-white px-4 py-2">
          Add
        </button>

      </form>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Session</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>

          {sessions.map((ses) => (
            <tr key={ses.id}>
              <td className="border p-2">{ses.id}</td>
              <td className="border p-2">{ses.name}</td>
              <td className="border p-2">

                <button
                  onClick={() => handleDelete(ses.id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Delete
                </button>

              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}