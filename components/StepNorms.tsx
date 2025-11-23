
import React, { useState, useEffect } from 'react';
import { SimulationResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, ReferenceArea } from 'recharts';
import { RefreshCw, Scale, Ruler, Sliders, Activity, GraduationCap, ShieldAlert, Target, Printer, FileText } from 'lucide-react';

interface Props {
  results: SimulationResult;
  onReset: () => void;
}

type ScaleType = 'sten' | 'stanine' | 'tscore' | 'tetron';

interface ScaleConfig {
  id: ScaleType;
  name: string;
  fullName: string;
  mean: number; // Mean of the standardized scale
  sd: number;   // SD of the standardized scale
  min: number;
  max: number;
  lowThreshold: number; // Upper bound of "Low"
  highThreshold: number; // Lower bound of "High"
  description: string;
  ranges: { low: string; avg: string; high: string };
}

const SCALES: Record<ScaleType, ScaleConfig> = {
  sten: {
    id: 'sten',
    name: 'Stenowa',
    fullName: 'Skala Stenowa (Standard Ten)',
    mean: 5.5,
    sd: 2,
    min: 1,
    max: 10,
    lowThreshold: 3, // 1-3
    highThreshold: 8, // 8-10
    description: "Skala 10-stopniowa. Używana powszechnie w diagnozie psychologicznej w Polsce. Średnia 5.5, SD 2.",
    ranges: { low: '1 - 3', avg: '4 - 7', high: '8 - 10' }
  },
  stanine: {
    id: 'stanine',
    name: 'Staninowa',
    fullName: 'Skala Staninowa (Standard Nine)',
    mean: 5,
    sd: 2,
    min: 1,
    max: 9,
    lowThreshold: 3, // 1-3
    highThreshold: 7, // 7-9
    description: "Skala 9-stopniowa. Nieco mniej precyzyjna na krańcach niż stenowa, ale łatwiejsza w interpretacji. Średnia 5, SD 2.",
    ranges: { low: '1 - 3', avg: '4 - 6', high: '7 - 9' }
  },
  tscore: {
    id: 'tscore',
    name: 'Tenowa (T)',
    fullName: 'Skala T (Tenowa)',
    mean: 50,
    sd: 10,
    min: 10,
    max: 90,
    lowThreshold: 39, // < 40
    highThreshold: 61, // > 60
    description: "Stosowana w testach klinicznych (np. MMPI). Pozwala na bardzo precyzyjne różnicowanie. Średnia 50, SD 10.",
    ranges: { low: '< 40', avg: '40 - 60', high: '> 60' }
  },
  tetron: {
    id: 'tetron',
    name: 'Tetronowa',
    fullName: 'Skala Tetronowa',
    mean: 10,
    sd: 4,
    min: 0,
    max: 20,
    lowThreshold: 6, // 0-6
    highThreshold: 14, // 14-20
    description: "Skala 21-stopniowa (0-20). Stosowana w psychologii pracy i doradztwie zawodowym. Średnia 10, SD 4.",
    ranges: { low: '0 - 6', avg: '7 - 13', high: '14 - 20' }
  }
};

