import { useState, useEffect } from "react";
import { createTeacher } from "../../api/teachersApi";
import { getSubjects } from "../../api/academicsApi";
import { useNavigate } from "react-router-dom";
import { Upload, UserPlus, Image as ImageIcon } from "lucide-react";

export default function TeacherForm() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]); // Initialized as array
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    designation: "Assistant Teacher",
    qualification: "",
    date_of_joining: "",
    subject_id: "", 
    photo: null,
  });

  useEffect(() => {
    getSubjects()
      .then((res) => {
        // If paginated, data is in res.data.results. If not, it's res.data.
        const data = res.data.results ? res.data.results : res.data;
        setSubjects(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
        setSubjects([]); // Prevent .map crash on error
      });
  }, []);

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
    
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== "") {
        // If the key is 'subject_id', append it as 'subject' for Django
        if (key === "subject_id") {
          formData.append("subject", form[key]);
        } else {
          formData.append(key, form[key]);
        }
      }
    });

    try {
      const response = await createTeacher(formData);
      console.log("Success:", response.data);
      navigate("/teachers");
    } catch (err) {
      // This will now print the EXACT reason Django is rejecting it
      console.error("Save error details:", err.response?.data);
      alert("Error: " + JSON.stringify(err.response?.data || "Server error"));
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-6 text-white text-center">
          <UserPlus className="mx-auto mb-2 text-blue-400" size={32} />
          <h1 className="text-2xl font-bold uppercase tracking-tight">Teacher Registration</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group shadow-inner">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-gray-300" size={30} />
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="text-white" size={20} />
                <input type="file" name="photo" className="hidden" onChange={handleChange} accept="image/*" />
              </label>
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 mt-3 tracking-widest">Profile Photo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input name="first_name" placeholder="First Name" className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={handleChange} required />
            <input name="last_name" placeholder="Last Name" className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={handleChange} required />
            <input name="phone" placeholder="Phone Number" className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email Address" className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={handleChange} />
            
            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1">Designation</label>
              <select name="designation" className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white" onChange={handleChange}>
                <option value="Assistant Teacher">Assistant Teacher</option>
                <option value="Senior Teacher">Senior Teacher</option>
                <option value="Headmaster">Headmaster</option>
                <option value="Principal">Principal</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1">Primary Subject</label>
              <select name="subject_id" className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium" onChange={handleChange}>
                <option value="">Select Subject</option>
                {/* Safe mapping check */}
                {Array.isArray(subjects) && subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1">Joining Date</label>
              <input name="date_of_joining" type="date" className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={handleChange} />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1">Education</label>
              <input name="qualification" placeholder="e.g. BSc, M.Ed" className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-sm mt-4">
            Register Teacher
          </button>
        </form>
      </div>
    </div>
  );
}