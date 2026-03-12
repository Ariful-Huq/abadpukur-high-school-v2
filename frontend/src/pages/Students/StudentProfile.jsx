import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getStudent, deleteStudent } from "../../api/studentsApi";
import { User, Calendar, GraduationCap, MapPin, ArrowLeft, Trash2, Edit } from "lucide-react";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await getStudent(id);
        setStudent(res.data);
      } catch (err) {
        console.error("Error fetching student profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Permanent delete? This cannot be undone.")) return;
    try {
      await deleteStudent(id);
      navigate("/students");
    } catch (err) {
      alert("Delete failed.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;
  if (!student) return <div className="p-10 text-center text-red-500">Student not found.</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <button 
        onClick={() => navigate("/students")}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Directory
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header/Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-end gap-6 -mt-12 mb-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gray-100 shadow-lg overflow-hidden flex-shrink-0">
              {student.photo ? (
                <img src={student.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={48} /></div>
              )}
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-gray-900">{student.first_name} {student.last_name}</h1>
              <p className="text-gray-500 font-medium">Roll Number: {student.roll_number}</p>
            </div>

            <div className="flex gap-3 pb-2">
              <Link
                to={`/students/${student.id}/edit`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 flex items-center gap-2 px-4"
              >
                <Edit size={20} /> Edit Profile
              </Link>
              <button 
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                title="Delete Student"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <hr className="border-gray-100 mb-8" />

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Academic Information</h3>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><GraduationCap size={20} /></div>
                <div>
                  <p className="text-xs text-gray-500">Class & Section</p>
                  <p className="font-semibold text-gray-800">{student.class_name} — {student.section_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Calendar size={20} /></div>
                <div>
                  <p className="text-xs text-gray-500">Academic Session</p>
                  <p className="font-semibold text-gray-800">{student.session_name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">System Details</h3>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MapPin size={20} /></div>
                <div>
                  <p className="text-xs text-gray-500">Student System ID</p>
                  <p className="font-semibold text-gray-800">#{student.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}