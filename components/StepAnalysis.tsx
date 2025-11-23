
import React, { useState } from 'react';
import { SimulationResult, TestItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine, 
  ComposedChart, Line, Legend, AreaChart, Area, Cell
} from 'recharts';
import { RefreshCw, RotateCcw, ArrowRight, Ruler, AlertTriangle, CheckCircle, Edit2, Save, Activity, Layers, BrainCircuit, BookOpen, Stethoscope, Share2, Network, GraduationCap } from 'lucide-react';

interface Props {
  results: SimulationResult | null;
  items: TestItem[];
  onItemsUpdate: (items: TestItem[]) => void;
  onReset: () => void;
  onNext: () => void;
}

const FactorStructureViz: React.FC<{ items: TestItem[], varianceExplained: number }> = ({ items, varianceExplained }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const width = 600;
  const height = 320;
  
  // Simulate multidimensionality if variance explained is low (< 50%)
  const isMultiFactor = varianceExplained < 50;

  const nodes: any[] = [];
  const links: any[] = [];

  if (!isMultiFactor) {
    // Single Factor Center
    nodes.push({ id: 'F1', x: width / 2, y: height / 2, r: 35, label: 'F1', type: 'factor', desc: 'Główny Konstrukt (Latentny)' });
    
    // Items circle
    items.forEach((item, i) => {
      const angle = (i / items.length) * 2 * Math.PI - (Math.PI / 2);
      const radius = 110;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      const loading = Math.min(0.95, Math.max(0.2, (item.discrimination || 0.5) / 2.5)); // Normalize
      
      nodes.push({ 
        id: item.id, x, y, r: 16, label: `${i+1}`, type: 'item', 
        desc: item.text, 
        loading 
      });
      links.push({ source: 'F1', target: item.id, strength: loading });
    });
  } else {
    // Two Factors Simulation
    const c1 = { x: width * 0.3, y: height / 2 };
    const c2 = { x: width * 0.7, y: height / 2 };
    
    nodes.push({ id: 'F1', x: c1.x, y: c1.y, r: 30, label: 'F1', type: 'factor', desc: 'Czynnik 1' });
    nodes.push({ id: 'F2', x: c2.x, y: c2.y, r: 30, label: 'F2', type: 'factor', desc: 'Czynnik 2' });
    
    links.push({ source: 'F1', target: 'F2', strength: 0.3, dashed: true, label: 'r=0.35' }); // Correlation

    items.forEach((item, i) => {
      const isF1 = i % 2 === 0; // Simulate split
      const center = isF1 ? c1 : c2;
      const loading = Math.min(0.95, Math.max(0.2, (item.discrimination || 0.5) / 2.5));

      // Fan layout logic
      const subsetSize = Math.ceil(items.length / 2);
      const subsetIdx = Math.floor(i / 2);
      const totalSpread = Math.PI * 1.4; // 252 degrees spread
      // Adjust start angles so fans face outwards
      const startAngle = isF1 ? Math.PI - (totalSpread/2) : 0 - (totalSpread/2);
      const angle = startAngle + (subsetIdx / (subsetSize - 1 || 1)) * totalSpread;
      
      const radius = 80 + (i % 2) * 20; // Vary radius slightly for organic look
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      
      nodes.push({ 
        id: item.id, x, y, r: 14, label: `${i+1}`, type: 'item', 
        desc: item.text, 
        loading 
      });
      links.push({ source: isF1 ? 'F1' : 'F2', target: item.id, strength: loading });
      
      // Cross loading simulation
      if (i % 5 === 0) {
         links.push({ source: isF1 ? 'F2' : 'F1', target: item.id, strength: 0.15, secondary: true });
      }
    });
  }

  return (
    <div className="w-full h-[320px] bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden select-none shadow-inner">
      <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur px-3 py-1.5 rounded-md text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
        {isMultiFactor ? 'Model Dwuczynnikowy (EFA/CFA)' : 'Model Jednoczynnikowy (EFA/CFA)'}
      </div>
      
      {hoveredNode && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-800/95 text-white px-4 py-3 rounded-xl text-xs shadow-2xl animate-slide-up pointer-events-none backdrop-blur-sm border border-slate-700">
           {(() => {
             const node = nodes.find(n => n.id === hoveredNode);
             return node ? (
               <div>
                 <div className="font-bold text-indigo-300 mb-0.5 text-sm">{node.type === 'factor' ? node.desc : `Pytanie nr ${node.label}`}</div>
                 {node.type === 'item' && <div className="italic opacity-90 mb-1">{node.desc}</div>}
                 {node.loading && (
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-slate-400 font-mono">Ładunek czynnikowy:</span>
                       <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden max-w-[100px]">
                          <div className="bg-indigo-500 h-full" style={{width: `${node.loading * 100}%`}}></div>
                       </div>
                       <span className="font-bold">{node.loading.toFixed(2)}</span>
                    </div>
                 )}
               </div>
             ) : null;
           })()}
        </div>
      )}

      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
           <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur stdDeviation="3" result="blur" />
             <feComposite in="SourceGraphic" in2="blur" operator="over" />
           </filter>
        </defs>

        {/* Links */}
        {links.map((link, i) => {
          const source = nodes.find(n => n.id === link.source);
          const target = nodes.find(n => n.id === link.target);
          if (!source || !target) return null;
          
          const strokeWidth = link.dashed ? 2 : Math.max(1, link.strength * 5);
          const opacity = link.secondary ? 0.2 : 0.5;
          
          return (
            <g key={i}>
              <line 
                x1={source.x} y1={source.y} 
                x2={target.x} y2={target.y} 
                stroke="#6366f1" 
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                strokeDasharray={link.dashed ? "5,5" : ""}
                strokeLinecap="round"
              />
              {link.label && (
                 <text 
                   x={(source.x + target.x)/2} 
                   y={(source.y + target.y)/2 - 8} 
                   textAnchor="middle" 
                   fill="#64748b" 
                   fontSize="10" 
                   fontWeight="bold"
                 >
                   {link.label}
                 </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isFactor = node.type === 'factor';
          const isHovered = hoveredNode === node.id;
          
          return (
            <g 
              key={node.id} 
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
              className="transition-all duration-300"
            >
              <circle 
                cx={node.x} cy={node.y} r={isFactor ? node.r : (isHovered ? node.r + 6 : node.r)} 
                fill={isFactor ? "#e0e7ff" : "white"}
                stroke={isFactor ? "#4338ca" : (node.loading > 0.4 ? "#4f46e5" : "#f59e0b")} 
                strokeWidth={isFactor ? 2 : (isHovered ? 3 : 2)}
                filter={isHovered ? "url(#glow)" : ""}
                className="transition-all duration-300 ease-out"
              />
              <text 
                x={node.x} y={node.y} dy={isFactor ? 5 : 4} 
                textAnchor="middle" 
                fontSize={isFactor ? 14 : 10} 
                fontWeight="bold" 
                fill={isFactor ? "#3730a3" : "#334155"}
                className="pointer-events-none"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const StepAnalysis: React.FC<Props> = ({ results, items, onItemsUpdate, onReset, onNext }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  if (!results) return null;

  const chartData = items.map((item, idx) => ({
    name: `Pyt ${idx + 1}`,
    difficulty: item.difficulty, 
    discrimination: item.discrimination,
    fullText: item.text
  }));

  const getReliabilityColor = (val: number) => {
    if (val >= 0.9) return 'text-emerald-600';
    if (val >= 0.7) return 'text-green-600';
    if (val >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const evaluateItem = (p?: number, rit?: number) => {
    if (p === undefined || rit === undefined) return { status: '?', color: 'text-slate-400', icon: null };
    const problems = [];
    if (p < 0.2) problems.push("Za trudne");
    if (p > 0.8) problems.push("Za łatwe");
    if (rit < 0.2) problems.push("Niska moc różnicująca");
    if (problems.length === 0) return { status: 'Dobra pozycja', color: 'text-green-600', icon: <CheckCircle size={14} /> };
    return { status: problems.join(", "), color: 'text-amber-600', icon: <AlertTriangle size={14} /> };
  };

  const startEditing = (item: TestItem) => {
    setEditingId(item.id);
    setEditValue(item.text);
  };

  const saveEditing = (id: string) => {
    const updatedItems = items.map(i => i.id === id ? { ...i, text: editValue } : i);
    onItemsUpdate(updatedItems);
    setEditingId(null);
  };

  const validityData = [
    { name: 'Zbieżna', value: results.convergentValidity, fill: '#10b981' },
    { name: 'Różnicowa', value: results.discriminantValidity, fill: '#f43f5e' }
  ];

  return (
    <div className="fade-in space-y-10">
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
        <h2 className="text-2xl font-bold text-indigo-900 mb-2">Krok 4: Analiza Psychometryczna</h2>
        <p className="text-indigo-700">
          Masz dane z symulacji. Teraz przeanalizujmy, czy test "działa". Skupimy się na trzech filarach: Rzetelności, Trafności Klinicznej i Strukturze Czynnikowej.
        </p>
      </div>

      {/* 1. RELIABILITY & ERROR SECTION */}
      <section>
         <div className="flex items-center gap-2 mb-4">
             <h3 className="text-lg font-bold text-slate-800">1. Rzetelność (Klasyczna Teoria Testów)</h3>
             <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">KTT / CTT</span>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Alfa Cronbacha</h3>
            <div className={`text-3xl font-extrabold ${getReliabilityColor(results.cronbachAlpha)}`}>
              {results.cronbachAlpha.toFixed(2)}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex justify-between">
              <span>Połówkowa:</span>
              <span className="font-mono font-bold">{results.splitHalfReliability.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-500"></div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Błąd Pomiaru (SEM)</h3>
            <div className="text-3xl font-extrabold text-slate-700">
              {results.sem}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex justify-between">
              <span>CI (95%):</span>
              <span className="font-mono font-bold">+/- {results.confidenceInterval}</span>
            </div>
          </div>

          {/* Educational Context Box */}
          <div className="col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
             <GraduationCap className="text-blue-500 shrink-0" size={24} />
             <div className="text-xs text-blue-800 space-y-1">
                <strong>Akademia Psychometrii: Co to jest Rzetelność?</strong>
                <p className="opacity-80">
                  Wyobraź sobie wagę łazienkową. Jeśli wchodzisz na nią 3 razy i pokazuje 70kg, 75kg, 68kg - jest nierzetelna. Rzetelność to powtarzalność pomiaru.
                </p>
                <p className="opacity-80 border-t border-blue-200 pt-1 mt-1">
                  <strong>Alfa Cronbacha</strong> mówi o spójności wewnętrznej: czy wszystkie pytania "grają do jednej bramki"? <br/>
                  <strong>SEM (Standard Error of Measurement)</strong> mówi, o ile punktów może mylić się Twój test. Im mniejszy błąd, tym lepiej.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* 2. CLINICAL VALIDITY SECTION */}
      <section className="border-t border-slate-200 pt-8">
        <div className="flex items-center gap-2 mb-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               2. Ocena Kliniczna i Trafność Kryterialna <Stethoscope size={20} className="text-rose-500" />
             </h3>
         </div>
         
         <div className="grid md:grid-cols-12 gap-6">
            {/* Clinical Chart */}
            <div className="md:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h4 className="text-sm font-bold text-slate-600 mb-4 flex justify-between">
                  <span>Różnicowanie Grup (Rozkład Wyników)</span>
                  <span className="text-xs font-normal bg-slate-100 px-2 py-1 rounded">Histogram (Słupki) + Gęstość (Obszar)</span>
               </h4>
               <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={results.groupComparison.distribution} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                      <defs>
                        <linearGradient id="gradControl" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="gradClinical" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="score" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Wynik Testu', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                      
                      {/* Left Axis: Density */}
                      <YAxis yAxisId="left" hide />
                      
                      {/* Right Axis: Frequency/Count */}
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        fontSize={10} 
                        tickFormatter={(val) => val.toFixed(0)} 
                        stroke="#94a3b8"
                        width={30}
                        label={{ value: 'Liczebność (N)', angle: -90, position: 'insideRight', fontSize: 10, fill: '#94a3b8' }}
                      />

                      <Tooltip 
                        labelFormatter={(v) => `Wynik: ${v}`} 
                        formatter={(value: number, name: string) => {
                          if (name.includes("Histogram")) return [Math.round(value), "Liczebność (osób)"];
                          if (name.includes("Rozkład")) return [value.toFixed(4), "Prawdopodobieństwo"];
                          return [value, name];
                        }}
                        contentStyle={{borderRadius: '8px', fontSize: '12px'}} 
                      />
                      
                      <Legend verticalAlign="top" height={36} iconType="circle"/>
                      
                      {/* Histograms (Bars) on Secondary Axis */}
                      <Bar isAnimationActive={true} animationDuration={1500} yAxisId="right" dataKey="controlFreq" name="Histogram (Kontrolna)" barSize={4} fill="#93c5fd" opacity={0.6} radius={[2, 2, 0, 0]} />
                      <Bar isAnimationActive={true} animationDuration={1500} yAxisId="right" dataKey="clinicalFreq" name="Histogram (Kliniczna)" barSize={4} fill="#fca5a5" opacity={0.6} radius={[2, 2, 0, 0]} />

                      {/* Density Curves (Areas) on Primary Axis */}
                      <Area isAnimationActive={true} animationDuration={2000} yAxisId="left" type="monotone" dataKey="controlDensity" stroke="#2563eb" strokeWidth={2} fill="url(#gradControl)" name="Rozkład (Kontrolna)" />
                      <Area isAnimationActive={true} animationDuration={2000} yAxisId="left" type="monotone" dataKey="clinicalDensity" stroke="#dc2626" strokeWidth={2} fill="url(#gradClinical)" name="Rozkład (Kliniczna)" />
                      
                    </ComposedChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Statistics Panel */}
            <div className="md:col-span-4 space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-bold text-slate-500">Wielkość Efektu (d-Cohena)</span>
                     <span className={`text-lg font-bold ${results.groupComparison.effectSize > 0.8 ? 'text-green-600' : 'text-amber-500'}`}>
                       {results.groupComparison.effectSize}
                     </span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                      <div className="bg-green-500 h-full rounded-full" style={{width: `${Math.min(100, results.groupComparison.effectSize * 50)}%`}}></div>
                   </div>

                   <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Test U (Manna-Whitneya):</span>
                        <span className="font-mono font-bold text-slate-800">{results.groupComparison.uValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Istotność (p-value):</span>
                        <span className={`font-mono font-bold ${results.groupComparison.pValue < 0.05 ? 'text-green-600' : 'text-red-500'}`}>
                          {results.groupComparison.pValue < 0.001 ? '< 0.001' : results.groupComparison.pValue.toFixed(3)}
                        </span>
                      </div>
                   </div>
                </div>

                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-xs text-rose-800">
                   <strong>Interpretacja Kliniczna:</strong>
                   <p className="mt-1 opacity-80">
                      {results.groupComparison.pValue < 0.05 
                        ? "Test istotnie statystycznie różnicuje osoby z grupy klinicznej od zdrowych. Można go używać jako narzędzia przesiewowego."
                        : "Brak istotnych różnic między grupami. Test ma niską wartość diagnostyczną w tym obszarze."}
                   </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800">
                   <strong className="flex items-center gap-1 mb-1"><GraduationCap size={14}/>Dlaczego Test U Manna-Whitneya?</strong>
                   <p className="opacity-80 leading-relaxed">
                     W psychologii klinicznej rozkłady wyników często nie są normalne (pacjenci mają skrajnie wysokie wyniki). Test U porównuje rangi, a nie średnie, co jest bezpieczniejsze statystycznie.
                   </p>
                </div>
            </div>
         </div>
      </section>

      {/* 3. STRUCTURAL VALIDITY & CFA */}
      <section className="border-t border-slate-200 pt-8">
         <div className="flex items-center gap-2 mb-4">
             <h3 className="text-lg font-bold text-slate-800">3. Trafność Teoretyczna (CFA & EFA)</h3>
         </div>
         <div className="grid md:grid-cols-3 gap-6">
             <div className="md:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <BrainCircuit size={18} className="text-indigo-600" /> Wskaźniki Dopasowania
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                       <div>
                          <span className="block text-xs font-bold text-slate-500">CFI</span>
                          <span className="text-[10px] text-slate-400">&gt; 0.90 (Dobry)</span>
                       </div>
                       <div className={`text-xl font-bold ${results.fitIndices.cfi > 0.9 ? 'text-green-600' : 'text-red-500'}`}>
                          {results.fitIndices.cfi}
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                       <div>
                          <span className="block text-xs font-bold text-slate-500">RMSEA</span>
                          <span className="text-[10px] text-slate-400">&lt; 0.08 (Błąd)</span>
                       </div>
                       <div className={`text-xl font-bold ${results.fitIndices.rmsea < 0.08 ? 'text-green-600' : 'text-red-500'}`}>
                          {results.fitIndices.rmsea}
                       </div>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-100 text-[10px] text-slate-600 leading-tight">
                    <strong className="block mb-1">Czym jest CFA?</strong>
                    Konfirmacyjna Analiza Czynnikowa sprawdza, czy struktura danych pasuje do Twojej teorii (Modelu). Jeśli RMSEA > 0.08, model źle opisuje rzeczywistość.
                </div>
             </div>

             <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex gap-3 mb-6">
                   <BookOpen className="text-indigo-400 shrink-0" size={24} />
                   <div>
                     <h4 className="text-sm font-bold text-slate-700 mb-1">Trafność Zbieżna i Różnicowa (MTMM)</h4>
                     <p className="text-xs text-slate-500 leading-relaxed">
                       Macierz wielu cech i wielu metod. Sprawdzamy, czy Twój test koreluje z tym, z czym powinien (Zbieżna), i nie koreluje z tym, z czym nie powinien (Różnicowa).
                     </p>
                   </div>
                </div>

                {/* Chart Visualisation */}
                <div className="h-40 w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart layout="vertical" data={validityData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 1]} hide />
                        <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 11}} interval={0} />
                        <Tooltip 
                           formatter={(value: number) => [value.toFixed(2), 'Korelacja (r)']} 
                           contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                        />
                        <ReferenceLine x={0.5} stroke="#cbd5e1" strokeDasharray="3 3" label={{ value: 'Min. Zbieżna', position: 'top', fontSize: 9, fill: '#94a3b8' }} />
                        <Bar isAnimationActive={true} animationDuration={1500} dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                           {validityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Educational Explanation Table */}
                <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
                    <div>
                       <div className="flex items-center gap-2 mb-1 font-bold text-emerald-700">
                          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Trafność Zbieżna
                       </div>
                       <p className="text-slate-500 mb-1">Oczekujemy <strong>wysokiej</strong> korelacji (&gt;0.5) z testami mierzącymi to samo.</p>
                       <div className="flex justify-between bg-emerald-50 p-2 rounded border border-emerald-100">
                          <span>Wynik:</span>
                          <span className="font-bold">{results.convergentValidity.toFixed(2)}</span>
                       </div>
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-1 font-bold text-rose-700">
                          <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Trafność Różnicowa
                       </div>
                       <p className="text-slate-500 mb-1">Oczekujemy <strong>niskiej</strong> korelacji (&lt;0.3) z innymi cechami.</p>
                       <div className="flex justify-between bg-rose-50 p-2 rounded border border-rose-100">
                          <span>Wynik:</span>
                          <span className="font-bold">{results.discriminantValidity.toFixed(2)}</span>
                       </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Variance Explained (EFA) & Factor Visualization */}
          <div className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Layers size={18} className="text-indigo-600" />
                  Wyjaśniona Wariancja (EFA)
                </h4>
                <span className={`text-2xl font-extrabold ${results.varianceExplained > 50 ? 'text-indigo-600' : 'text-amber-500'}`}>
                   {results.varianceExplained.toFixed(1)}%
                </span>
             </div>

             <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${results.varianceExplained > 50 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-orange-400 to-amber-500'}`}
                  style={{ width: `${Math.min(100, results.varianceExplained)}%` }}
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/50 left-[30%]" title="30% Minimum"></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/50 left-[50%]" title="50% Dobrze"></div>
             </div>
             <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-6">
                <span>0%</span>
                <span className="text-amber-600">30% (Słabo)</span>
                <span className="text-indigo-600">50% (Dobrze)</span>
                <span>100%</span>
             </div>
             
             {/* Factor Structure Interactive Graph */}
             <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <div className="px-4 py-3 bg-white border-b border-slate-200 flex justify-between items-center">
                   <h5 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                     <Network size={14} className="text-indigo-500" /> Wizualizacja Struktury Czynnikowej
                   </h5>
                   <div className="text-[10px] text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                     Interaktywne - Najedź kursorem
                   </div>
                </div>
                <div className="p-4">
                   <FactorStructureViz items={items} varianceExplained={results.varianceExplained} />
                </div>
                <div className="px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-500">
                   {results.varianceExplained > 50 
                     ? "Pojedynczy silny czynnik (F1) wyjaśnia większość wariancji. Struktura jest jednorodna." 
                     : "Niska wariancja sugeruje, że pozycje mogą grupować się w dwa odrębne podczynniki (F1 i F2). Test może być niejednorodny."}
                </div>
             </div>
          </div>
      </section>


      {/* 4. CHARTS & ITEM STATS */}
      <section className="border-t border-slate-200 pt-8">
         <h3 className="text-lg font-bold text-slate-800 mb-4">4. Statystyki Pozycji (IRT & CTT)</h3>
         <div className="grid md:grid-cols-2 gap-6 mb-6">
           {/* Item Analysis Chart */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Dyskryminacja vs Trudność</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis yAxisId="left" orientation="left" domain={[0, 1]} hide />
                    <YAxis yAxisId="right" orientation="right" domain={[-0.2, 1]} hide />
                    <Tooltip />
                    <Bar isAnimationActive={true} animationDuration={1500} yAxisId="left" dataKey="difficulty" fill="#94a3b8" name="Trudność (p)" barSize={20} radius={[4, 4, 0, 0]} />
                    <Line isAnimationActive={true} animationDuration={1500} yAxisId="right" type="monotone" dataKey="discrimination" stroke="#4f46e5" strokeWidth={2} name="Moc różnicująca" dot={{r:3}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* TIF Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-slate-500 uppercase">Funkcja Informacyjna (IRT)</h3>
                 <div className="group relative">
                    <BookOpen size={14} className="text-slate-400 cursor-help" />
                    <div className="absolute right-0 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg hidden group-hover:block z-10">
                       Pokazuje, dla jakiego poziomu cechy (Theta) test jest najbardziej precyzyjny.
                    </div>
                 </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.testInformation}>
                     <defs>
                       <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="theta" type="number" domain={[-3, 3]} fontSize={10} />
                     <Tooltip formatter={(v: number) => v.toFixed(2)} labelFormatter={(l) => `Theta: ${l}`} />
                     <Area isAnimationActive={true} animationDuration={1500} type="monotone" dataKey="info" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorInfo)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>
        </div>

        {/* Detailed Item Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-sm uppercase tracking-wide">
             Szczegóły Pozycji
           </div>
           <div className="overflow-x-auto max-h-[300px]">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-10">#</th>
                    <th className="px-4 py-3">Treść</th>
                    <th className="px-2 py-3 text-center" title="Trudność">p</th>
                    <th className="px-2 py-3 text-center" title="Moc Różnicująca">rit</th>
                    <th className="px-4 py-3 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const evalResult = evaluateItem(item.difficulty, item.discrimination);
                    const isEditing = editingId === item.id;
                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-400 text-xs">{idx+1}</td>
                        <td className="px-4 py-3 truncate max-w-[200px] relative group">
                           {isEditing ? (
                             <input 
                               type="text" 
                               value={editValue}
                               onChange={(e) => setEditValue(e.target.value)}
                               className="w-full p-1 border border-indigo-300 rounded text-xs"
                               autoFocus
                             />
                           ) : (
                             <span className={item.type === 'negative' ? 'text-slate-500 italic' : 'text-slate-700'}>
                               {item.text}
                             </span>
                           )}
                           {/* Status Icon */}
                           {!isEditing && evalResult.icon && (
                              <span className={`ml-2 inline-flex ${evalResult.color}`} title={evalResult.status}>
                                {evalResult.icon}
                              </span>
                           )}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-xs text-slate-600">{item.difficulty?.toFixed(2)}</td>
                        <td className={`px-2 py-3 text-center font-mono text-xs font-bold ${(item.discrimination || 0) < 0.3 ? 'text-red-500' : 'text-indigo-600'}`}>{item.discrimination?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                            {isEditing ? (
                               <button onClick={() => saveEditing(item.id)} className="p-1.5 text-green-600 bg-green-50 rounded"><Save size={14}/></button>
                            ) : (
                               <button onClick={() => startEditing(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><Edit2 size={14}/></button>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
             </table>
           </div>
        </div>
      </section>

      <div className="flex justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition"
        >
          <RotateCcw size={20} /> Reset
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200"
        >
          Dalej: Normy i Skale <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default StepAnalysis;
