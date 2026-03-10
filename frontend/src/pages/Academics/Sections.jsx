import { useEffect, useState } from "react";
import { getSections, createSection, deleteSection, getClasses } from "../../api/academicsApi";

export default function Sections() {

  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);

  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");

  const loadData = async () => {
    const sec = await getSections();
    const cls = await getClasses();

    setSections(sec.data);
    setClasses(cls.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createSection({
      name,
      class_id: classId,
    });

    setName("");
    setClassId("");

    loadData();
  };

  const handleDelete = async (id) => {
    await deleteSection(id);
    loadData();
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Sections</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">

        <input
          placeholder="Section Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2"
        />

        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border p-2"
        >

          <option value="">Select Class</option>

          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}

        </select>

        <button className="bg-blue-600 text-white px-4 py-2">
          Add
        </button>

      </form>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Class</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {sections.map((sec) => (
            <tr key={sec.id}>
              <td className="border p-2">{sec.name}</td>
              <td className="border p-2">{sec.class_name}</td>
              <td className="border p-2">

                <button
                  onClick={() => handleDelete(sec.id)}
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