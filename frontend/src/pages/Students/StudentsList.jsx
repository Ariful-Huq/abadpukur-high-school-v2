// src/pages/Students/StudentsList.jsx
import { useEffect, useState } from "react";
import { getStudents, deleteStudent } from "../../api/studentsApi";
import { Link } from "react-router-dom";
import { UserPlus, Eye, Trash2, User } from "lucide-react";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudents();
    
      // Extract the results array from the paginated response
      const data = res.data.results ? res.data.results : res.data;
    
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch students", err);
      setStudents([]); // Safety fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student record?")) return;
    try {
      await deleteStudent(id);
      loadStudents();
    } catch (err) {
      alert("Error deleting student.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-sm text-gray-500">Manage and view all enrolled students</p>
        </div>
        <Link
          to="/students/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-200"
        >
          <UserPlus size={18} /> Add New Student
        </Link>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class & Section</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400 animate-pulse">Loading directory...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400">No students enrolled yet.</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Photo Thumbnail */}
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                        {student.photo ? (
                          <img 
                            src={student.photo} 
                            alt={student.first_name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 leading-none">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">ID: #{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {student.roll_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-800">
                        {student.class_name || "N/A"}
                      </span>
                      <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded w-fit">
                        Section: {student.section_name || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/students/${student.id}`}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}