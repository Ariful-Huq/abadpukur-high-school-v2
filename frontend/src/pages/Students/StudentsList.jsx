import { useEffect, useState } from "react";
import { getStudents, deleteStudent } from "../../api/studentsApi";
import { Link } from "react-router-dom";

export default function StudentsList() {

  const [students, setStudents] = useState([]);

  const loadStudents = async () => {
    const res = await getStudents();
    setStudents(res.data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;

    await deleteStudent(id);
    loadStudents();
  };

  return (
    <div className="p-6">

      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Students</h1>

        <Link
          to="/students/new"
          className="bg-blue-600 text-white px-4 py-2"
        >
          Add Student
        </Link>
      </div>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Class</th>
            <th className="border p-2">Section</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>

          {students.map((student) => (
            <tr key={student.id}>

              <td className="border p-2">{student.id}</td>

              <td className="border p-2">
                {student.first_name} {student.last_name}
              </td>

              <td className="border p-2">
                {student.class_name}
              </td>

              <td className="border p-2">
                {student.section_name}
              </td>

              <td className="border p-2 flex gap-2">

                <Link
                  to={`/students/${student.id}`}
                  className="bg-gray-600 text-white px-2 py-1"
                >
                  View
                </Link>

                <button
                  onClick={() => handleDelete(student.id)}
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