// src/pages/Results/TermReports.jsx
import React from 'react';
import { Award } from 'lucide-react';

export default function TermReports() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-2xl shadow-sm border text-center">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="text-blue-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Term Reports & Marksheets</h1>
        <p className="text-gray-500 mt-2">
          This module is under construction. Soon you will be able to generate 
          PDF Marksheets and Tabulation sheets for the 1st, 2nd, and Final terms.
        </p>
      </div>
    </div>
  );
}