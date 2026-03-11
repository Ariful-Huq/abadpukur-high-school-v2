import { useEffect, useState } from "react";
import { getTeachers, deleteTeacher } from "../../api/teachersApi";
import { Link } from "react-router-dom";
import { User, Trash2, Mail, Phone, BookOpen, Eye, Plus } from "lucide-react";

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await getTeachers();
      // Handle Paginated Response: Check for .results, otherwise use res.data
      const data = res.data.results ? res.data.results : res.data;
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeachers([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this teacher?")) return;
    try {
      await deleteTeacher(id);
      loadTeachers();
    } catch (err) {
      alert("Error deleting record.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Faculty Directory</h1>
          <p className="text-gray-500 font-medium">Manage school teachers and subject assignments</p>
        </div>
        <Link 
          to="/teachers/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Add New Teacher
        </Link>
      </div>

      {/* Grid Section */}
      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Array.isArray(teachers) && teachers.map((teacher) => (
            <div 
              key={teacher.id} 
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md hover:border-blue-100 transition-all group"
            >
              {/* Photo Thumbnail */}
              <div className="w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
                {teacher.photo ? (
                  <img src={teacher.photo} alt={teacher.first_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <User size={40} />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">
                      {teacher.first_name} {teacher.last_name}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                        {teacher.designation || "Assistant Teacher"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Link
                      to={`/teachers/${teacher.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="View Profile"
                    >
                      <Eye size={20} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(teacher.id)} 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Contact & Subjects Info */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-blue-500">
                      <Phone size={14} />
                    </div>
                    {teacher.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-blue-500">
                      <Mail size={14} />
                    </div>
                    <span className="truncate max-w-[150px]">{teacher.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2 mt-1 border-t border-gray-50 pt-3">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <BookOpen size={14} />
                    </div>
                    <span className="font-medium text-gray-700 italic">
                      {/* Using optional chaining and fallback for subject display */}
                      {teacher.assigned_subjects?.length > 0 
                        ? teacher.assigned_subjects.join(", ") 
                        : "General Faculty"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && teachers.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center">
          <User className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">No teachers found in the directory.</p>
        </div>
      )}
    </div>
  );
}