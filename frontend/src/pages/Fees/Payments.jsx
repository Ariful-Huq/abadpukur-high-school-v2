import { useEffect, useState } from "react";
import { getPayments, getFeeStructures, collectPayment } from "../../api/feesApi";
import { getStudents } from "../../api/studentsApi";
import { CreditCard, Plus, Search, FileText, Printer, X } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
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
      const [pRes, fRes, sRes] = await Promise.all([
        getPayments(),
        getFeeStructures(),
        getStudents() 
      ]);
      
      setPayments(pRes.data.results || pRes.data);
      setFeeTypes(fRes.data.results || fRes.data);
      setStudents(sRes.data.results || sRes.data);
    
    } catch (err) {
      console.error("Error loading fees data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (e) => {
    e.preventDefault();
    try {
      await collectPayment(formData);
      setShowModal(false);
      setFormData({ student: "", fee: "", amount_paid: "", payment_method: "cash", transaction_id: "" });
      fetchData(); 
      alert("Payment recorded successfully!");
    } catch (err) {
      alert("Error collecting payment");
    }
  };

  const generateReceipt = (payment) => {
    const doc = new jsPDF();
    
    // 1. Header (School Branding)
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("YOUR SCHOOL NAME", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("School Address, City, Bangladesh", 105, 26, { align: "center" });
    doc.text("Phone: +880 1234-567890", 105, 32, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);
  
    // 2. Receipt Info
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("FEE PAYMENT RECEIPT", 105, 48, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Receipt No: REC-${payment.id.toString().padStart(5, '0')}`, 20, 60);
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 150, 60);

    // 3. Student Details
    doc.autoTable({
      startY: 65,
      theme: 'grid',
      head: [['Student Information', 'Details']],
      body: [
        ['Student Name', payment.student_name || 'N/A'],
        ['Student ID', payment.student.toString()],
        ['Payment Method', payment.payment_method.toUpperCase()],
        ['Transaction ID', payment.transaction_id || 'N/A'],
      ],
      headStyles: { fillColor: [79, 70, 229] }, 
    });

    // 4. Payment Details
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      theme: 'striped',
      head: [['Description', 'Amount (TK)']],
      body: [
        [payment.fee_name || 'Fee Payment', payment.amount_paid],
      ],
      foot: [['TOTAL PAID', `TK ${payment.amount_paid}`]],
      headStyles: { fillColor: [31, 41, 55] },
      footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    // 5. Footer / Signatures
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.text("__________________________", 30, finalY);
    doc.text("Authorized Signature", 30, finalY + 5);
  
    doc.text("__________________________", 130, finalY);
    doc.text("Parent/Student Signature", 130, finalY + 5);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is a computer-generated receipt.", 105, finalY + 20, { align: "center" });

    doc.save(`Receipt_${payment.student_name}_${payment.id}.pdf`);
  };

  const filteredPayments = payments.filter(p => 
    (p.student_name && p.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.id.toString().includes(searchTerm)
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <CreditCard size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fee Management</h1>
            <p className="text-sm text-gray-500">Track and collect student payments</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Collect Fee
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Collected (This Month)</p>
          <h2 className="text-3xl font-black text-gray-800">TK {payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Recent Transactions</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search student or receipt..." 
              className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase font-bold">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Fee Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">Loading records...</td></tr>
              ) : filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-700">{p.student_name || `ID: ${p.student}`}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{p.fee_name || `Type: ${p.fee}`}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">TK {p.amount_paid}</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase">{p.payment_method}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => generateReceipt(p)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                      title="Download Receipt"
                    >
                      <Printer size={16} /> Receipt
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
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">New Payment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCollect} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Student</label>
                <select 
                  className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  value={formData.student}
                  onChange={(e) => setFormData({...formData, student: e.target.value})}
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} (Roll: {s.roll_number})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Fee Type</label>
                  <select 
                    className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    value={formData.fee}
                    onChange={(e) => setFormData({...formData, fee: e.target.value})}
                  >
                    <option value="">Select Fee</option>
                    {feeTypes.map(f => <option key={f.id} value={f.id}>{f.name} (TK {f.amount})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount Paid</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount"
                    className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Method</label>
                <select 
                  className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                >
                  <option value="cash">Cash</option>
                  <option value="mfs">Mobile Banking (bkash/Nagad)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                Submit Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}