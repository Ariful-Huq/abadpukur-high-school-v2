// frontend/src/pages/Teachers/TeacherProfile.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTeacher } from "../../api/teachersApi";
import { Calendar, Mail, Phone, Book, Award, ArrowLeft, User } from "lucide-react";

export default function TeacherProfile() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    getTeacher(id).then((res) => setTeacher(res.data));
  }, [id]);

  if (!teacher) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Link to="/teachers" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Directory
      </Link>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header/Cover Area */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-end -mt-12 gap-6 mb-8">
            <div className="w-40 h-40 rounded-3xl border-4 border-white shadow-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {teacher.photo ? (
                <img src={teacher.photo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={60} /></div>
              )}
            </div>
            <div className="mb-4">
              <h1 className="text-3xl font-black text-gray-900">{teacher.first_name} {teacher.last_name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest">
                {teacher.designation || "Faculty Member"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Contact Info */}
            <div className="space-y-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Contact Details</h2>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="p-2 bg-gray-50 rounded-lg text-blue-600"><Phone size={20} /></div>
                <div><p className="text-xs text-gray-400 font-bold">Phone</p><p className="font-medium">{teacher.phone}</p></div>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="p-2 bg-gray-50 rounded-lg text-blue-600"><Mail size={20} /></div>
                <div><p className="text-xs text-gray-400 font-bold">Email</p><p className="font-medium">{teacher.email || 'N/A'}</p></div>
              </div>
            </div>

            {/* Right Column: Academic Info */}
            <div className="space-y-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Professional Info</h2>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="p-2 bg-gray-50 rounded-lg text-blue-600"><Award size={20} /></div>
                <div><p className="text-xs text-gray-400 font-bold">Qualification</p><p className="font-medium">{teacher.qualification || 'Not Specified'}</p></div>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="p-2 bg-gray-50 rounded-lg text-blue-600"><Calendar size={20} /></div>
                <div><p className="text-xs text-gray-400 font-bold">Joined Date</p><p className="font-medium">{teacher.date_of_joining || 'N/A'}</p></div>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="p-2 bg-gray-50 rounded-lg text-blue-600"><Book size={20} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold">Assigned Subjects</p>
                  <p className="font-medium">{teacher.assigned_subjects?.join(", ") || 'No subjects assigned'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}