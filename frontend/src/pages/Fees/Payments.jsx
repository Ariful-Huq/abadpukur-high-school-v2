import { useEffect, useState } from "react";
import { getPayments, getFeeStructures, collectPayment } from "../../api/feesApi";
import { getStudents } from "../../api/studentsApi";
import { getClasses } from "../../api/academicsApi";
import { CreditCard, Plus, Search, Printer, X, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [allFeeStructures, setAllFeeStructures] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedClass, setSelectedClass] = useState("");

  const [formData, setFormData] = useState({
    student: "",
    fee: "",
    amount_paid: "",
    payment_method: "cash",
    transaction_id: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, fRes, sRes, cRes] = await Promise.all([
        getPayments(),
        getFeeStructures(),
        getStudents(),
        getClasses()
      ]);

      setPayments(pRes.data.results || pRes.data);
      setAllFeeStructures(fRes.data.results || fRes.data);
      setStudents(sRes.data.results || sRes.data);
      setClasses(cRes.data.results || cRes.data);
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setFormData({ ...formData, student: "", fee: "", amount_paid: "" });
    setFilteredFees([]);
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    if (student) {
      const relevant = allFeeStructures.filter(f => 
        Number(f.school_class) === Number(selectedClass) || f.school_class === null
      );
      setFilteredFees(relevant);
      setFormData({ ...formData, student: studentId, fee: "", amount_paid: "" });
    }
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
      setFormData({ student: "", fee: "", amount_paid: "", payment_method: "cash", transaction_id: "" });
      fetchData();
      alert("Payment recorded successfully!");
    } catch (err) {
      alert("Error collecting payment");
    }
  };

  const generateReceipt = (payment) => {
    const studentDetail = students.find(s => s.id === payment.student);
    const fullName = studentDetail 
      ? `${studentDetail.first_name} ${studentDetail.last_name}` 
      : payment.student_name;

    const doc = new jsPDF();
    const logoUrl = "/logo.png"; // Ensure you have logo.png in your public folder
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      // Add PNG Logo
      doc.addImage(img, 'PNG', 15, 12, 18, 18);

      // Header Text
      doc.setFontSize(22);
      doc.setTextColor(31, 41, 55);
      doc.text("ABADPUKUR HIGH SCHOOL", 40, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Official Payment Receipt", 40, 28);

      // Table Data
      autoTable(doc, {
        startY: 40,
        theme: 'striped',
        head: [['Description', 'Details']],
        body: [
          ['Receipt No', `REC-${payment.id}`],
          ['Date', new Date(payment.payment_date).toLocaleDateString()],
          ['Student Name', fullName],
          ['Class', studentDetail?.class_name || 'N/A'],
          ['Section', studentDetail?.section_name || 'N/A'],
          ['Roll Number', studentDetail?.roll_number || 'N/A'],
          ['Fee Type', payment.fee_name || 'N/A'],
          ['Payment Method', payment.payment_method?.toUpperCase() || 'CASH'],
          ['Amount Paid', `TK ${payment.amount_paid}`],
        ],
        headStyles: {
          fillColor: [31, 41, 55],
          fontSize: 12,
          halign: 'center'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { halign: 'left' }
        },
        margin: { top: 40 }
      });

      const finalY = doc.lastAutoTable.finalY + 30;
      doc.line(140, finalY, 190, finalY);
      doc.setFontSize(10);
      doc.text("Authorized Signature", 165, finalY + 5, { align: "center" });

      doc.save(`Receipt_${fullName.replace(/\s+/g, '_')}_${payment.id}.pdf`);
    };

    img.onerror = () => {
      console.warn("Logo failed to load, generating receipt without it.");
      // Fallback layout if image missing
      doc.setFontSize(22);
      doc.text("ABADPUKUR HIGH SCHOOL", 105, 20, { align: "center" });
      // ... same autoTable logic ...
    };
  };

  // Process data for the UI Table
  const filteredPayments = payments.filter(p => 
    p.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toString().includes(searchTerm)
  ).map(p => {
    const detail = students.find(s => s.id === p.student);
    return { ...p, detail };
  });

  const selectedClassName = classes.find(c => Number(c.id) === Number(selectedClass))?.name;
  const filteredStudents = students.filter(s => 
    selectedClass ? s.class_name === selectedClassName : false
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><CreditCard size={28} /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fee Collection</h1>
            <p className="text-sm text-gray-500">Manage school-wide payments</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200">
          <Plus size={20} /> Collect Fee
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Collection</p>
          <h2 className="text-3xl font-black text-gray-800">TK {payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Recent Transactions</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Student or Receipt..." 
              className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase font-bold">
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Class / Section / Roll</th>
                <th className="px-6 py-4">Fee Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">Fetching records...</td></tr>
              ) : filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {p.detail ? `${p.detail.first_name} ${p.detail.last_name}` : p.student_name}
                  </td>
                  <td className="px-6 py-4">
                    {p.detail ? (
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold border border-blue-100 uppercase">{p.detail.class_name}</span>
                        <span className="bg-gray-50 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold border border-gray-100 uppercase">{p.detail.section_name}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-100">ROLL: {p.detail.roll_number}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No Details</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{p.fee_name}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">TK {p.amount_paid}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => generateReceipt(p)} title="Print Receipt" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">New Payment</h2>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            
            <form onSubmit={handleCollect} className="p-6 space-y-4">
              {/* Select Class */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">1. Select Class</label>
                <select 
                  className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                >
                  <option value="">Choose Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Select Student (Filtered) */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">2. Select Student</label>
                <select 
                  className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                  disabled={!selectedClass}
                  value={formData.student}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                >
                  <option value="">{selectedClass ? "Choose Student" : "Select a class first"}</option>
                  {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>

              {/* Fee Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">3. Fee Type</label>
                <select 
                  className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount Paid</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-xl p-3 bg-gray-50 font-bold text-emerald-600 outline-none"
                    required
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Method</label>
                  <select 
                    className="w-full border rounded-xl p-3 bg-gray-50 outline-none"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  >
                    <option value="cash">Cash</option>
                    <option value="mfs">Mobile Banking</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!formData.fee}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:shadow-none mt-2"
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