const StepNorms: React.FC<Props> = ({ results, onReset }) => {
  const [userRawScore, setUserRawScore] = useState<number>(Math.round(results.meanScore));
  
  // Animation State
  const [targetScale, setTargetScale] = useState<ScaleType>('sten');
  const [visibleScale, setVisibleScale] = useState<ScaleType>('sten');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleScaleChange = (newScale: ScaleType) => {
    if (newScale === targetScale) return;
    
    setTargetScale(newScale);
    setIsAnimating(true);

    // Smooth transition delay
    setTimeout(() => {
        setVisibleScale(newScale);
        setIsAnimating(false);
    }, 300);
  };

  const handlePrint = () => {
    window.print();
  };

  const scale = SCALES[visibleScale];
  
  // Clinical Data
  const clinicalMean = results.groupComparison.clinicalGroupMean;
  const generalMean = results.meanScore;
  const sd = results.standardDeviation;

  // Calculate chart domain to fit both curves
  const overallMin = Math.min(generalMean, clinicalMean) - 3.5 * sd;
  const overallMax = Math.max(generalMean, clinicalMean) + 3.5 * sd;

  // Generate Bell Curve Data (Gaussian) for BOTH groups
  const data = [];
  const step = (overallMax - overallMin) / 80;

  for (let x = overallMin; x <= overallMax; x += step) {
    // General Population
    const yGen = (1 / (sd * Math.sqrt(2 * Math.PI))) * 
              Math.exp(-0.5 * Math.pow((x - generalMean) / sd, 2));
    
    // Clinical Group
    const yClin = (1 / (sd * Math.sqrt(2 * Math.PI))) * 
              Math.exp(-0.5 * Math.pow((x - clinicalMean) / sd, 2));

    data.push({ 
      x: parseFloat(x.toFixed(1)), 
      yGeneral: yGen,
      yClinical: yClin 
    });
  }

  // Convert Raw Score to Selected Scale Score
  const zScore = (userRawScore - results.meanScore) / results.standardDeviation;
  
  // Formula: ScaleMean + (Z * ScaleSD)
  const rawScaleScore = scale.mean + (zScore * scale.sd);
  const finalScore = Math.min(scale.max, Math.max(scale.min, Math.round(rawScaleScore)));

  // Confidence Interval Calculation (True Score Range)
  // 95% CI = Score +/- 1.96 * SEM
  const ciLower = Math.max(overallMin, userRawScore - results.confidenceInterval);
  const ciUpper = Math.min(overallMax, userRawScore + results.confidenceInterval);
  
  const getScoreDescription = (score: number, scaleCfg: ScaleConfig) => {
    if (score <= scaleCfg.lowThreshold) return "Wynik Niski";
    if (score >= scaleCfg.highThreshold) return "Wynik Wysoki";
    return "Wynik Przeciętny";
  };

  // Calculate boundaries for the chart specifically for the selected scale
  const zPoints = [-2, -1, 0, 1, 2];
  const boundaryLines = zPoints.map(z => ({
    x: results.meanScore + (z * results.standardDeviation),
    label: z === 0 ? 'Średnia' : `${z > 0 ? '+' : ''}${z}σ`
  }));

  return (
    <div className="fade-in space-y-8">
      
      {/* ---------------- SCREEN VIEW ---------------- */}
      <div className="print:hidden space-y-8">
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-900 mb-2">Krok 5: Normy i Skale</h2>
          <p className="text-indigo-700">
            W psychometrii "goły" wynik nie ma sensu. Musimy go odnieść do populacji (standaryzacja), aby wiedzieć, czy wynik jest typowy, czy skrajny.
          </p>
        </div>

        {/* Educational block */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600 flex gap-3">
             <GraduationCap className="text-indigo-500 shrink-0" size={24}/>
             <div>
                <strong>Akademia: Po co nam Steny?</strong>
                <p className="mt-1">
                  Wynik surowy (np. 15 punktów) nic nie mówi. Czy to dużo? Zależy od testu. 
                  Przeliczenie na steny (lub inną skalę) pozwala porównać wyniki różnych testów ze sobą.
                  Dzięki temu wiemy, że 8 sten to zawsze wynik wysoki (górne 10% populacji).
                </p>
             </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 flex gap-3">
             <ShieldAlert className="text-amber-600 shrink-0" size={24}/>
             <div>
                <strong>Błąd Standardowy (SEM) i Przedział Ufności</strong>
                <p className="mt-1">
                  Żaden test nie jest idealną linijką. Wynik, który widzisz (Otrzymany), różni się od Wyniku Prawdziwego o błąd pomiaru.
                  <br/>
                  Szary pas na wykresie to <strong>Przedział Ufności</strong>. Mówimy z 95% pewnością: "Prawdziwy wynik tej osoby leży gdzieś w tym pasie".
                </p>
             </div>
          </div>
        </div>

        {/* Scale Selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center justify-center">
           <span className="text-sm font-bold text-slate-500 flex items-center gap-2 mr-2">
             <Sliders size={16} /> Wybierz Skalę:
           </span>
           {(Object.keys(SCALES) as ScaleType[]).map((key) => (
              <button
                key={key}
                onClick={() => handleScaleChange(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  targetScale === key 
                    ? 'bg-indigo-600 text-white shadow-md scale-105' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {SCALES[key].name}
              </button>
           ))}
        </div>

        <div className={`grid md:grid-cols-3 gap-8 transition-all duration-300 ease-in-out transform ${
            isAnimating ? 'opacity-0 translate-y-4 scale-[0.98]' : 'opacity-100 translate-y-0 scale-100'
        }`}>
          
          {/* Interactive Input & Result */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Target size={20} className="text-indigo-500"/> Kalkulator: {scale.name}
              </h3>
              
              <label className="block text-sm text-slate-600 mb-2">Przesuń suwak (Wynik Surowy):</label>
              <input 
                type="range" 
                min={Math.floor(overallMin)} 
                max={Math.ceil(overallMax)} 
                value={userRawScore}
                onChange={(e) => setUserRawScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Min: {Math.floor(overallMin)}</span>
                <span className="font-bold text-slate-800 text-lg">{userRawScore} pkt</span>
                <span>Max: {Math.ceil(overallMax)}</span>
              </div>
              
              {/* Confidence Interval Viz */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                 <div className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1">
                    <ShieldAlert size={12} className="text-amber-500" /> Przedział Ufności (CI 95%)
                 </div>
                 <div className="relative h-8 bg-slate-100 rounded-md w-full mt-2 overflow-hidden border border-slate-200">
                    {/* CI Range */}
                    <div 
                      className="absolute top-0 h-full bg-slate-300/50 pattern-diagonal-lines"
                      style={{
                        left: `${Math.max(0, ((ciLower - overallMin) / (overallMax - overallMin)) * 100)}%`,
                        width: `${Math.min(100, ((ciUpper - ciLower) / (overallMax - overallMin)) * 100)}%`
                      }}
                      title="Obszar, w którym leży wynik prawdziwy"
                    ></div>
                    {/* Point Estimate */}
                    <div 
                      className="absolute top-0 h-full w-0.5 bg-indigo-600 z-10"
                      style={{
                        left: `${Math.max(0, ((userRawScore - overallMin) / (overallMax - overallMin)) * 100)}%`
                      }}
                    ></div>
                    
                    {/* Label underneath logic */}
                    <div className="absolute w-full top-2 flex justify-between px-2 pointer-events-none">
                       <span className="text-[9px] text-slate-500 font-mono" style={{
                           position: 'absolute',
                           left: `${Math.max(2, ((ciLower - overallMin) / (overallMax - overallMin)) * 100)}%`
                       }}>{ciLower.toFixed(1)}</span>
                       <span className="text-[9px] text-slate-500 font-mono" style={{
                           position: 'absolute',
                           left: `${Math.min(90, ((ciUpper - overallMin) / (overallMax - overallMin)) * 100)}%`
                       }}>{ciUpper.toFixed(1)}</span>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                   Gdybyśmy zbadali tę osobę nieskończenie wiele razy, 95% jej wyników wpadłoby w szary obszar.
                 </p>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl text-center shadow-lg transform transition-all hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/30"></div>
                <div className="text-xs uppercase tracking-widest opacity-80 mb-2">{scale.fullName}</div>
                <div className="text-6xl font-extrabold mb-1">{finalScore}</div>
                <div className="w-full h-px bg-white/20 my-3"></div>
                <div className="text-sm font-medium bg-white/20 py-1 px-4 rounded-full inline-block">
                  {getScoreDescription(finalScore, scale)}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl text-sm text-slate-600 space-y-3 border border-slate-200">
              <div className="flex items-start gap-3">
                <Ruler className="text-slate-400 mt-1 shrink-0" size={16} />
                <div>
                  <strong className="text-slate-800">{scale.fullName}</strong>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {scale.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-700 mb-2">Normy dla tej skali:</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center justify-between bg-white p-2 rounded border border-slate-100">
                    <span>Wyniki Niskie:</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{scale.ranges.low}</span>
                  </li>
                  <li className="flex items-center justify-between bg-white p-2 rounded border border-slate-100">
                    <span>Wyniki Przeciętne:</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{scale.ranges.avg}</span>
                  </li>
                  <li className="flex items-center justify-between bg-white p-2 rounded border border-slate-100">
                    <span>Wyniki Wysokie:</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{scale.ranges.high}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-2">
               <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase mb-1">Profil Diagnostyczny</h3>
                  <p className="text-xs text-slate-400">Porównanie wyniku badanego na tle populacji i grupy klinicznej</p>
               </div>
               <div className="text-right space-y-1">
                 <div className="flex items-center gap-2 text-xs font-medium text-blue-600 justify-end">
                    <span className="w-3 h-3 bg-blue-500 rounded-full opacity-50"></span> Populacja Ogólna
                 </div>
                 <div className="flex items-center gap-2 text-xs font-medium text-rose-500 justify-end">
                    <span className="w-3 h-3 bg-rose-500 rounded-full opacity-50"></span> Grupa Kliniczna
                 </div>
                 <div className="flex items-center gap-2 text-xs font-medium text-slate-500 justify-end">
                    <span className="w-3 h-3 bg-slate-300 rounded-sm"></span> Obszar niepewności (CI)
                 </div>
               </div>
             </div>
             
             <div className="flex-1 min-h-[350px] relative">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
                   <defs>
                     <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                     </linearGradient>
                     <linearGradient id="colorClin" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                   <XAxis 
                      dataKey="x" 
                      type="number" 
                      domain={[overallMin, overallMax]} 
                      tickCount={9} 
                      tickFormatter={(val) => val.toFixed(0)}
                      stroke="#94a3b8"
                      fontSize={12}
                      label={{ value: 'Wynik Surowy', position: 'insideBottom', offset: -10, fontSize: 10 }}
                    />
                   <YAxis hide />
                   <Tooltip 
                      content={() => null}
                      cursor={false}
                   />

                   {/* CI Reference Area (Shaded Zone) */}
                   <ReferenceArea 
                      x1={ciLower} 
                      x2={ciUpper} 
                      fill="#94a3b8" 
                      fillOpacity={0.2} 
                   />

                   <Area 
                      isAnimationActive={true}
                      animationDuration={2500}
                      type="monotone" 
                      dataKey="yGeneral" 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorGen)" 
                      name="Populacja"
                    />
                   <Area 
                      isAnimationActive={true}
                      animationDuration={2500}
                      type="monotone" 
                      dataKey="yClinical" 
                      stroke="#e11d48" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorClin)" 
                      name="Kliniczna"
                    />
                   
                   {/* Standard Deviation Reference Lines (Based on General Population) */}
                   {boundaryLines.map((b, idx) => (
                     <ReferenceLine 
                        key={idx} 
                        x={b.x} 
                        stroke="#cbd5e1" 
                        strokeDasharray="3 3" 
                     />
                   ))}

                   {/* User Position Line */}
                   <ReferenceLine 
                      x={userRawScore} 
                      stroke="#1e293b" 
                      strokeWidth={2} 
                      label={{ 
                        value: `TWÓJ WYNIK`, 
                        fill: '#1e293b', 
                        position: 'top',
                        fontWeight: 'bold',
                        fontSize: 12,
                      }} 
                   />
                 </AreaChart>
               </ResponsiveContainer>
               
               {/* Bottom Scale Legend */}
               <div className="absolute bottom-0 left-0 w-full flex justify-between px-[5%] text-[10px] font-bold text-slate-400 uppercase tracking-wider pointer-events-none border-t border-slate-100 pt-2">
                  <span className="w-1/3 text-left pl-4 text-indigo-300">Niskie ({scale.ranges.low})</span>
                  <span className="w-1/3 text-center text-indigo-400">Przeciętne ({scale.ranges.avg})</span>
                  <span className="w-1/3 text-right pr-4 text-indigo-300">Wysokie ({scale.ranges.high})</span>
               </div>
             </div>
             
             <div className="mt-4 p-4 bg-rose-50 rounded-lg text-xs text-rose-900 border border-rose-100 flex gap-2">
               <Activity size={16} className="shrink-0 text-rose-500" />
               <p>
                 <strong>Interpretacja Diagnostyczna:</strong> Czerwona krzywa to grupa kliniczna. Szary pas wokół Twojego wyniku to niepewność pomiaru.
                 Jeśli szary pas pokrywa się z czerwoną górą (grupą kliniczną), diagnoza jest bardzo prawdopodobna.
               </p>
             </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-slate-200">
           <button
             onClick={handlePrint}
             className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition"
           >
             <Printer size={18} /> Generuj Raport (PDF)
           </button>
           
           <button
             onClick={onReset}
             className="flex items-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-900 transition shadow-xl hover:shadow-2xl hover:-translate-y-1"
           >
             <RefreshCw size={20} /> Rozpocznij Nowy Projekt
           </button>
        </div>
      </div>

      {/* ---------------- PRINT VIEW (HIDDEN ON SCREEN) ---------------- */}
      <div className="hidden print:block p-8 bg-white text-black font-serif">
         <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
            <div>
               <h1 className="text-3xl font-bold text-slate-900">Raport Psychometryczny</h1>
               <p className="text-slate-600 mt-1">Podsumowanie właściwości narzędzia i diagnoza indywidualna</p>
            </div>
            <div className="text-right text-sm text-slate-500">
               <p>Data: {new Date().toLocaleDateString()}</p>
               <p>PsychoMetric Wiz v1.0</p>
            </div>
         </div>

         <div className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
               <FileText size={16}/> 1. Charakterystyka Narzędzia
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
               <div>
                  <span className="block font-bold text-slate-500 text-xs uppercase">Rzetelność (Alfa Cronbacha)</span>
                  <span className="text-lg font-semibold">{results.cronbachAlpha.toFixed(2)}</span>
               </div>
               <div>
                  <span className="block font-bold text-slate-500 text-xs uppercase">Błąd Standardowy (SEM)</span>
                  <span className="text-lg font-semibold">{results.sem.toFixed(2)} pkt</span>
               </div>
               <div>
                  <span className="block font-bold text-slate-500 text-xs uppercase">Trafność Zbieżna</span>
                  <span className="text-lg font-semibold">{results.convergentValidity.toFixed(2)}</span>
               </div>
               <div>
                  <span className="block font-bold text-slate-500 text-xs uppercase">Dopasowanie Modelu (CFI)</span>
                  <span className="text-lg font-semibold">{results.fitIndices.cfi.toFixed(2)}</span>
               </div>
            </div>
         </div>

         <div className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
               <Activity size={16}/> 2. Wynik Indywidualny
            </h2>
            <div className="bg-slate-50 p-6 rounded border border-slate-200">
               <div className="grid grid-cols-3 gap-6 text-center mb-6">
                  <div>
                     <p className="text-xs uppercase font-bold text-slate-500">Wynik Surowy</p>
                     <p className="text-2xl font-bold text-slate-800">{userRawScore} pkt</p>
                  </div>
                  <div className="border-l border-r border-slate-200">
                     <p className="text-xs uppercase font-bold text-slate-500">{scale.fullName}</p>
                     <p className="text-4xl font-extrabold text-indigo-900">{finalScore}</p>
                  </div>
                  <div>
                     <p className="text-xs uppercase font-bold text-slate-500">Interpretacja</p>
                     <p className="text-2xl font-bold text-slate-800">{getScoreDescription(finalScore, scale)}</p>
                  </div>
               </div>
               <div className="text-sm text-slate-600 border-t border-slate-200 pt-4">
                  <p className="mb-1"><strong>Przedział Ufności (95%):</strong> Prawdziwy wynik badanej osoby mieści się w zakresie <strong>{ciLower.toFixed(1)} - {ciUpper.toFixed(1)}</strong> punktów surowych.</p>
                  <p>Skala {scale.name} posiada średnią {scale.mean} i odchylenie standardowe {scale.sd}.</p>
               </div>
            </div>
         </div>

         <div className="mt-12 text-center text-xs text-slate-400">
            <p>Wygenerowano automatycznie w celach edukacyjnych.</p>
         </div>
      </div>

    </div>
  );
};

export default StepNorms;
