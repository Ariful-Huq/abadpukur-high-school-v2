import { useState } from "react";
import { login } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const res = await login(form);

    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    navigate("/");
  };

  return (

    <div className="flex h-screen items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-lg w-80"
      >

        <h1 className="text-xl font-bold mb-4">
          School Login
        </h1>

        <input
          name="username"
          placeholder="Username"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          onChange={handleChange}
        />

        <button
          className="bg-blue-600 text-white w-full py-2"
        >
          Login
        </button>

      </form>

    </div>
  );
}