import api from "./axios";

// Fee Structure (Categories like Tuition, Exam Fee)
export const getFeeStructures = () => api.get("fees/fees/");
export const createFeeStructure = (data) => api.post("fees/fees/", data);
export const updateFeeStructure = (id, data) => api.put(`fees/fees/${id}/`, data);
export const deleteFeeStructure = (id) => api.delete(`/fees/fees/${id}/`);

// Payments
export const getPayments = () => api.get("fees/payments/");
export const collectPayment = (data) => api.post("fees/payments/", data);

// Get payments for a specific student
export const getStudentPayments = (studentId) => api.get(`fees/payments/?student=${studentId}`);