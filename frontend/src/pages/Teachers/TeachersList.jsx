import { useEffect, useState } from "react";
import { getTeachers, deleteTeacher } from "../../api/teachersApi";
import { Link } from "react-router-dom";

export default function TeachersList() {

  const [teachers, setTeachers] = useState([]);

  const loadTeachers = async () => {
    const res = await getTeachers();
    setTeachers(res.data);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleDelete = async (id) => {

    if (!confirm("Delete this teacher?")) return;

    await deleteTeacher(id);
    loadTeachers();
  };

  return (
    <div className="p-6">

      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Teachers</h1>

        <Link
          to="/teachers/new"
          className="bg-blue-600 text-white px-4 py-2"
        >
          Add Teacher
        </Link>
      </div>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>

            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Action</th>

          </tr>
        </thead>

        <tbody>

          {teachers.map((teacher) => (

            <tr key={teacher.id}>

              <td className="border p-2">
                {teacher.id}
              </td>

              <td className="border p-2">
                {teacher.first_name} {teacher.last_name}
              </td>

              <td className="border p-2">
                {teacher.phone}
              </td>

              <td className="border p-2 flex gap-2">

                <button
                  className="bg-gray-600 text-white px-2 py-1"
                >
                  View
                </button>

                <button
                  onClick={() => handleDelete(teacher.id)}
                  className="bg-red-600 text-white px-2 py-1"
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