import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createStudent, getStudent, updateStudent } from "../../api/studentsApi";
import { getClasses, getSections, getSessions } from "../../api/academicsApi";
import { UserPlus, Upload, Image as ImageIcon, Save, ArrowLeft } from "lucide-react";

export default function StudentForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

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

        const classesData = cls.data.results || cls.data;
        const sectionsData = sec.data.results || sec.data;
        const sessionsData = ses.data.results || ses.data;

        setClasses(Array.isArray(classesData) ? classesData : []);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);

        // If Editing: Fetch existing student data
        if (isEditMode) {
          const studentRes = await getStudent(id);
          const s = studentRes.data;
          
          setForm({
            first_name: s.first_name || "",
            last_name: s.last_name || "",
            roll_number: s.roll_number || "",
            // Use existing enrollment IDs if they exist in your serializer
            class_id: s.school_class || "", 
            section_id: s.section || "",
            session_id: s.session || "",
            photo: null, // Reset to null so we don't re-upload the same file as a string
          });
          if (s.photo) setPreview(s.photo);
        } else {
          // If Creating: Set default active session
          const activeSession = sessionsData.find(s => s.is_active);
          if (activeSession) {
            setForm(prev => ({ ...prev, session_id: activeSession.id }));
          }
        }
      } catch (err) {
        console.error("Error loading form data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      if (file) {
        setForm({ ...form, photo: file });
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    // Append all form fields to FormData
    Object.keys(form).forEach((key) => {
      // Only append photo if a new file was selected
      if (key === "photo") {
        if (form[key] instanceof File) {
          formData.append(key, form[key]);
        }
      } else if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    });

    try {
      if (isEditMode) {
        await updateStudent(id, formData);
      } else {
        await createStudent(formData);
      }
      navigate("/students");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving record. Check if Roll Number is unique.");
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading form data...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Cancel & Go Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className={`${isEditMode ? 'bg-indigo-600' : 'bg-blue-600'} p-6 text-white text-center`}>
            {isEditMode ? <Save className="mx-auto mb-2" size={32} /> : <UserPlus className="mx-auto mb-2" size={32} />}
            <h1 className="text-2xl font-bold">{isEditMode ? "Update Student Profile" : "Student Admission"}</h1>
            <p className="text-white/80">{isEditMode ? `Editing ID: #${id}` : "Enter student details to enroll"}</p>
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
              <p className="text-xs text-gray-500 mt-2 font-medium">
                {isEditMode ? "Click to change photo" : "Click to upload photo"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">First Name</label>
                <input 
                  name="first_name" 
                  value={form.first_name}
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Last Name</label>
                <input 
                  name="last_name" 
                  value={form.last_name}
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Roll Number</label>
                <input 
                  name="roll_number" 
                  value={form.roll_number}
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Academic Session</label>
                <select 
                  name="session_id" 
                  value={form.session_id} 
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Session</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.is_active ? "(Current Active)" : ""}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Class</label>
                <select 
                  name="class_id" 
                  value={form.class_id}
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Section</label>
                <select 
                  name="section_id" 
                  value={form.section_id}
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Section</option>
                  {sections.filter(sec => sec.school_class == form.class_id).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button className={`w-full ${isEditMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200`}>
                {isEditMode ? "Save Changes" : "Confirm & Save Student"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
