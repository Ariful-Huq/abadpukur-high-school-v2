import { useEffect, useState } from "react";
import { getMonthlyAttendance } from "../../api/attendanceApi";

export default function MonthlyAttendance() {

  const [data, setData] = useState([]);

  useEffect(() => {

    getMonthlyAttendance(2026, 3).then(res => {
      setData(res.data);
    });

  }, []);

  return (

    <table className="table-auto border w-full">

      <thead>
        <tr>
          <th>Student</th>

          {[...Array(31)].map((_, i) => (
            <th key={i}>{i + 1}</th>
          ))}

        </tr>
      </thead>

      <tbody>

        {data.map(student => (

          <tr key={student.student_id}>

            <td>{student.student_name}</td>

            {Object.values(student.days).map((status, index) => (

              <td key={index}>{status}</td>

            ))}

          </tr>

        ))}

      </tbody>

    </table>
  );
}