import { useEffect, useState } from "react";
import { getSubjects, createSubject, deleteSubject } from "../../api/academicsApi";

export default function Subjects() {

  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");

  const loadSubjects = async () => {
    const res = await getSubjects();
    setSubjects(res.data);
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createSubject({ name });

    setName("");
    loadSubjects();
  };

  const handleDelete = async (id) => {
    await deleteSubject(id);
    loadSubjects();
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Subjects</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">

        <input
          placeholder="Subject Name"
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
            <th className="border p-2">Name</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>

          {subjects.map((sub) => (
            <tr key={sub.id}>
              <td className="border p-2">{sub.id}</td>
              <td className="border p-2">{sub.name}</td>
              <td className="border p-2">

                <button
                  onClick={() => handleDelete(sub.id)}
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