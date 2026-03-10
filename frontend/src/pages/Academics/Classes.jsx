import { useEffect, useState } from "react";
import { getClasses, createClass, deleteClass } from "../../api/academicsApi";

export default function Classes() {

  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");

  const loadClasses = async () => {
    const res = await getClasses();
    setClasses(res.data);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createClass({ name });

    setName("");
    loadClasses();
  };

  const handleDelete = async (id) => {
    await deleteClass(id);
    loadClasses();
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Classes</h1>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Class Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2"
        />
        <button className="bg-blue-600 text-white px-4 py-2">
          Add
        </button>
      </form>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {classes.map((cls) => (
            <tr key={cls.id}>
              <td className="border p-2">{cls.id}</td>
              <td className="border p-2">{cls.name}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(cls.id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}