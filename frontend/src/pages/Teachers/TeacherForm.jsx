import { useState } from "react";
import { createTeacher } from "../../api/teachersApi";
import { useNavigate } from "react-router-dom";

export default function TeacherForm() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    await createTeacher(form);

    navigate("/teachers");
  };

  return (

    <div className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-4">
        Add Teacher
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

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

        <input
          name="phone"
          placeholder="Phone Number"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2"
        >
          Save Teacher
        </button>

      </form>

    </div>

  );
}