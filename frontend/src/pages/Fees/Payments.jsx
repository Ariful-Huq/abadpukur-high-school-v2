// src/pages/Fees/Payments.jsx
import { useEffect, useState, useCallback } from "react";
import { getPayments, getFeeStructures, collectPayment } from "../../api/feesApi";
import { getStudents } from "../../api/studentsApi";
import { getClasses, getSections } from "../../api/academicsApi";
import { CreditCard, Plus, Search, Printer, X, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [allFeeStructures, setAllFeeStructures] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [students, setStudents] = useState([]); // This will hold the filtered list from backend
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [formData, setFormData] = useState({
    student: "",
    fee: "",
    amount_paid: "",
    payment_method: "cash",
    transaction_id: ""
  });

  // 1. Initial Load of Meta Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, fRes, cRes, secRes] = await Promise.all([
        getPayments(),
        getFeeStructures(),
        getClasses(),
        getSections()
      ]);

      setPayments(pRes.data.results || pRes.data);
      setAllFeeStructures(fRes.data.results || fRes.data);
      setClasses(cRes.data.results || cRes.data);
      setSections(secRes.data.results || secRes.data);
    } catch (err) {
      console.error("Error loading initial data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Fetch Students specifically when Class/Section changes
  // This solves the pagination issue by asking the backend for a specific group
  useEffect(() => {
    const fetchTargetStudents = async () => {
      if (selectedClass && selectedSection) {
        setStudentLoading(true);
        try {
          const sRes = await getStudents(selectedClass, selectedSection);
          // If backend is paginated, take .results, otherwise take .data
          setStudents(sRes.data.results || sRes.data);
        } catch (err) {
          console.error("Error fetching students", err);
          setStudents([]);
        } finally {
          setStudentLoading(false);
        }
      } else {
        setStudents([]);
      }
    };
    fetchTargetStudents();
  }, [selectedClass, selectedSection]);

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setSelectedSection(""); 
    setFormData({ ...formData, student: "", fee: "", amount_paid: "" });
    setFilteredFees([]);
  };

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    setFormData({ ...formData, student: "", fee: "", amount_paid: "" });
  };

  const handleStudentSelect = (studentId) => {
    const relevant = allFeeStructures.filter(f => 
      Number(f.school_class) === Number(selectedClass) || f.school_class === null
    );
    setFilteredFees(relevant);
    setFormData({ ...formData, student: studentId, fee: "", amount_paid: "" });
  };

  const handleFeeSelect = (feeId) => {
    const fee = allFeeStructures.find(f => f.id === parseInt(feeId));
    if (fee) {
      setFormData({ ...formData, fee: feeId, amount_paid: fee.amount });
    }
  };

  const handleCollect = async (e) => {
    e.preventDefault();
    try {
      await collectPayment(formData);
      setShowModal(false);
      setSelectedClass("");
      setSelectedSection("");
      setFormData({ student: "", fee: "", amount_paid: "", payment_method: "cash", transaction_id: "" });
      fetchData();
      alert("Payment recorded successfully!");
    } catch (err) {
      alert("Error collecting payment");
    }
  };

  const generateReceipt = (payment) => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = "/logo.png";

    img.onload = () => {
      doc.addImage(img, 'PNG', 15, 12, 18, 18);
      doc.setFontSize(22);
      doc.setTextColor(31, 41, 55);
      doc.text("ABADPUKUR HIGH SCHOOL", 40, 22);
      doc.setFontSize(10);
      doc.text("Official Payment Receipt", 40, 28);

      autoTable(doc, {
        startY: 40,
        theme: 'striped',
        head: [['Description', 'Details']],
        body: [
          ['Receipt No', `REC-${payment.id}`],
          ['Date', new Date(payment.payment_date).toLocaleDateString()],
          ['Student Name', payment.student_name],
          ['Class', payment.class_name || 'N/A'],
          ['Section', payment.section_name || 'N/A'],
          ['Roll Number', payment.roll_number || 'N/A'],
          ['Fee Type', payment.fee_name || 'N/A'],
          ['Payment Method', payment.payment_method?.toUpperCase() || 'CASH'],
          ['Amount Paid', `TK ${payment.amount_paid}`],
        ],
        headStyles: { fillColor: [31, 41, 55] },
      });
      doc.save(`Receipt_${payment.id}.pdf`);
    };
  };

  const filteredPayments = payments.filter(p => 
    p.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toString().includes(searchTerm)
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><CreditCard size={28} /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fee Collection</h1>
            <p className="text-sm text-gray-500">Manage school-wide payments</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg">
          <Plus size={20} /> Collect Fee
        </button>
      </div>

      {/* Stats and Table sections remain largely the same visually */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Recent Transactions</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Student..." 
              className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[11px] uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Class / Section / Roll</th>
                <th className="px-6 py-4">Fee Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400">Loading...</td></tr>
              ) : filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-700">{p.student_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold">{p.class_name}</span>
                      <span className="bg-gray-50 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold">{p.section_name}</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold">R: {p.roll_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{p.fee_name}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">TK {p.amount_paid}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => generateReceipt(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">New Payment</h2>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleCollect} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">1. Class</label>
                  <select 
                    className="w-full border rounded-xl p-3 bg-gray-50"
                    required
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                  >
                    <option value="">Choose Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">2. Section</label>
                  <select 
                    className="w-full border rounded-xl p-3 bg-gray-50 disabled:opacity-50"
                    required
                    disabled={!selectedClass}
                    value={selectedSection}
                    onChange={(e) => handleSectionChange(e.target.value)}
                  >
                    <option value="">Choose Section</option>
                    {sections
                      .filter(sec => Number(sec.school_class) === Number(selectedClass))
                      .map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)
                    }
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex justify-between">
                  3. Select Student {studentLoading && <Loader2 size={14} className="animate-spin text-blue-500" />}
                </label>
                <select 
                  className="w-full border rounded-xl p-3 bg-gray-50 disabled:opacity-50"
                  required
                  disabled={!selectedSection || studentLoading}
                  value={formData.student}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                >
                  <option value="">{selectedSection ? "Choose Student" : "Select class & section first"}</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} (Roll: {s.roll_number})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">4. Fee Type</label>
                <select 
                  className="w-full border rounded-xl p-3 bg-gray-50 disabled:opacity-50"
                  required
                  disabled={!formData.student}
                  value={formData.fee}
                  onChange={(e) => handleFeeSelect(e.target.value)}
                >
                  <option value="">Select Fee Type</option>
                  {filteredFees.map(f => <option key={f.id} value={f.id}>{f.name} (TK {f.amount})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Amount"
                  className="w-full border rounded-xl p-3 bg-gray-50 font-bold text-emerald-600"
                  required
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                />
                <select 
                  className="w-full border rounded-xl p-3 bg-gray-50"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                >
                  <option value="cash">Cash</option>
                  <option value="mfs">Mobile Banking</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={!formData.fee || studentLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:bg-gray-300"
              >
                Complete Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}