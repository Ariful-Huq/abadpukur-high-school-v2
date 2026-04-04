// abadpukur-high-school/frontend/src/pages/Students/StudentProfile.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getStudent, deleteStudent } from "../../api/studentsApi";
import { User, Calendar, GraduationCap, MapPin, ArrowLeft, Trash2, Edit, Phone, Home, Heart } from "lucide-react";

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
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-end gap-6 -mt-12 mb-8">
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
              <Link to={`/students/${student.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 flex items-center gap-2 px-4">
                <Edit size={20} /> Edit
              </Link>
              <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100">
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column: Academic & Personal */}
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Academic Details</h3>
                <div className="space-y-4">
                  <InfoItem icon={<GraduationCap size={18}/>} label="Class & Section" value={`${student.class_name} — ${student.section_name}`} color="blue" />
                  <InfoItem icon={<Calendar size={18}/>} label="Academic Session" value={student.session_name} color="green" />
                  <InfoItem icon={<Calendar size={18}/>} label="Date of Birth" value={student.date_of_birth || "Not Provided"} color="purple" />
                  <InfoItem icon={<Heart size={18}/>} label="Religion" value={student.religion || "Not Provided"} color="red" />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Address</h3>
                <div className="flex gap-3 text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <Home className="text-gray-400 shrink-0" size={20} />
                  <p className="text-sm leading-relaxed">{student.address || "No address on file."}</p>
                </div>
              </section>
            </div>

            {/* Right Column: Family Details */}
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Guardian Information</h3>
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-gray-100 bg-white">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">Father's Details</p>
                    <p className="font-bold text-gray-800">{student.father_name || "N/A"}</p>
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                      <Phone size={14} /> {student.father_contact || "No Contact"}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-100 bg-white">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">Mother's Details</p>
                    <p className="font-bold text-gray-800">{student.mother_name || "N/A"}</p>
                    <div className="flex items-center gap-2 text-sm text-pink-600 mt-1">
                      <Phone size={14} /> {student.mother_contact || "No Contact"}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for consistent styling
function InfoItem({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 font-bold uppercase">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}