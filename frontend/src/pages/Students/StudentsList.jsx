// src/pages/Students/StudentsList.jsx
import { useEffect, useState } from "react";
import { getStudents, deleteStudent } from "../../api/studentsApi";
import { Link } from "react-router-dom";
import { UserPlus, Eye, Trash2, User, Search, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "../../api/axios";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0
  });

  const loadStudents = async (url = null) => {
    setLoading(true);
    try {
      let res;
      if (url) {
        // Use the direct URL from pagination links (maintains search/filter params)
        res = await axios.get(url);
      } else {
        // Initial load or new search query
        res = await getStudents(null, null, searchTerm);
      }

      setStudents(res.data.results || []);
      setPagination({
        next: res.data.next,
        previous: res.data.previous,
        count: res.data.count
      });
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search: calls API 500ms after user stops typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadStudents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
          <p className="text-sm text-gray-500">Total Enrolled: {pagination.count} students</p>
        </div>
        <Link
          to="/students/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-200"
        >
          <UserPlus size={18} /> Add New Student
        </Link>
      </div>

      {/* Search Bar Section */}
      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search all students by name or roll..."
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400 animate-pulse">
                  Loading directory...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400">
                  {searchTerm ? `No results found for "${searchTerm}"` : "No students enrolled yet."}
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                        {student.photo ? (
                          <img src={student.photo} alt={student.first_name} className="w-full h-full object-cover" />
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

        {/* Pagination Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{students.length}</span> of <span className="font-medium">{pagination.count}</span> students
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => loadStudents(pagination.previous)}
              disabled={!pagination.previous || loading}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => loadStudents(pagination.next)}
              disabled={!pagination.next || loading}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}