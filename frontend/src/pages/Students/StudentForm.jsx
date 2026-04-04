// frontend/src/pages/Students/StudentForm.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createStudent, getStudent, updateStudent, getNextRollNumber } from "../../api/studentsApi";
import { getClasses, getSections, getSessions } from "../../api/academicsApi";
import { UserPlus, Upload, Image as ImageIcon, Save, ArrowLeft, Phone, User as UserIcon, MapPin } from "lucide-react";

export default function StudentForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    first_name: "", last_name: "", roll_number: "",
    class_id: "", section_id: "", session_id: "",
    father_name: "", father_contact: "",
    mother_name: "", mother_contact: "",
    date_of_birth: "", religion: "", address: "",
    photo: null,
  });

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cls, sec, ses] = await Promise.all([getClasses(), getSections(), getSessions()]);
        
        const classesData = cls.data.results || cls.data || [];
        const sectionsData = sec.data.results || sec.data || [];
        const sessionsData = ses.data.results || ses.data || [];

        setClasses(classesData);
        setSections(sectionsData);
        setSessions(sessionsData);

        if (isEditMode) {
          const res = await getStudent(id);
          const s = res.data;
          
          // CRITICAL: Map the incoming data to the specific ID fields for the dropdowns
          setForm({
            first_name: s.first_name || "",
            last_name: s.last_name || "",
            roll_number: s.roll_number || "",
            class_id: s.class_id || "",
            section_id: s.section_id || "",
            session_id: s.session_id || "",
            father_name: s.father_name || "",
            father_contact: s.father_contact || "",
            mother_name: s.mother_name || "",
            mother_contact: s.mother_contact || "",
            date_of_birth: s.date_of_birth || "",
            religion: s.religion || "",
            address: s.address || "",
            photo: null, // Keep null unless user uploads a new one
          });

          if (s.photo) setPreview(s.photo);
        } else {
          // Default to active session for new admissions
          const active = sessionsData.find(s => s.is_active);
          if (active) setForm(prev => ({ ...prev, session_id: active.id }));
        }
      } catch (err) {
        console.error("Error loading form data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode]);

  // AUTO-POPULATE ROLL NUMBER (Only for new students)
  useEffect(() => {
    if (!isEditMode && form.class_id && form.section_id) {
      getNextRollNumber(form.class_id, form.section_id).then(res => {
        setForm(prev => ({ ...prev, roll_number: res.data.next_roll }));
      });
    }
  }, [form.class_id, form.section_id, isEditMode]);

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
    
    Object.keys(form).forEach(key => {
      // Only append photo if it's a new file upload
      if (key === "photo") {
        if (form[key] instanceof File) formData.append(key, form[key]);
      } 
      // Append other fields if they aren't null
      else if (form[key] !== null && form[key] !== undefined) {
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
      console.error(err);
      alert("Error saving student record. Please check if the roll number is unique.");
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500">Loading form data...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} /> Cancel & Go Back
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className={`${isEditMode ? 'bg-indigo-600' : 'bg-blue-600'} p-6 text-white text-center`}>
            <h1 className="text-2xl font-bold">{isEditMode ? "Edit Student Profile" : "New Student Admission"}</h1>
            <p className="text-blue-100 text-sm mt-1">
              {isEditMode ? `Updating records for Student ID: #${id}` : "Enter details for the new academic enrollment"}
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* 1. Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                {preview ? <img src={preview} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon className="text-gray-300" size={32} />}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="text-white" size={20} />
                  <input type="file" name="photo" className="hidden" onChange={handleChange} accept="image/*" />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">Click to upload photo</p>
            </div>

            {/* 2. Personal Information */}
            <section>
              <h3 className="text-blue-600 font-bold flex items-center gap-2 mb-4"><UserIcon size={18}/> Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required />
                <Input label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required />
                <Input label="Roll Number" name="roll_number" value={form.roll_number} onChange={handleChange} required />
                <Input label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Religion</label>
                  <select name="religion" value={form.religion} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select Religion</option>
                    <option value="Islam">Islam</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Buddhism">Buddhism</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 3. Academic Details */}
            <section className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-blue-600 font-bold mb-4">Academic Placement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select label="Session" name="session_id" value={form.session_id} options={sessions} onChange={handleChange} required />
                <Select label="Class" name="class_id" value={form.class_id} options={classes} onChange={handleChange} required />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Section</label>
                  <select 
                    name="section_id" 
                    value={form.section_id} 
                    onChange={handleChange} 
                    required
                    className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Section</option>
                    {sections
                      .filter(s => s.school_class == form.class_id)
                      .map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                    }
                  </select>
                </div>
              </div>
            </section>

            {/* 4. Guardian Information */}
            <section>
              <h3 className="text-blue-600 font-bold flex items-center gap-2 mb-4"><Phone size={18}/> Guardian Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:border-r md:pr-4 border-gray-100">
                   <Input label="Father's Name" name="father_name" value={form.father_name} onChange={handleChange} />
                   <Input label="Father's Contact" name="father_contact" value={form.father_contact} onChange={handleChange} />
                </div>
                <div className="space-y-4">
                   <Input label="Mother's Name" name="mother_name" value={form.mother_name} onChange={handleChange} />
                   <Input label="Mother's Contact" name="mother_contact" value={form.mother_contact} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* 5. Address */}
            <section>
              <h3 className="text-blue-600 font-bold flex items-center gap-2 mb-4"><MapPin size={18}/> Contact Address</h3>
              <textarea 
                name="address" 
                value={form.address} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Village, Post, Upazila, District..."
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </section>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl transition-all"
              >
                Discard Changes
              </button>
              <button 
                type="submit"
                className={`flex-[2] ${isEditMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2`}
              >
                <Save size={20} /> {isEditMode ? "Update Student Records" : "Confirm Admission"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Components
const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
    <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
    <select className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" {...props}>
      <option value="">Select {label}</option>
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  </div>
);