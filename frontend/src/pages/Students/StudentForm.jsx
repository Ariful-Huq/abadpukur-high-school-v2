import { useState, useEffect } from "react";
import { createStudent } from "../../api/studentsApi";
import { getClasses, getSections } from "../../api/academicsApi";
import { useNavigate } from "react-router-dom";

export default function StudentForm() {

  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    class_id: "",
    section_id: "",
  });

  const loadData = async () => {
    const cls = await getClasses();
    const sec = await getSections();

    setClasses(cls.data);
    setSections(sec.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createStudent(form);

    navigate("/students");
  };

  return (
    <div className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-4">
        Student Admission
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="first_name"
          placeholder="First Name"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="last_name"
          placeholder="Last Name"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <select
          name="class_id"
          className="border p-2 w-full"
          onChange={handleChange}
        >

          <option value="">Select Class</option>

          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}

        </select>

        <select
          name="section_id"
          className="border p-2 w-full"
          onChange={handleChange}
        >

          <option value="">Select Section</option>

          {sections.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.name}
            </option>
          ))}

        </select>

        <button className="bg-blue-600 text-white px-4 py-2">
          Save Student
        </button>

      </form>

    </div>
  );
}