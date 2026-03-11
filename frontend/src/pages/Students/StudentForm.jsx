// src/pages/Students/StudentForm.jsx
import { useState, useEffect } from "react";
import { createStudent } from "../../api/studentsApi";
import { getClasses, getSections, getSessions } from "../../api/academicsApi";
import { useNavigate } from "react-router-dom";
import { UserPlus, Upload, Image as ImageIcon } from "lucide-react";

export default function StudentForm() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    roll_number: "",
    class_id: "",
    section_id: "",
    session_id: "",
    photo: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cls, sec, ses] = await Promise.all([
          getClasses(),
          getSections(),
          getSessions(),
        ]);

        // Extract .results if paginated, otherwise use the raw data
        const classesData = cls.data.results || cls.data;
        const sectionsData = sec.data.results || sec.data;
        const sessionsData = ses.data.results || ses.data;

        setClasses(Array.isArray(classesData) ? classesData : []);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      } catch (err) {
        console.error("Error loading academic data:", err);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      setForm({ ...form, photo: file });
      setPreview(URL.createObjectURL(file)); // Create local preview URL
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    try {
      await createStudent(formData);
      navigate("/students");
    } catch (err) {
      alert("Error saving student. Check if Roll Number is unique.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <UserPlus className="mx-auto mb-2" size={32} />
          <h1 className="text-2xl font-bold">Student Admission</h1>
          <p className="text-blue-100 opacity-80">Enter student details to enroll</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-gray-300" size={40} />
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="text-white" size={20} />
                <input type="file" name="photo" className="hidden" onChange={handleChange} accept="image/*" />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">Click to upload photo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">First Name</label>
              <input name="first_name" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Last Name</label>
              <input name="last_name" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Roll Number</label>
              <input name="roll_number" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Academic Session</label>
              <select name="session_id" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required>
                <option value="">Select Session</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Class</label>
              <select name="class_id" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Section</label>
              <select name="section_id" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required>
                <option value="">Select Section</option>
                {sections.filter(sec => sec.school_class == form.class_id).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200">
              Confirm & Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}