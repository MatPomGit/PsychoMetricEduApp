import React from 'react';
import { BrainCircuit } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">PsychoMetric</h1>
            <p className="text-xs text-slate-500">Panel konstrukcji testow</p>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            Wersja edukacyjna
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;